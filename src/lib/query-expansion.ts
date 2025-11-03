// Query expansion using Vercel AI SDK (OpenAI provider)
// Generates alternative phrasings to improve RAG recall

import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

// Simple in-memory cache to reduce latency/cost for repeated queries
type CacheEntry = { variations: string[]; expires: number }
const CACHE = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const CACHE_CAPACITY = 500

const ExpansionSchema = z.object({
  variations: z.array(z.string()).min(1).max(6),
})

function getCache(key: string): string[] | null {
  const entry = CACHE.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    CACHE.delete(key)
    return null
  }
  // LRU: refresh recency
  CACHE.delete(key)
  CACHE.set(key, entry)
  return entry.variations
}

function setCache(key: string, variations: string[]) {
  if (CACHE.size >= CACHE_CAPACITY) {
    const firstKey = CACHE.keys().next().value
    if (firstKey) CACHE.delete(firstKey)
  }
  CACHE.set(key, { variations, expires: Date.now() + CACHE_TTL_MS })
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('query expansion timeout')), ms)
    p.then((v) => {
      clearTimeout(t)
      resolve(v)
    }).catch((e) => {
      clearTimeout(t)
      reject(e)
    })
  })
}

/**
 * Expand a user query into several semantically-close variations.
 * Returns up to `count` variations (not including the original).
 * Skips expansion for very short inputs.
 */
export async function expandQuery(
  userQuery: string,
  count: number = 3,
  timeoutMs: number = 3000  // Increased to 3000ms for reliability under load
): Promise<string[]> {
  const q = (userQuery || '').trim()

  // Log query details
  console.log(`[Query Expansion] 📝 Query: "${q}" (length: ${q.length})`)

  if (!q || q.length < 3) {  // Lowered from 6 to 3 characters
    console.log('[Query Expansion] ⚠️  Query too short, skipping expansion')
    return []
  }

  const cacheKey = `${q.toLowerCase()}::${count}`
  const cached = getCache(cacheKey)
  if (cached) {
    console.log(`[Query Expansion] ✅ Cache hit! Returning ${cached.length} variations`)
    return cached.slice(0, count)
  }

  console.log(`[Query Expansion] 🔄 Generating ${count} variations (timeout: ${timeoutMs}ms)...`)

  try {
    const result = await withTimeout(
      generateObject({
        model: openai('gpt-4o-mini'),
        schema: ExpansionSchema,
        // Keep instructions concise; JSON-mode avoids brittle parsing
        prompt: `Generate ${count} alternative ways to ask the same question.
Return concise, natural-language phrasings that preserve intent.
User query: "${q}"`,
        // Keep response small and fast
        maxOutputTokens: 120,
      }) as Promise<{ object: { variations: string[] } }>,
      timeoutMs
    )

    const variations = (result.object?.variations || [])
      .map((s) => String(s || '').trim())
      .filter((s) => s.length > 0)
      .slice(0, count)

    console.log(`[Query Expansion] ✅ Generated ${variations.length} variations:`)
    variations.forEach((v, i) => console.log(`[Query Expansion]   ${i + 1}. "${v}"`))

    setCache(cacheKey, variations)
    return variations
  } catch (e) {
    // On any failure, fall back to no expansion
    console.error('[Query Expansion] ❌ Failed:', e instanceof Error ? e.message : String(e))
    return []
  }
}
