// src/lib/ai-models.ts
// Multi-provider AI model registry for Vercel AI SDK
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'

/**
 * Get AI model from string identifier with automatic provider detection
 *
 * Supports: OpenAI, Anthropic, Google (extensible to more providers)
 *
 * @param modelId - Model identifier (e.g., "gpt-4o", "claude-3-5-sonnet-20241022", "gemini-2.0-flash-exp")
 * @returns Model instance from appropriate provider
 *
 * @example
 * ```ts
 * const model = getModel('gpt-4o-mini')        // OpenAI
 * const model = getModel('claude-3-5-sonnet')  // Anthropic
 * const model = getModel('gemini-2.0-flash')   // Google
 * ```
 */
export function getModel(modelId: string) {
  // OpenAI models (gpt-*)
  if (modelId.startsWith('gpt-')) {
    return openai(modelId)
  }

  // Anthropic models (claude-*)
  if (modelId.startsWith('claude-')) {
    return anthropic(modelId)
  }

  // Google models (gemini-*, models/gemini-*)
  if (modelId.startsWith('gemini-') || modelId.startsWith('models/gemini-')) {
    return google(modelId)
  }

  // Future providers can be added here:
  // if (modelId.startsWith('grok-')) return xai(modelId)
  // if (modelId.startsWith('mistral-')) return mistral(modelId)

  // Default fallback to GPT-4o Mini
  console.warn(`[AI Models] Unknown model: ${modelId}, falling back to gpt-4o-mini`)
  return openai('gpt-4o-mini')
}

/**
 * Available models for UI dropdowns and model selection
 * Organized by provider with metadata
 */
export const AVAILABLE_MODELS = [
  // ===== OpenAI =====
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    description: 'Most capable GPT-4 model with vision support',
    costPer1MTokens: { input: 2.50, output: 10.00 },
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    contextWindow: 128000,
    description: 'Fast and affordable, great for most tasks',
    costPer1MTokens: { input: 0.15, output: 0.60 },
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    contextWindow: 128000,
    description: 'Previous generation flagship model',
    costPer1MTokens: { input: 10.00, output: 30.00 },
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    contextWindow: 16385,
    description: 'Fast and economical, legacy model',
    costPer1MTokens: { input: 0.50, output: 1.50 },
  },

  // ===== Anthropic =====
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    description: 'Best Claude model, excellent for complex reasoning',
    costPer1MTokens: { input: 3.00, output: 15.00 },
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    contextWindow: 200000,
    description: 'Fastest Claude model, great for simple tasks',
    costPer1MTokens: { input: 0.80, output: 4.00 },
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    contextWindow: 200000,
    description: 'Previous flagship, excellent writing quality',
    costPer1MTokens: { input: 15.00, output: 75.00 },
  },

  // ===== Google =====
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    contextWindow: 1000000,
    description: 'Experimental fast model with huge context window',
    costPer1MTokens: { input: 0.00, output: 0.00 }, // Free during preview
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    contextWindow: 2000000,
    description: 'Most capable Gemini model, 2M token context',
    costPer1MTokens: { input: 1.25, output: 5.00 },
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    contextWindow: 1000000,
    description: 'Fast and efficient with 1M token context',
    costPer1MTokens: { input: 0.075, output: 0.30 },
  },
] as const

/**
 * Type for model IDs (for type-safe model selection)
 */
export type ModelId = typeof AVAILABLE_MODELS[number]['id']

/**
 * Get model metadata by ID
 */
export function getModelMetadata(modelId: string) {
  return AVAILABLE_MODELS.find(m => m.id === modelId)
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: 'OpenAI' | 'Anthropic' | 'Google') {
  return AVAILABLE_MODELS.filter(m => m.provider === provider)
}

/**
 * Check if a model ID is valid
 */
export function isValidModel(modelId: string): boolean {
  return AVAILABLE_MODELS.some(m => m.id === modelId)
}
