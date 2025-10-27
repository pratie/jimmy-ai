// src/lib/embeddings.ts
// OpenAI Embeddings for RAG - text-embedding-3-small
import OpenAI from 'openai'
import { devLog, devError } from '@/lib/utils'
import { countTokens } from './tokens'

// Create OpenAI client (same setup as your chatbot)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate a single embedding for text
 * Used for: User queries in chatbot (real-time retrieval)
 * Model: text-embedding-3-small (1536 dimensions, $0.02/1M tokens)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Clean input: remove newlines, normalize whitespace
    const input = text.replaceAll('\n', ' ').trim()

    if (!input || input.length === 0) {
      throw new Error('Cannot generate embedding for empty text')
    }

    devLog('[Embeddings] Generating single embedding...')

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: input,
      encoding_format: 'float',
    })

    const embedding = response.data[0].embedding

    devLog(`[Embeddings] ✅ Generated single embedding (${embedding.length} dimensions)`)
    return embedding
  } catch (error) {
    devError('[Embeddings] Error generating single embedding:', error)
    throw error
  }
}

/**
 * Generate multiple embeddings in one API call (batch processing)
 * Used for: Creating knowledge base chunks (during training)
 * More efficient than calling generateEmbedding() in a loop
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    if (!texts || texts.length === 0) {
      throw new Error('Cannot generate embeddings for empty array')
    }

    // Clean all inputs
    const inputs = texts
      .map((text) => text.replaceAll('\n', ' ').trim())
      .filter((text) => text.length > 0) // Remove empty strings

    if (inputs.length === 0) {
      throw new Error('All texts are empty after cleaning')
    }

    devLog(`[Embeddings] Generating batch of ${inputs.length} embeddings...`)

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: inputs,
      encoding_format: 'float',
    })

    const embeddings = response.data.map((item) => item.embedding)

    devLog(`[Embeddings] ✅ Generated ${embeddings.length} embeddings (${embeddings[0].length} dimensions each)`)
    return embeddings
  } catch (error) {
    devError('[Embeddings] Error generating batch embeddings:', error)
    throw error
  }
}

/**
 * Estimate token count for embedding cost calculation
 * Rough estimate: ~4 chars = 1 token for English text
 */
export function estimateTokens(text: string): number {
  return countTokens(text)
}

/**
 * Estimate cost for embeddings
 * text-embedding-3-small: $0.02 per 1M tokens
 */
export function estimateCost(texts: string[]): number {
  const totalTokens = texts.reduce((sum, text) => sum + estimateTokens(text), 0)
  const costPer1M = 0.02
  return (totalTokens / 1_000_000) * costPer1M
}
