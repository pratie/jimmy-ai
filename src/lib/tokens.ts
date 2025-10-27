// src/lib/tokens.ts
// Precise tokenization utilities using js-tiktoken with local ranks (no network fetch)

import { Tiktoken } from 'js-tiktoken'
// @ts-ignore - default export is the ranks JSON structure (exported path)
import cl100k from 'js-tiktoken/ranks/cl100k_base'

let tokenizer: Tiktoken | null = null

function getTokenizer(): Tiktoken {
  if (!tokenizer) {
    tokenizer = new Tiktoken(cl100k)
  }
  return tokenizer
}

export function countTokens(text: string): number {
  try {
    if (!text) return 0
    const enc = getTokenizer()
    return enc.encode(text).length
  } catch {
    // Fallback heuristic: ~4 chars per token
    return Math.ceil((text || '').length / 4)
  }
}

export function countTokensArray(texts: string[]): number[] {
  const enc = getTokenizer()
  try {
    return texts.map((t) => (t ? enc.encode(t).length : 0))
  } catch {
    return texts.map((t) => Math.ceil((t || '').length / 4))
  }
}

export function groupByTokenBudget(items: string[], maxTokens: number): string[][] {
  const batches: string[][] = []
  let current: string[] = []
  let tokens = 0
  for (const s of items) {
    const t = countTokens(s)
    if (t > maxTokens) {
      if (current.length) {
        batches.push(current)
        current = []
        tokens = 0
      }
      batches.push([s])
      continue
    }
    if (tokens + t > maxTokens && current.length) {
      batches.push(current)
      current = [s]
      tokens = t
    } else {
      current.push(s)
      tokens += t
    }
  }
  if (current.length) batches.push(current)
  return batches
}
