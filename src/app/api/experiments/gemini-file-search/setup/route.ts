// POST /api/experiments/gemini-file-search/setup
// Creates a file search store and optionally uploads text content.
// If `storeName` is provided, uploads to that store instead of creating a new one.
// Body: { displayName?: string, storeName?: string, text?: string, filename?: string, mimeType?: string }

import { NextRequest, NextResponse } from 'next/server'
import { createFileSearchStore, uploadTextToStore, getGeminiApiKey, uploadLocalFileToStore } from '@/lib/gemini-file-search'
import os from 'os'
import path from 'path'
import fs from 'fs/promises'
import { Buffer } from 'node:buffer'

export async function POST(req: NextRequest) {
  try {
    // Validate API key presence early
    getGeminiApiKey()

    const body = await req.json().catch(() => ({}))
    const displayName: string = body.displayName || 'chatdock_file_search_store'
    const existingStoreName: string | undefined = body.storeName
    const text: string | undefined = body.text
    const fileBase64: string | undefined = body.fileBase64
    const filename: string = body.filename || 'document.txt'
    const mimeType: string = body.mimeType || (fileBase64 ? 'application/octet-stream' : 'text/plain')

    const MAX_BYTES = 40 * 1024 * 1024 // 40 MB per file

    if (existingStoreName && !existingStoreName.startsWith('fileSearchStores/')) {
      throw new Error("Invalid storeName. Expected a full resource id like 'fileSearchStores/xyz'. Use the value returned by the create API.")
    }

    const store = existingStoreName
      ? { name: existingStoreName }
      : await createFileSearchStore(displayName)
    let upload: any = null

    // Upload path: prefer fileBase64, else text
    if (typeof fileBase64 === 'string' && fileBase64.length > 0) {
      // Accept raw base64 or data URL; strip prefix if present
      const match = fileBase64.match(/^data:[^;]+;base64,(.*)$/)
      const base64Payload = match ? match[1] : fileBase64
      // quick size guard (approximate bytes = 3/4 of base64 length)
      const approxBytes = Math.floor(base64Payload.length * 0.75)
      if (approxBytes > MAX_BYTES) {
        return NextResponse.json(
          { success: false, error: `File too large. Max 40MB per file.` },
          { status: 413 }
        )
      }
      // Write to tmp file and upload via SDK
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gfs-'))
      const filePath = path.join(tmpDir, filename)
      await fs.writeFile(filePath, base64Payload, 'base64')
      try {
        upload = await uploadLocalFileToStore(store.name!, filePath, mimeType)
      } finally {
        try { await fs.unlink(filePath) } catch {}
        try { await fs.rmdir(tmpDir) } catch {}
      }
    } else if (typeof text === 'string' && text.trim().length > 0) {
      const bytes = Buffer.byteLength(text, 'utf8')
      if (bytes > MAX_BYTES) {
        return NextResponse.json(
          { success: false, error: `Text too large. Max 40MB per file.` },
          { status: 413 }
        )
      }
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
