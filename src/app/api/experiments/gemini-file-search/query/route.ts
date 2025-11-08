// POST /api/experiments/gemini-file-search/query
// Runs a Gemini model with the Google File Search tool.
// Body: { prompt: string, storeNames: string[], modelId?: string, metadataFilter?: string, topK?: number }

import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getGoogleFileSearchTool } from '@/lib/gemini-file-search'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const prompt: string = body.prompt
    const storeNames: string[] = body.storeNames
    const modelId: string = body.modelId || 'gemini-2.5-flash'
    const metadataFilter: string | undefined = body.metadataFilter
    const topK: number | undefined = body.topK

    if (!prompt || !Array.isArray(storeNames) || storeNames.length === 0) {
      return NextResponse.json({ error: 'prompt and storeNames are required' }, { status: 400 })
    }

    // Dynamic import to avoid compile issues if older ai-sdk/google is installed
    const { google }: any = await import('@ai-sdk/google')

    const tool = await getGoogleFileSearchTool(storeNames, { metadataFilter, topK })
    if (!tool) {
      return NextResponse.json(
        { error: 'google.tools.fileSearch() not available. Please update @ai-sdk/google to >= 2.0.29.' },
        { status: 400 }
      )
    }

    const { text, sources, providerMetadata } = await generateText({
      model: google(modelId),
      tools: { file_search: tool },
      prompt,
    })

    return NextResponse.json({ success: true, text, sources, providerMetadata })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Gemini file search failed' }, { status: 400 })
  }
}
