// src/lib/vector-search.ts
// Vector similarity search using Supabase pgvector
import { generateEmbedding } from './embeddings'
import { client } from './prisma'
import { devLog, devError } from './utils'

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
