// src/lib/chunking.ts
// Text chunking for RAG knowledge base
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { countTokens } from './tokens'

// Remove base64 data URIs, huge code/asset blocks, and scripts/styles before chunking
export function sanitizeKnowledgeBase(input: string): string {
  if (!input) return ''
  let text = input

  // Drop <script> and <style> blocks entirely
  text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ')
  text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ')

  // Remove <img src="data:..."> tags
  text = text.replace(/<img[^>]*src=["']data:[^"']+["'][^>]*>/gi, ' ')

  // Remove bare data: URIs (base64 payloads)
  text = text.replace(/data:[^;\s]+;base64,[A-Za-z0-9+/=]{100,}/g, ' ')

  // Strip very large fenced code blocks (```...```)
  const FENCE_RE = /```[\s\S]*?```/g
  text = text.replace(FENCE_RE, (block) => (block.length > 3000 ? ' ' : block))

  // Remove super-long single lines (> 4000 chars) that often come from minified blobs
  text = text
    .split('\n')
    .map((line) => (line.length > 4000 ? '' : line))
    .join('\n')

  return text
}

/**
 * Text splitter configuration for chatbot knowledge base
 *
 * Settings:
 * - 1000 chars per chunk (optimized for fewer chunks, better context)
 * - 150 char overlap (preserves context at chunk boundaries)
 * - Smart separators (try splitting by paragraphs first, then sentences)
 *
 * OPTIMIZATION: Increased from 600 to 1000 to reduce chunk count by ~40%
 * This significantly speeds up embedding generation while maintaining quality
 */
export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
  // Add '' fallback for character-level split to avoid giant unbroken chunks
  separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''],
})

/**
 * Split long text into chunks for embedding
 * Used for: Processing Firecrawl scraped content or uploaded text files
 */
export async function chunkContent(content: string): Promise<string[]> {
  try {
    if (!content || content.trim().length === 0) {
      console.warn('[Chunking] Empty content provided')
      return []
    }

    // Sanitize first to remove heavy non-text payloads
    const sanitized = sanitizeKnowledgeBase(content)

    const cleanedContent = sanitized
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')

    console.log(`[Chunking] Processing ${cleanedContent.length} chars...`)

    const chunks = await textSplitter.splitText(cleanedContent)

    // Safety: force-slice any unusually large chunk to avoid exceeding embedding request limits
    const SAFETY_MAX_TOKENS_PER_CHUNK = 6000 // keep under 8192 per input
    const FORCE_SLICE_CHARS = 1500
    const FORCE_OVERLAP_CHARS = 200

    const normalized: string[] = []
    for (const ch of chunks) {
      const tokenCount = countTokens(ch)
      if (tokenCount > SAFETY_MAX_TOKENS_PER_CHUNK) {
        console.warn('[Chunking] Oversize chunk detected. Forcing slices:', { length: ch.length, tokenCount })
        let start = 0
        while (start < ch.length) {
          const end = Math.min(ch.length, start + FORCE_SLICE_CHARS)
          normalized.push(ch.slice(start, end))
          if (end >= ch.length) break
          start = Math.max(0, end - FORCE_OVERLAP_CHARS)
        }
      } else {
        normalized.push(ch)
      }
    }

    console.log(`[Chunking] ✅ Created ${normalized.length} chunks`)

    return normalized
  } catch (error) {
    console.error('[Chunking] Error:', error)
    throw error
  }
}

/**
 * Estimate chunk count for progress tracking
 */
export function estimateChunkCount(content: string): number {
  if (!content || content.trim().length === 0) return 0
  return Math.ceil(content.trim().length / 500)
}

/**
 * Validate content before chunking
 */
export function validateContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Content is empty' }
  }

  const MAX_SIZE = 50 * 1024 * 1024 // 50MB
  if (content.length > MAX_SIZE) {
    return { valid: false, error: 'Content too large. Max 50MB.' }
  }

  if (content.trim().length < 50) {
    return { valid: false, error: 'Content too short. Minimum 50 characters.' }
  }

  return { valid: true }
}
