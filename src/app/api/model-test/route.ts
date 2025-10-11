// Model comparison endpoint - demonstrates AI SDK 5 flexibility
// Route: /api/model-test

import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, model = 'gpt-4o-mini' } = await req.json()

    console.log(`[Model Test] 🎯 Using model: ${model}`)

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ✨ THE MAGIC: Just change the model parameter!
    // That's literally the ONLY line you need to change to swap models
    const result = streamText({
      model: openai(model), // 🎯 Model selection happens here
      messages,
      system: 'You are a helpful AI assistant for BookmyLead AI. Be creative and concise.',
      temperature: 0.7,
    })

    console.log(`[Model Test] ✅ Streaming with ${model}`)

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('[Model Test] ❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
