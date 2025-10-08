// src/lib/chunking.ts
// Text chunking for RAG knowledge base
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

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
  separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' '],
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

    const cleanedContent = content
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')

    console.log(`[Chunking] Processing ${cleanedContent.length} chars...`)

    const chunks = await textSplitter.splitText(cleanedContent)

    console.log(`[Chunking] ✅ Created ${chunks.length} chunks`)

    return chunks
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

  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  if (content.length > MAX_SIZE) {
    return { valid: false, error: 'Content too large. Max 10MB.' }
  }

  if (content.trim().length < 50) {
    return { valid: false, error: 'Content too short. Minimum 50 characters.' }
  }

  return { valid: true }
}
