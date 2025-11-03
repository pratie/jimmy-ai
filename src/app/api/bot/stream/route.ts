// Streaming API for main chatbot
// Route: /api/bot/stream

import { client } from '@/lib/prisma'
import { extractEmailsFromString, devLog, devError } from '@/lib/utils'
import { truncateMarkdown } from '@/lib/firecrawl'
import { buildSystemPrompt } from '@/lib/promptBuilder'
import { searchKnowledgeBaseWithFallback, formatResultsForPrompt, hasTrainedEmbeddings, searchKnowledgeBaseMultiQuery } from '@/lib/vector-search'
import { getPlanLimits, shouldResetCredits, getNextResetDate } from '@/lib/plans'
import { streamText } from 'ai'
import { getModel } from '@/lib/ai-models'

// --- Minimal in-memory LRU cache for domain config ---
type DomainConfig = {
  name: string
  userId?: string | null
  chatBot: {
    mode: string | null
    brandTone: string | null
    language: string | null
    hasEmbeddings: boolean | null
    llmModel?: string | null
    llmTemperature?: number | null
    modePrompts?: any | null
  } | null
}

const DOMAIN_CACHE_TTL_MS = 300_000 // 5 minutes
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

export const maxDuration = 30

// Helper to remove markdown bold syntax from text
function removeMarkdownBold(text: string): string {
  return text.replace(/\*\*/g, '')
}

// Helper to convert markdown links to HTML anchor tags
function convertMarkdownLinksToHtml(text: string): string {
  // Match [text](url) pattern and convert to <a href="url" target="_blank" rel="noopener noreferrer">text</a>
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">$1</a>')
}

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

    devLog('[Bot Stream] ⏱️  Request started')

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
              llmModel: true,
              llmTemperature: true,
              modePrompts: true,
            },
          },
        },
      })

      if (found) {
        chatBotDomain = found as DomainConfig
        setDomainInCache(domainId, chatBotDomain)
      }
      recordCacheStat(domainId, false)
      devLog(`[Bot Stream]   └─ Domain query: ${Date.now() - dbQueryStart}ms`)
    } else {
      cacheHit = true
      recordCacheStat(domainId, true)
      devLog('[Bot Stream]   └─ Domain query: 0ms (cache hit)')
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
          devLog('[Bot Stream] 🔄 Credits reset for new billing period')
        } else {
          // Check if user has credits remaining
          if (billing.messagesUsed >= billing.messageCredits) {
            devLog('[Bot Stream] ❌ Message limit reached')
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

    devLog(`[Bot Stream] ✅ Parallel queries took: ${Date.now() - parallelStartTime}ms (max of both)`)    

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
      // Multi-query RAG with reranking (embeddings required)
      devLog('[Bot Stream] 🔍 Using multi-query RAG with reranking')
      const vectorSearchStart = Date.now()
      try {
        // Defaults tuned for speed/quality; can be made configurable later
        const chunksPerQuery = 4  // 4 queries × 4 chunks = 16 total (reduced from 20)
        const finalTopN = 3
        const searchResults = await searchKnowledgeBaseMultiQuery(message, domainId, chunksPerQuery, finalTopN)
        devLog(`[Bot Stream] ✅ Multi-query search took: ${Date.now() - vectorSearchStart}ms (final ${searchResults.length} chunks)`) 
        // If multi-query returned no chunks (edge), fallback to single-query search
        if (searchResults.length === 0) {
          const fallbackStart = Date.now()
          const fallbackResults = await searchKnowledgeBaseWithFallback(message, domainId, 5)
          devLog(`[Bot Stream] ⚠️  Fallback single-query took: ${Date.now() - fallbackStart}ms (found ${fallbackResults.length} chunks)`) 
          knowledgeBase = formatResultsForPrompt(fallbackResults)
        } else {
          knowledgeBase = formatResultsForPrompt(searchResults)
        }
      } catch (e) {
        devError('[Bot Stream] Multi-query RAG failed, using fallback:', e)
        const vectorSearchStart2 = Date.now()
        const searchResults = await searchKnowledgeBaseWithFallback(message, domainId, 5)
        devLog(`[Bot Stream] ✅ Vector search (fallback) took: ${Date.now() - vectorSearchStart2}ms (found ${searchResults.length} chunks)`) 
        knowledgeBase = formatResultsForPrompt(searchResults)
      }
    } else {
      devLog('[Bot Stream] ⚠️  Using fallback: fetching full knowledge base (no embeddings trained)')
      // Only fetch knowledgeBase when embeddings aren't trained (rare case)
      const kbData = await client.chatBot.findUnique({
        where: { domainId: domainId },
        select: { knowledgeBase: true }
      })
      knowledgeBase = kbData?.knowledgeBase
        ? kbData.knowledgeBase // Pass full KB without truncation
        : 'No knowledge base available yet. Please ask the customer to provide more details about their inquiry.'
    }
    devLog(`[Bot Stream] ✅ RAG retrieval took: ${Date.now() - ragStartTime}ms`)

    // ═══════════════════════════════════════════════════════════
    // CONVERSATION STATE MANAGEMENT: Handle both customer & anonymous users
    // ═══════════════════════════════════════════════════════════
    let chatRoomId: string | undefined
    let isLiveMode = false

    if (customerEmail) {
      // ──────────────────────────────────────────────────────────
      // CUSTOMER FLOW: Email provided (new or returning customer)
      // ──────────────────────────────────────────────────────────
      devLog('[Bot Stream] 📧 Customer email detected')

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
              devLog('[Bot Stream] 🔄 Race condition detected - customer created by concurrent request')
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

        devLog('[Bot Stream] ✅ Customer found/created')

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
            devLog('[Bot Stream] 🔗 Linking anonymous chat history')

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
            devLog('[Bot Stream] 🔄 Returning customer, using existing chat room')
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
            devLog('[Bot Stream] 🆕 New customer, created chat room')
          }
        }

        // 5. Store user message
        await storeConversation(chatRoomId, message, 'user')

        // 6. Check if live mode is active
        if (isLiveMode) {
          devLog('[Bot Stream] 👤 Live mode active - human agent will respond')
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
        devError('[Bot Stream] ❌ Customer handling error:', error)

        // Fallback: Continue with anonymous flow if customer creation fails
        // This prevents total failure - conversation still works
        devLog('[Bot Stream] ⚠️  Falling back to anonymous mode due to error')
        customerEmail = undefined // Clear email to trigger anonymous flow below
      }
    }

    if (!customerEmail && anonymousId) {
      // ──────────────────────────────────────────────────────────
      // ANONYMOUS FLOW: No email provided yet
      // ──────────────────────────────────────────────────────────
      devLog('[Bot Stream] 👤 Anonymous user')

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
        devLog('[Bot Stream] 🆕 Created anonymous chat room')
      }

      chatRoomId = anonymousChatRoom.id
      isLiveMode = anonymousChatRoom.live

      // Store user message
      await storeConversation(chatRoomId, message, 'user')

      // If live mode, don't stream AI response
      if (isLiveMode) {
        devLog('[Bot Stream] 👤 Live mode active - human agent will respond')
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
      customModeBlocks: (chatBotDomain.chatBot?.modePrompts as any) || undefined,
    })
    devLog(`[Bot Stream] ✅ Prompt building took: ${Date.now() - promptStartTime}ms`)

    // Prepare OpenAI request data
    const llmModel = chatBotDomain.chatBot?.llmModel || 'gemini-2.5-flash-lite'
    const llmTemperature = (typeof chatBotDomain.chatBot?.llmTemperature === 'number') ? chatBotDomain.chatBot?.llmTemperature as number : 0.7
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chat,
      { role: 'user', content: message },
    ]

    // ═══════════════════════════════════════════════════════════
    // 🔍 DEBUG: LOG COMPLETE LLM REQUEST DATA
    // ═══════════════════════════════════════════════════════════
    if (process.env.DEBUG_LLM === 'true') {
      console.log('\n' + '='.repeat(80))
      console.log('📤 AI SDK REQUEST')
      console.log('='.repeat(80))
      console.log('Model:', llmModel)
      console.log('Temperature:', llmTemperature)
      console.log('Max Tokens:', 4096)
      console.log('Stream:', true)
      console.log('\n' + '-'.repeat(80))
      console.log('MESSAGES:')
      console.log('-'.repeat(80))
      messages.forEach((msg, idx) => {
        console.log(`\n[Message ${idx + 1}] Role: ${msg.role}`)
        console.log('-'.repeat(80))
        console.log(msg.content)
        console.log('-'.repeat(80))
      })
      console.log('\n' + '='.repeat(80) + '\n')
    }

    // Get AI model dynamically (supports OpenAI, Anthropic, Google)
    const model = getModel(llmModel)

    devLog('[Bot Stream] 🤖 Calling AI API...')
    devLog('[Bot Stream] 📍 Model:', llmModel)
    devLog('[Bot Stream] 🌡️  Temperature:', llmTemperature)

    const llmStartTime = Date.now()

    // Create AI SDK streaming result
    const result = streamText({
      model: model as any,
      messages: messages as any,
      temperature: llmTemperature,
      maxOutputTokens: 4096,
    })

    // Custom stream processing to maintain per-chunk markdown cleaning
    const encoder = new TextEncoder()
    let fullResponse = ''
    let firstTokenTime: number | null = null
    let tokenCount = 0

    const customStream = new ReadableStream({
      async start(controller) {
        let controllerErrored = false

        try {
          // Consume AI SDK text stream
          for await (const textPart of result.textStream) {
            if (!firstTokenTime) {
              firstTokenTime = Date.now()
              const ttft = firstTokenTime - llmStartTime
              devLog(`[Bot Stream] ⚡ First token received in: ${ttft}ms (TTFT - Time To First Token)`)
            }

            tokenCount++
            fullResponse += textPart

            // Process markdown: remove bold and convert links to HTML
            let cleanContent = removeMarkdownBold(textPart)
            cleanContent = convertMarkdownLinksToHtml(cleanContent)

            // Send as Server-Sent Events format
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: cleanContent })}\n\n`)
            )
          }

          // Calculate metrics
          const totalTime = Date.now() - startTime
          const streamTime = Date.now() - llmStartTime
          const ttft = (firstTokenTime ?? llmStartTime) - llmStartTime

          devLog(`[Bot Stream] ✅ Stream completed: ${tokenCount} tokens in ${streamTime}ms`)
          devLog(`[Bot Stream] 📊 Total request time: ${totalTime}ms`)

          if (process.env.DEBUG_LLM === 'true') {
            console.log('\n' + '='.repeat(80))
            console.log('📥 AI SDK RESPONSE')
            console.log('='.repeat(80))
            console.log('Model:', llmModel)
            console.log('Tokens:', tokenCount)
            console.log('TTFT (Time to First Token):', ttft, 'ms')
            console.log('Stream Duration:', streamTime, 'ms')
            console.log('Total Duration:', totalTime, 'ms')
            console.log('\n' + '-'.repeat(80))
            console.log('COMPLETE RESPONSE:')
            console.log('-'.repeat(80))
            console.log(fullResponse)
            console.log('-'.repeat(80))
            console.log('='.repeat(80) + '\n')
          }

          // Metrics (safe - no PII, only timing data)
          const stats = domainCacheStats.get(domainId) || { hits: 0, misses: 0 }
          const globalRatio = (cacheHits + cacheMisses) > 0 ? (cacheHits / (cacheHits + cacheMisses)) : 0
          const domainRatio = (stats.hits + stats.misses) > 0 ? (stats.hits / (stats.hits + stats.misses)) : 0
          const metricsMsg = `` +
            `[Metrics] cache=${cacheHit ? 'hit' : 'miss'} ` +
            `ttftMs=${ttft} streamMs=${streamTime} totalMs=${totalTime} ` +
            `domainHits=${stats.hits} domainMisses=${stats.misses} ` +
            `domainHitRatio=${domainRatio.toFixed(2)} globalHitRatio=${globalRatio.toFixed(2)}`
          devLog(metricsMsg)
        } catch (error) {
          controllerErrored = true
          devError('[Bot Stream] ❌ Stream error:', error)
          // Signal error to client; we'll still persist any partial content in finally
          try { controller.error(error) } catch (_) {}
        } finally {
          // Persist any generated content (complete or partial) to ensure dashboard consistency
          if (chatRoomId && fullResponse && fullResponse.trim().length > 0) {
            try {
              let cleanFullResponse = removeMarkdownBold(fullResponse)
              cleanFullResponse = convertMarkdownLinksToHtml(cleanFullResponse)
              await storeConversation(chatRoomId, cleanFullResponse, 'assistant')
            } catch (e) {
              devError('[Bot Stream] Failed to persist assistant message (finalize):', e)
            }
          }

          // Increment message usage if any response was actually produced
          if (chatBotDomain?.userId && fullResponse && fullResponse.trim().length > 0) {
            client.billings.update({
              where: { userId: chatBotDomain.userId },
              data: { messagesUsed: { increment: 1 } }
            }).catch((e) => {
              devError('[Bot Stream] Failed to increment message count:', e)
            })
          }

          // Finish the SSE stream if we haven't already errored the controller
          if (!controllerErrored) {
            try { controller.enqueue(encoder.encode('data: [DONE]\n\n')) } catch (_) {}
            try { controller.close() } catch (_) {}
          }
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
    devError('[Bot Stream] Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
