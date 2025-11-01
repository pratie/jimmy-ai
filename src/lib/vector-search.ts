// src/lib/vector-search.ts
// Vector similarity search using Supabase pgvector
import { generateEmbedding, generateEmbeddings } from './embeddings'
import { client } from './prisma'
import { devLog, devError } from './utils'
import { expandQuery } from './query-expansion'
import { rerankChunks } from './jina-reranker'

export interface SearchResult {
  id: string
  content: string
  similarity: number
  sourceType: string
  sourceUrl: string | null
}

/**
 * Search knowledge base using vector similarity (RAG retrieval)
 * This is the CORE function that retrieves relevant chunks for chatbot responses
 *
 * @param query - User's question/message
 * @param domainId - Domain ID to search within (scoped to specific chatbot)
 * @param limit - Number of top results to return (default: 5)
 * @param threshold - Minimum similarity score 0-1 (default: 0.65)
 * @returns Array of most relevant knowledge chunks
 */
export async function searchKnowledgeBase(
  query: string,
  domainId: string,
  limit: number = 5,
  threshold: number = 0.65
): Promise<SearchResult[]> {
  try {
    devLog(`[RAG] Searching knowledge base...`)

    // Step 1: Convert user query to embedding vector
    const embedding = await generateEmbedding(query)

    // Step 2: Search Supabase using pgvector cosine similarity
    // Calls RPC function: match_knowledge_chunks
    const results = await client.$queryRaw<SearchResult[]>`
      SELECT * FROM match_knowledge_chunks(
        ${embedding}::vector,
        ${threshold}::float,
        ${limit}::int,
        ${domainId}::text
      )
    `

    devLog(`[RAG] ✅ Found ${results.length} relevant chunks`)

    // Log similarity scores for debugging (only in dev - no PII)
    if (results.length > 0) {
      results.forEach((r, i) => {
        devLog(`[RAG]   ${i + 1}. Similarity: ${(r.similarity * 100).toFixed(1)}%`)
      })
    }

    return results
  } catch (error) {
    devError('[RAG] Vector search error:', error)
    // Return empty array on error (chatbot will fall back to raw knowledge base)
    return []
  }
}

/**
 * Search with fallback strategy
 * If no results found with primary threshold, retry with lower threshold
 */
export async function searchKnowledgeBaseWithFallback(
  query: string,
  domainId: string,
  limit: number = 5
): Promise<SearchResult[]> {
  // Use 30% similarity threshold (0.3) - single attempt
  const results = await searchKnowledgeBase(query, domainId, limit, 0.3)

  if (results.length === 0) {
    devLog('[RAG] No results found - will use fallback knowledge base')
  }

  return results
}

/**
 * Multi-query RAG retrieval with expansion + parallel searches + Jina reranking.
 * - Expands the original query to N variations (JSON-mode) → total M queries.
 * - Batch embeds queries → parallel pgvector searches.
 * - Dedup by chunk id.
 * - Rerank with original query via Jina (if configured) → top K.
 * - Falls back to vector similarity order when reranker unavailable or fails.
 */
export async function searchKnowledgeBaseMultiQuery(
  userQuery: string,
  domainId: string,
  chunksPerQuery: number = 5,
  finalTopN: number = 3
): Promise<SearchResult[]> {
  const start = Date.now()
  devLog('[Multi-RAG] start')

  // 1) Expand query (best-effort; on failure → no expansion)
  const expansionStart = Date.now()
  let variations: string[] = []
  try {
    variations = await expandQuery(userQuery, 3, 3000)  // Increased to 3000ms for reliability
  } catch (e) {
    devError('[Multi-RAG] expansion failed:', e)
    variations = []
  }
  const allQueries = [userQuery, ...variations]
  const expansionTime = Date.now() - expansionStart

  if (variations.length > 0) {
    devLog('[Multi-RAG] ✅ expansion ms=%d queries=%d (1 original + %d variations)',
      expansionTime, allQueries.length, variations.length)
  } else {
    devLog('[Multi-RAG] ⚠️  expansion ms=%d queries=%d (no variations generated)',
      expansionTime, allQueries.length)
  }

  // 2) Batch embeddings for all queries
  const embedStart = Date.now()
  let embeddings: number[][]
  try {
    embeddings = await generateEmbeddings(allQueries)
  } catch (e) {
    devError('[Multi-RAG] embedding error, fallback to single', e)
    // Fallback to single-query retrieval
    return await searchKnowledgeBase(userQuery, domainId, finalTopN, 0.3)
  }
  devLog('[Multi-RAG] embed ms=%d', Date.now() - embedStart)

  // 3) Parallel vector searches for each query embedding
  const searchStart = Date.now()
  const perQueryResults = await Promise.all(
    embeddings.map((embedding, idx) =>
      client.$queryRaw<SearchResult[]>`
        SELECT * FROM match_knowledge_chunks(
          ${embedding}::vector,
          ${0.3}::float,
          ${chunksPerQuery}::int,
          ${domainId}::text
        )
      `.then((rows) => {
        devLog('[Multi-RAG] q%d rows=%d', idx + 1, rows.length)
        return rows
      }).catch((e) => {
        devError('[Multi-RAG] q%d search error', idx + 1, e)
        return [] as SearchResult[]
      })
    )
  )
  devLog('[Multi-RAG] search ms=%d', Date.now() - searchStart)

  // 4) Dedup by id only (no content-level dedup per request)
  const flat = perQueryResults.flat()
  const byId = new Map<string, SearchResult>()
  for (const r of flat) {
    if (!byId.has(r.id)) byId.set(r.id, r)
  }
  const unique = Array.from(byId.values())
  if (unique.length === 0) {
    devLog('[Multi-RAG] no results after dedup')
    return []
  }

  // 5) Rerank using Jina (optional). If reranker not configured/failed, fallback to vector order
  const rerankStart = Date.now()
  try {
    const input = unique.map((c) => ({ id: c.id, content: c.content }))
    devLog('[Multi-RAG] 🔄 Sending %d chunks to Jina reranker...', input.length)
    const reranked = await rerankChunks(userQuery, input, Math.min(finalTopN, unique.length), 2000)  // Increased to 2000ms

    if (reranked.length > 0) {
      devLog('[Multi-RAG] ✅ Reranker returned %d chunks', reranked.length)
      const idSet = new Set(reranked.map((r) => r.id))
      // Keep reranked order and map to original results; if reranker returns less than topN, fill with vector-order
      const topFromRerank = reranked
        .map((r) => byId.get(r.id)!)
        .filter(Boolean)

      if (topFromRerank.length < finalTopN) {
        for (const r of unique.sort((a, b) => b.similarity - a.similarity)) {
          if (topFromRerank.length >= finalTopN) break
          if (!idSet.has(r.id)) topFromRerank.push(r)
        }
      }

      devLog('[Multi-RAG] ✅ rerank ms=%d', Date.now() - rerankStart)
      devLog('[Multi-RAG] ✅ total ms=%d', Date.now() - start)
      return topFromRerank.slice(0, finalTopN)
    } else {
      devLog('[Multi-RAG] ⚠️  Reranker returned 0 results, using vector order')
    }
  } catch (e) {
    devError('[Multi-RAG] ❌ reranker error, using vector order:', e)
  }

  // Fallback: top by original vector similarity
  const fallback = unique.sort((a, b) => b.similarity - a.similarity).slice(0, finalTopN)
  devLog('[Multi-RAG] ⚠️  total ms=%d (vector-order fallback)', Date.now() - start)
  return fallback
}

/**
 * Format search results for inclusion in chatbot prompt
 * Converts array of chunks into formatted string
 */
export function formatResultsForPrompt(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant information found in knowledge base.'
  }

  return results
    .map((chunk, index) => {
      const source = chunk.sourceUrl ? ` (Source: ${chunk.sourceUrl})` : ''
      return `[Context ${index + 1}]${source}\n${chunk.content}`
    })
    .join('\n\n---\n\n')
}

/**
 * Get count of chunks for a domain (for UI display)
 */
export async function getKnowledgeChunkCount(domainId: string): Promise<number> {
  try {
    const count = await client.knowledgeChunk.count({
      where: { domainId }
    })
    return count
  } catch (error) {
    devError('[RAG] Error getting chunk count:', error)
    return 0
  }
}

/**
 * Check if domain has trained embeddings
 */
export async function hasTrainedEmbeddings(domainId: string): Promise<boolean> {
  const count = await getKnowledgeChunkCount(domainId)
  return count > 0
}
