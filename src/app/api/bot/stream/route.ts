// Streaming API for main chatbot
// Route: /api/bot/stream

import { client } from '@/lib/prisma'
import { extractEmailsFromString } from '@/lib/utils'
import { truncateMarkdown } from '@/lib/firecrawl'
import { buildSystemPrompt } from '@/lib/promptBuilder'
import { searchKnowledgeBaseWithFallback, formatResultsForPrompt, hasTrainedEmbeddings } from '@/lib/vector-search'
import { getPlanLimits, shouldResetCredits, getNextResetDate } from '@/lib/plans'
import OpenAI from 'openai'

// --- Minimal in-memory LRU cache for domain config ---
type DomainConfig = {
  name: string
  userId?: string | null
  chatBot: {
    mode: string | null
    brandTone: string | null
    language: string | null
    hasEmbeddings: boolean | null
  } | null
}

const DOMAIN_CACHE_TTL_MS = 60_000 // 60 seconds
const DOMAIN_CACHE_CAPACITY = 100
const domainCache = new Map<string, { value: DomainConfig; expires: number }>()

// Simple metrics for cache hits/misses (global + per-domain)
let cacheHits = 0
let cacheMisses = 0
const domainCacheStats = new Map<string, { hits: number; misses: number }>()

function recordCacheStat(domainId: string, hit: boolean) {
  const stat = domainCacheStats.get(domainId) || { hits: 0, misses: 0 }
  if (hit) {
    cacheHits++
    stat.hits++
  } else {
    cacheMisses++
    stat.misses++
  }
  domainCacheStats.set(domainId, stat)
}

function getDomainFromCache(domainId: string): DomainConfig | undefined {
  const entry = domainCache.get(domainId)
  if (!entry) return undefined
  if (Date.now() > entry.expires) {
    domainCache.delete(domainId)
    return undefined
  }
  // LRU update: reinsert to refresh recency
  domainCache.delete(domainId)
  domainCache.set(domainId, entry)
  return entry.value
}

function setDomainInCache(domainId: string, value: DomainConfig) {
  // Trim if over capacity
  if (domainCache.size >= DOMAIN_CACHE_CAPACITY) {
    const firstKey = domainCache.keys().next().value
    if (firstKey) domainCache.delete(firstKey)
  }
  domainCache.set(domainId, { value, expires: Date.now() + DOMAIN_CACHE_TTL_MS })
}

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

    // ⚡ Domain config: use in-memory cache to avoid repeated DB round-trips
    const parallelStartTime = Date.now()
    const dbQueryStart = Date.now()
    let chatBotDomain = getDomainFromCache(domainId)
    let cacheHit = false

    if (!chatBotDomain) {
      const found = await client.domain.findUnique({
        where: { id: domainId },
        select: {
          name: true,
          userId: true,
          chatBot: {
            select: {
              mode: true,
              brandTone: true,
              language: true,
              hasEmbeddings: true,
            },
          },
        },
      })

      if (found) {
        chatBotDomain = found as DomainConfig
        setDomainInCache(domainId, chatBotDomain)
      }
      recordCacheStat(domainId, false)
      console.log(`[Bot Stream]   └─ Domain query: ${Date.now() - dbQueryStart}ms`)
    } else {
      cacheHit = true
      recordCacheStat(domainId, true)
      console.log('[Bot Stream]   └─ Domain query: 0ms (cache hit)')
    }

    // CHECK MESSAGE CREDITS BEFORE RESPONDING
    if (chatBotDomain && chatBotDomain.userId) {
      const billing = await client.billings.findUnique({
        where: { userId: chatBotDomain.userId },
        select: {
          plan: true,
          messageCredits: true,
          messagesUsed: true,
          messagesResetAt: true,
        }
      })

      if (billing) {
        // Check if credits should reset
        if (shouldResetCredits(billing.messagesResetAt)) {
          const limits = getPlanLimits(billing.plan)
          await client.billings.update({
            where: { userId: chatBotDomain.userId },
            data: {
              messagesUsed: 0,
              messageCredits: limits.messageCredits,
              messagesResetAt: getNextResetDate()
            }
          })
          console.log('[Bot Stream] 🔄 Credits reset for new billing period')
        } else {
          // Check if user has credits remaining
          if (billing.messagesUsed >= billing.messageCredits) {
            console.log('[Bot Stream] ❌ Message limit reached')
            return new Response(
              JSON.stringify({
                error: 'Message limit reached',
                message: 'This chatbot has reached its monthly message limit. Please contact the website owner to upgrade their plan.',
                limitReached: true,
                plan: billing.plan
              }),
              {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }
        }
      }
    }

    const hasTrained = !!(chatBotDomain?.chatBot?.hasEmbeddings)

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

    // ═══════════════════════════════════════════════════════════
    // CONVERSATION STATE MANAGEMENT: Handle both customer & anonymous users
    // ═══════════════════════════════════════════════════════════
    let chatRoomId: string | undefined
    let isLiveMode = false

    if (customerEmail) {
      // ──────────────────────────────────────────────────────────
      // CUSTOMER FLOW: Email provided (new or returning customer)
      // ──────────────────────────────────────────────────────────
      console.log('[Bot Stream] 📧 Customer email detected:', customerEmail)

      try {
        // 1. Find existing customer first
        let customer = await client.customer.findFirst({
          where: {
            email: customerEmail,
            domainId: domainId
          },
          select: {
            id: true,
            chatRoom: {
              select: {
                id: true,
                live: true,
                mailed: true
              }
            }
          }
        })

        // 2. Create customer if doesn't exist (with proper error handling for race conditions)
        if (!customer) {
          try {
            customer = await client.customer.create({
              data: {
                email: customerEmail,
                domainId: domainId
              },
              select: {
                id: true,
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                    mailed: true
                  }
                }
              }
            })
          } catch (createError: any) {
            // Handle race condition: another request created the customer simultaneously
            if (createError.code === 'P2002') {
              console.log('[Bot Stream] 🔄 Race condition detected - customer created by concurrent request')
              // Retry findFirst to get the customer that was just created
              customer = await client.customer.findFirst({
                where: {
                  email: customerEmail,
                  domainId: domainId
                },
                select: {
                  id: true,
                  chatRoom: {
                    select: {
                      id: true,
                      live: true,
                      mailed: true
                    }
                  }
                }
              })
            } else {
              throw createError
            }
          }
        }

        if (!customer) {
          throw new Error('Failed to create or find customer')
        }

        console.log('[Bot Stream] ✅ Customer found/created:', customer.id)

        // 3. Check for anonymous history to link
        if (anonymousId) {
          const anonymousChatRoom = await client.chatRoom.findFirst({
            where: {
              anonymousId: anonymousId,
              domainId: domainId,
              customerId: null
            },
            select: {
              id: true,
              live: true
            }
          })

          if (anonymousChatRoom) {
            console.log('[Bot Stream] 🔗 Linking anonymous chat history:', anonymousChatRoom.id)

            // Link anonymous chat to customer (atomic update)
            await client.chatRoom.update({
              where: { id: anonymousChatRoom.id },
              data: {
                customerId: customer.id,
                anonymousId: null
              }
            })

            chatRoomId = anonymousChatRoom.id
            isLiveMode = anonymousChatRoom.live
          }
        }

        // 4. Get or create customer chat room (if no anonymous history linked)
        if (!chatRoomId) {
          if (customer.chatRoom && customer.chatRoom.length > 0) {
            // Returning customer - use existing chat room
            chatRoomId = customer.chatRoom[0].id
            isLiveMode = customer.chatRoom[0].live
            console.log('[Bot Stream] 🔄 Returning customer, using existing chat room:', chatRoomId)
          } else {
            // New customer - create chat room
            const newChatRoom = await client.chatRoom.create({
              data: {
                customerId: customer.id,
                domainId: domainId
              },
              select: {
                id: true,
                live: true
              }
            })
            chatRoomId = newChatRoom.id
            isLiveMode = newChatRoom.live
            console.log('[Bot Stream] 🆕 New customer, created chat room:', chatRoomId)
          }
        }

        // 5. Store user message
        await storeConversation(chatRoomId, message, 'user')

        // 6. Check if live mode is active
        if (isLiveMode) {
          console.log('[Bot Stream] 👤 Live mode active - human agent will respond')
          return new Response(
            JSON.stringify({
              error: 'Live mode active',
              live: true,
              chatRoom: chatRoomId
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }

      } catch (error: any) {
        console.error('[Bot Stream] ❌ Customer handling error:', error)

        // Fallback: Continue with anonymous flow if customer creation fails
        // This prevents total failure - conversation still works
        console.log('[Bot Stream] ⚠️  Falling back to anonymous mode due to error')
        customerEmail = undefined // Clear email to trigger anonymous flow below
      }
    }

    if (!customerEmail && anonymousId) {
      // ──────────────────────────────────────────────────────────
      // ANONYMOUS FLOW: No email provided yet
      // ──────────────────────────────────────────────────────────
      console.log('[Bot Stream] 👤 Anonymous user:', anonymousId)

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
        console.log('[Bot Stream] 🆕 Created anonymous chat room:', anonymousChatRoom.id)
      }

      chatRoomId = anonymousChatRoom.id
      isLiveMode = anonymousChatRoom.live

      // Store user message
      await storeConversation(chatRoomId, message, 'user')

      // If live mode, don't stream AI response
      if (isLiveMode) {
        console.log('[Bot Stream] 👤 Live mode active - human agent will respond')
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
          let ttft = 0

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
          ttft = (firstTokenTime ?? llmStartTime) - llmStartTime
          console.log(`[Bot Stream] ✅ Stream completed: ${tokenCount} tokens in ${streamTime}ms`)
          console.log(`[Bot Stream] 📊 Total request time: ${totalTime}ms`)

          // Small metrics line
          const stats = domainCacheStats.get(domainId) || { hits: 0, misses: 0 }
          const globalRatio = (cacheHits + cacheMisses) > 0 ? (cacheHits / (cacheHits + cacheMisses)) : 0
          const domainRatio = (stats.hits + stats.misses) > 0 ? (stats.hits / (stats.hits + stats.misses)) : 0
          console.log('[Metrics] domainId=%s cache=%s ttftMs=%d streamMs=%d totalMs=%d domainHits=%d domainMisses=%d domainHitRatio=%.2f globalHitRatio=%.2f',
            domainId,
            cacheHit ? 'hit' : 'miss',
            ttft,
            streamTime,
            totalTime,
            stats.hits,
            stats.misses,
            domainRatio,
            globalRatio
          )

          // Store complete AI response (background, do not block request end)
          if (chatRoomId && fullResponse) {
            storeConversation(chatRoomId, fullResponse, 'assistant').catch((e) => {
              console.error('[Bot Stream] Failed to persist assistant message:', e)
            })
          }

          // Increment message usage count
          if (chatBotDomain?.userId && fullResponse) {
            client.billings.update({
              where: { userId: chatBotDomain.userId },
              data: { messagesUsed: { increment: 1 } }
            }).catch((e) => {
              console.error('[Bot Stream] Failed to increment message count:', e)
            })
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
