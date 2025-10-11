// Test endpoint for AI SDK 5 - Simple chat with streamText()
// Route: /api/chat-test

import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    console.log('[Chat Test] 🧪 AI SDK 5 test request:', {
      messageCount: messages?.length,
      model: 'gpt-4o-mini'
    })

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // AI SDK 5 streamText() - replaces 50+ lines of manual streaming!
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      system: 'You are a helpful AI assistant for BookmyLead AI. Be friendly and concise.',
      temperature: 0.7,
    })

    console.log('[Chat Test] ✅ Stream initialized successfully')

    // Return streaming response (handles SSE automatically)
    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error('[Chat Test] ❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
