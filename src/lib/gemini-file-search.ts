// Lightweight helpers to experiment with Google Gemini File Search
// This module is optional and only used by experimental API routes.

import os from 'os'
import path from 'path'
import fs from 'fs/promises'

type UploadOperation = any

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY')
  }
  return key
}

async function getGoogleGenAI(): Promise<any> {
  try {
    const mod = await import('@google/genai')
    // The SDK exports GoogleGenAI
    return mod
  } catch (err) {
    throw new Error('Missing @google/genai dependency. Run: npm i @google/genai')
  }
}

// Create a file search store
export async function createFileSearchStore(displayName: string) {
  const { GoogleGenAI } = await getGoogleGenAI()
  const client = new GoogleGenAI({ vertexai: false, apiKey: getGeminiApiKey() })
  const api: any = (client as any).fileSearchStores
  if (!api || typeof api.create !== 'function') {
    throw new Error("@google/genai is missing 'fileSearchStores.create'. Please update to the latest @google/genai version.")
  }
  const store = await api.create({
    config: { displayName },
  })
  return store // contains .name like 'fileSearchStores/xxxx'
}

// Upload a local file path to a store
export async function uploadLocalFileToStore(
  storeName: string,
  filePath: string,
  mimeType: string
): Promise<UploadOperation> {
  const { GoogleGenAI } = await getGoogleGenAI()
  const client = new GoogleGenAI({ vertexai: false, apiKey: getGeminiApiKey() })
  const api: any = (client as any).fileSearchStores
  if (!api || typeof api.uploadToFileSearchStore !== 'function') {
    throw new Error("@google/genai is missing 'fileSearchStores.uploadToFileSearchStore'. Please update to the latest @google/genai version.")
  }
  let operation = await api.uploadToFileSearchStore({
    fileSearchStoreName: storeName,
    file: filePath,
    config: { mimeType },
  })

  // Poll operation completion (basic)
  while (operation.done !== true) {
    await new Promise((r) => setTimeout(r, 1000))
    operation = await client.operations.get({ operation })
  }
  return operation
}

// Upload raw text content by writing it to a tmp file (server-only)
export async function uploadTextToStore(
  storeName: string,
  text: string,
  filename: string = 'document.txt',
  mimeType: string = 'text/plain'
): Promise<UploadOperation> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gfs-'))
  const filePath = path.join(tmpDir, filename)
  await fs.writeFile(filePath, text, 'utf8')
  try {
    const op = await uploadLocalFileToStore(storeName, filePath, mimeType)
    return op
  } finally {
    // best-effort cleanup
    try { await fs.unlink(filePath) } catch {}
    try { await fs.rmdir(tmpDir) } catch {}
  }
}

// Return the google file search tool instance for AI SDK if available
export async function getGoogleFileSearchTool(
  storeNames: string[],
  opts?: { metadataFilter?: string; topK?: number }
): Promise<any | null> {
  try {
    const mod: any = await import('@ai-sdk/google')
    const google = mod.google
    if (!google?.tools?.fileSearch) return null
    const args: any = { fileSearchStoreNames: storeNames }
    if (opts?.metadataFilter) args.metadataFilter = opts.metadataFilter
    if (typeof opts?.topK === 'number') args.topK = opts.topK
    return google.tools.fileSearch(args)
  } catch {
    return null
  }
}
