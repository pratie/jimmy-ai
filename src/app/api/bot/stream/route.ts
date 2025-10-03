// Streaming API for main chatbot
// Route: /api/bot/stream

import { client } from '@/lib/prisma'
import { extractEmailsFromString } from '@/lib/utils'
import { truncateMarkdown } from '@/lib/firecrawl'
import { buildSystemPrompt } from '@/lib/promptBuilder'
import { searchKnowledgeBaseWithFallback, formatResultsForPrompt, hasTrainedEmbeddings } from '@/lib/vector-search'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
  timeout: 30000,
  maxRetries: 2,
})

export const maxDuration = 30

// Helper to store conversations
async function storeConversation(id: string, message: string, role: 'assistant' | 'user') {
  await client.chatRoom.update({
    where: { id },
    data: {
      message: {
        create: { message, role },
      },
    },
  })
}

export async function POST(req: Request) {
  const startTime = Date.now()
  try {
    const { domainId, chat, message, anonymousId } = await req.json()

    console.log('[Bot Stream] ⏱️  Request started:', { domainId, messageLength: message?.length, anonymousId })

    if (!domainId || !message || !Array.isArray(chat)) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Extract email if present (do this early)
    let customerEmail: string | undefined
    const extractedEmail = extractEmailsFromString(message)
    if (extractedEmail) {
      customerEmail = extractedEmail[0]
    }

    // ⚡ PARALLEL EXECUTION: Run DB query + embedding check at same time
    const parallelStartTime = Date.now()
    const dbQueryStart = Date.now()
    const embeddingCheckStart = Date.now()

    // Fetch domain config with hasEmbeddings flag (single query!)
    const chatBotDomain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        name: true,
        // filterQuestions removed - not used in stream route, kept in settings for future use
        chatBot: {
          select: {
            // knowledgeBase removed - only fetch if embeddings not trained (see below)
            mode: true,
            brandTone: true,
            language: true,
            hasEmbeddings: true, // ✅ New: Check embeddings status instantly
          },
        },
      },
    })

    console.log(`[Bot Stream]   └─ Domain query: ${Date.now() - dbQueryStart}ms`)

    const hasTrained = chatBotDomain?.chatBot?.hasEmbeddings || false

    console.log(`[Bot Stream] ✅ Parallel queries took: ${Date.now() - parallelStartTime}ms (max of both)`)

    if (!chatBotDomain) {
      return new Response(JSON.stringify({ error: 'Chatbot not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // RAG: Retrieve knowledge based on embeddings availability
    const ragStartTime = Date.now()
    let knowledgeBase: string

    if (hasTrained) {
      console.log('[Bot Stream] 🔍 Using RAG vector search')
      const vectorSearchStart = Date.now()
      const searchResults = await searchKnowledgeBaseWithFallback(message, domainId, 5)
      console.log(`[Bot Stream] ✅ Vector search took: ${Date.now() - vectorSearchStart}ms (found ${searchResults.length} chunks)`)
      knowledgeBase = formatResultsForPrompt(searchResults)
    } else {
      console.log('[Bot Stream] ⚠️  Using fallback: fetching truncated knowledge base (no embeddings trained)')
      // Only fetch knowledgeBase when embeddings aren't trained (rare case)
      const kbData = await client.chatBot.findUnique({
        where: { domainId: domainId },
        select: { knowledgeBase: true }
      })
      knowledgeBase = kbData?.knowledgeBase
        ? truncateMarkdown(kbData.knowledgeBase, 12000)
        : 'No knowledge base available yet. Please ask the customer to provide more details about their inquiry.'
    }
    console.log(`[Bot Stream] ✅ RAG retrieval took: ${Date.now() - ragStartTime}ms`)

    // Handle anonymous conversations
    let chatRoomId: string | undefined
    if (!customerEmail && anonymousId) {
      let anonymousChatRoom = await client.chatRoom.findFirst({
        where: {
          anonymousId: anonymousId,
          domainId: domainId,
          customerId: null,
        },
        select: {
          id: true,
          live: true,
        },
      })

      if (!anonymousChatRoom) {
        anonymousChatRoom = await client.chatRoom.create({
          data: {
            anonymousId: anonymousId,
            domainId: domainId,
          },
          select: {
            id: true,
            live: true,
          },
        })
      }

      chatRoomId = anonymousChatRoom.id

      // Store user message
      await storeConversation(chatRoomId, message, 'user')

      // If live mode, don't stream AI response
      if (anonymousChatRoom.live) {
        return new Response(
          JSON.stringify({
            error: 'Live mode active',
            live: true,
            chatRoom: chatRoomId
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Build system prompt
    const promptStartTime = Date.now()
    const systemPrompt = buildSystemPrompt({
      businessName: chatBotDomain.name,
      domain: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${domainId}`,
      knowledgeBase,
      mode: !customerEmail ? 'QUALIFIER' : (chatBotDomain.chatBot?.mode === 'SALES' || chatBotDomain.chatBot?.mode === 'SUPPORT' || chatBotDomain.chatBot?.mode === 'QUALIFIER' || chatBotDomain.chatBot?.mode === 'FAQ_STRICT' ? chatBotDomain.chatBot.mode : 'SUPPORT'),
      brandTone: chatBotDomain.chatBot?.brandTone || 'friendly, warm, conversational',
      language: chatBotDomain.chatBot?.language || 'en',
      qualificationQuestions: !customerEmail ? ['What is your email address so I can assist you better?'] : [],
      appointmentUrl: '',
      paymentUrl: '',
      portalBaseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${domainId}`,
      customerId: '',
    })
    console.log(`[Bot Stream] ✅ Prompt building took: ${Date.now() - promptStartTime}ms`)

    // Create streaming completion
    console.log('[Bot Stream] 🤖 Calling OpenAI API...')
    const llmStartTime = Date.now()
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chat,
        { role: 'user', content: message },
      ],
      stream: true,
    })

    // Create readable stream for response
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let firstTokenTime: number | null = null
          let tokenCount = 0

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              if (!firstTokenTime) {
                firstTokenTime = Date.now()
                console.log(`[Bot Stream] ⚡ First token received in: ${firstTokenTime - llmStartTime}ms (TTFT - Time To First Token)`)
              }
              tokenCount++
              fullResponse += content
              // Send as Server-Sent Events format
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }

          const totalTime = Date.now() - startTime
          const streamTime = Date.now() - llmStartTime
          console.log(`[Bot Stream] ✅ Stream completed: ${tokenCount} tokens in ${streamTime}ms`)
          console.log(`[Bot Stream] 📊 Total request time: ${totalTime}ms`)

          // Store complete AI response
          if (chatRoomId && fullResponse) {
            await storeConversation(chatRoomId, fullResponse, 'assistant')
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('[Bot Stream] ❌ Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('[Bot Stream] Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
