// POST /api/experiments/gemini-file-search/setup
// Creates a file search store and optionally uploads text content.
// If `storeName` is provided, uploads to that store instead of creating a new one.
// Body: { displayName?: string, storeName?: string, text?: string, filename?: string, mimeType?: string }

import { NextRequest, NextResponse } from 'next/server'
import { createFileSearchStore, uploadTextToStore, getGeminiApiKey } from '@/lib/gemini-file-search'

export async function POST(req: NextRequest) {
  try {
    // Validate API key presence early
    getGeminiApiKey()

    const body = await req.json().catch(() => ({}))
    const displayName: string = body.displayName || 'chatdock_file_search_store'
    const existingStoreName: string | undefined = body.storeName
    const text: string | undefined = body.text
    const filename: string = body.filename || 'document.txt'
    const mimeType: string = body.mimeType || 'text/plain'

    if (existingStoreName && !existingStoreName.startsWith('fileSearchStores/')) {
      throw new Error("Invalid storeName. Expected a full resource id like 'fileSearchStores/xyz'. Use the value returned by the create API.")
    }

    const store = existingStoreName
      ? { name: existingStoreName }
      : await createFileSearchStore(displayName)
    let upload: any = null
    if (typeof text === 'string' && text.trim().length > 0) {
      upload = await uploadTextToStore(store.name!, text, filename, mimeType)
    }

    return NextResponse.json(
      {
        success: true,
        store,
        upload,
        hint: 'Copy store.name and use it in the query API.'
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to setup Gemini File Search' },
      { status: 400 }
    )
  }
}
