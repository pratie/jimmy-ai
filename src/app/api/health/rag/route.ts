// Health check endpoint for RAG pipeline
// GET /api/health/rag

import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    timestamp: new Date().toISOString(),
    services: {
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        status: 'unknown'
      },
      jina: {
        configured: !!process.env.JINA_API_KEY,
        status: 'unknown'
      },
      database: {
        configured: !!process.env.DATABASE_URL,
        status: 'unknown'
      }
    },
    features: {
      queryExpansion: !!process.env.OPENAI_API_KEY,
      reranking: !!process.env.JINA_API_KEY,
      vectorSearch: !!process.env.DATABASE_URL
    }
  }

  // Quick ping tests (optional - don't run on every request in prod)
  // Add actual API health checks here if needed

  const allConfigured =
    health.services.openai.configured &&
    health.services.jina.configured &&
    health.services.database.configured

  return NextResponse.json(health, {
    status: allConfigured ? 200 : 503
  })
}
