// Streaming API for landing page preview sandbox chatbot
// Route: /api/bot/preview/stream

import { streamText } from 'ai'
import { getModel } from '@/lib/ai-models'
import { devLog, devError } from '@/lib/utils'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { message, chat, context, title } = await req.json()

    devLog('[Preview Stream] ⏱️ Request started')

    if (!message || !Array.isArray(chat) || typeof context !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build standard sandbox system prompt using the parsed context
    const businessName = title || 'your website'
    const systemPrompt = `
[SYSTEM SANDBOX PREVIEW v1]

You are a highly capable AI Assistant for the website ${businessName}.
Answer ONLY with information grounded in the Scraped Site Context below.

If the user asks for anything outside the Scraped Site Context, politely guide them back or mention that in the full version of the app, this would automatically alert a human agent to take over the chat.

--- SCRAPED SITE CONTEXT ---
${context}
--- END CONTEXT ---

--- BRAND VOICE & STYLE ---
Tone: professional, helpful, conversational, friendly.
Language: auto-detect from user query, default to English.

--- RULES (CRITICAL) ---
- Keep answers concise (2–4 sentences) to keep the chat fast.
- Ground all facts in the Scraped Site Context. Do not invent pricing, features, or details not written there.
- Respect that you are in "Sandbox Preview Mode".
- After 3 chat turns, encourage the user to launch a live chatbot on their own site by clicking the checkout or setup buttons!
- End with simple, helpful emojis.
    `.trim()

    // Select a fast, high-quality preview model
    // gemini-2.5-flash-lite is perfect for ultra-low latency
    const previewModel = 'gemini-2.5-flash-lite'
    const model = getModel(previewModel)

    devLog('[Preview Stream] 🤖 Calling AI API... Model:', previewModel)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chat,
      { role: 'user', content: message },
    ]

    const result = streamText({
      model: model as any,
      messages: messages as any,
      temperature: 0.5,
      maxOutputTokens: 800,
    })

    // Custom Server-Sent Events (SSE) stream formatting to match client expectations
    const encoder = new TextEncoder()
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const textPart of result.textStream) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: textPart })}\n\n`)
            )
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          devError('[Preview Stream] ❌ Stream error:', error)
          try { controller.error(error) } catch (_) {}
        }
      },
    })

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    devError('[Preview Stream] Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Failed to stream response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
