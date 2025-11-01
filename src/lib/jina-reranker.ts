// Jina reranker v2 client
// Reranks candidate chunks against the original user query

import axios from 'axios'

export interface RerankInputChunk {
  id: string
  content: string
}

export interface RerankedItem {
  id: string
  score: number
}

/**
 * Rerank a list of chunks using Jina Reranker v2 (multilingual).
 * Returns topN chunk ids with scores in descending order.
 */
export async function rerankChunks(
  originalQuery: string,
  chunks: RerankInputChunk[],
  topN: number = 3,
  timeoutMs: number = 2000  // Increased to 2000ms
): Promise<RerankedItem[]> {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    console.log('[Reranker] ⚠️  No chunks provided')
    return []
  }

  const apiKey = process.env.JINA_API_KEY
  if (!apiKey) {
    console.log('[Reranker] ⚠️  JINA_API_KEY not configured, skipping reranking')
    return []
  }

  console.log(`[Reranker] 🔄 Reranking ${chunks.length} chunks (top_n: ${topN}, timeout: ${timeoutMs}ms)`)

  try {
    const resp = await axios.post(
      'https://api.jina.ai/v1/rerank',
      {
        model: 'jina-reranker-v2-base-multilingual',
        query: originalQuery,
        top_n: Math.min(topN, chunks.length),
        documents: chunks.map((c) => c.content),
        return_documents: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: timeoutMs,
        validateStatus: (s) => s >= 200 && s < 500, // treat 4xx as handled error
      }
    )

    if (!resp.data || !Array.isArray(resp.data.results)) {
      console.error('[Reranker] ❌ Invalid API response structure')
      return []
    }

    console.log(`[Reranker] ✅ API returned ${resp.data.results.length} results (status: ${resp.status})`)

    // Map results: each item has { index, relevance_score } (note: snake_case from Jina API)
    const out: RerankedItem[] = []
    for (const r of resp.data.results) {
      console.log(`[Reranker] Processing result:`, JSON.stringify(r))

      const idx = typeof r.index === 'number' ? r.index : undefined
      // Jina API uses 'relevance_score' (snake_case), not 'relevanceScore' (camelCase)
      const score = typeof r.relevance_score === 'number' ? r.relevance_score : undefined

      if (idx === undefined) {
        console.error('[Reranker] ❌ Missing index in result')
        continue
      }
      if (score === undefined) {
        console.error('[Reranker] ❌ Missing relevanceScore in result')
        continue
      }
      if (idx < 0 || idx >= chunks.length) {
        console.error(`[Reranker] ❌ Index ${idx} out of bounds (chunks.length: ${chunks.length})`)
        continue
      }

      console.log(`[Reranker] ✅ Mapped index ${idx} to chunk ID: ${chunks[idx].id.substring(0, 8)}... (score: ${score.toFixed(3)})`)
      out.push({ id: chunks[idx].id, score })
    }
    // Ensure sorted by score desc
    out.sort((a, b) => b.score - a.score)
    const final = out.slice(0, Math.min(topN, out.length))

    console.log(`[Reranker] ✅ Returning ${final.length} reranked chunks:`)
    final.forEach((item, i) => {
      console.log(`[Reranker]   ${i + 1}. Score: ${item.score.toFixed(3)} (ID: ${item.id.substring(0, 8)}...)`)
    })

    return final
  } catch (e) {
    // On network/timeout or server error, skip reranking
    console.error('[Reranker] ❌ Error:', e instanceof Error ? e.message : String(e))
    return []
  }
}
