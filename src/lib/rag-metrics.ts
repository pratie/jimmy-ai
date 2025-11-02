// Production-safe RAG metrics logging
// Logs performance metrics without exposing PII

export interface RagMetrics {
  queryExpansionTime: number
  queryExpansionCount: number
  embeddingTime: number
  searchTime: number
  rerankTime: number
  totalTime: number
  totalChunks: number
  uniqueChunks: number
  finalChunks: number
  cacheHit: boolean
  rerankSuccess: boolean
  fallbackUsed: boolean
}

export function logRagMetrics(metrics: RagMetrics) {
  // Always log in production - contains NO PII
  console.log('[RAG Metrics]', JSON.stringify({
    timestamp: new Date().toISOString(),
    ...metrics,
    // Add these for monitoring dashboards
    expansionEnabled: metrics.queryExpansionCount > 1,
    expansionLatency: metrics.queryExpansionTime,
    rerankLatency: metrics.rerankTime,
    totalLatency: metrics.totalTime,
    efficiency: metrics.finalChunks / metrics.totalChunks,
  }))
}
