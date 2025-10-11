// Test endpoint for AI SDK 5 - Claude (Anthropic)
// Route: /api/chat-claude

import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    console.log('[Claude Test] 📥 Request received')
    const { messages } = await req.json()

    console.log('[Claude Test] 🤖 AI SDK 5 Claude test request:', {
      messageCount: messages?.length,
      lastMessage: messages?.[messages.length - 1]?.content,
      model: 'claude-3-5-sonnet-20241022',
      hasApiKey: !!process.env.ANTHROPIC_API_KEY
    })

    if (!messages || !Array.isArray(messages)) {
      console.log('[Claude Test] ❌ Invalid messages array')
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Claude Test] 🚀 Calling streamText with Claude...')
    // AI SDK 5 streamText() with Claude
    const result = streamText({
      model: anthropic('claude-3-5-sonnet-20241022'), // Latest Claude model
      messages,
      system: 'You are Claude, a helpful AI assistant for BookmyLead AI. Be friendly and concise.',
      temperature: 0.7,
    })

    console.log('[Claude Test] ✅ Stream initialized successfully')

    // Return streaming response (handles SSE automatically)
    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('[Claude Test] ❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
