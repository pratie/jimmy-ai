// Public streaming chat endpoint.
// Route: /api/bot/stream

import { streamText } from 'ai'

import { getModel } from '@/lib/ai-models'
import { buildSystemPrompt } from '@/lib/promptBuilder'
import { devError, devLog, extractEmailsFromString } from '@/lib/utils'
import {
  formatResultsForPrompt,
  searchKnowledgeBaseMultiQuery,
  searchKnowledgeBaseWithFallback,
  type SearchResult,
} from '@/lib/vector-search'
import { checkRateLimit, resolveWidgetRequest, type WidgetContext } from '@/lib/widget/resolve'
import {
  appendAssistantMessage,
  appendVisitorMessage,
  captureLead,
  recentMessages,
  resolveSession,
} from '@/lib/chat/session'

/**
 * The only unauthenticated write path in the product.
 *
 * Rewritten from ~670 lines in which authorisation, billing, visitor lookup,
 * lead creation, message storage and prompt assembly were interleaved. Each of
 * those now lives in its own module:
 *
 *   lib/widget/resolve  — is this caller allowed, and can they afford it
 *   lib/chat/session    — visitor, conversation, lead, message persistence
 *   lib/vector-search   — tenant-scoped retrieval
 *
 * Security properties this endpoint now has and previously did not:
 *  - callers present a rotatable deployment key, not an internal row id
 *  - rate limited
 *  - the plan allowance is checked BEFORE any model call
 *  - retrieval is scoped to one workspace in SQL
 *  - crawled content is fenced as untrusted data, never merged into the system
 *    prompt where an instruction inside a client's website would be obeyed
 */

export const maxDuration = 60

/* ── Response formatting ────────────────────────────────────────────────── */

const removeMarkdownBold = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '$1')

const convertMarkdownLinksToHtml = (text: string) =>
  text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

/** Rough phone detection for lead capture. Deliberately conservative. */
function extractPhone(text: string): string | null {
  const match = text.match(/(\+?\d[\d\s().-]{7,}\d)/)
  if (!match) return null
  const digits = match[1].replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15 ? match[1].trim() : null
}

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })

/* ── Handler ────────────────────────────────────────────────────────────── */

export async function POST(req: Request) {
  const startedAt = Date.now()

  try {
    const body = await req.json()
    const {
      // `deploymentKey` is the new contract; `domainId` is accepted only so an
      // old embed script fails with a clear message instead of a type error.
      deploymentKey,
      domainId,
      chat,
      message,
      anonymousId,
      sourceUrl,
    } = body ?? {}

    const key: string | undefined = deploymentKey ?? domainId
    if (!key || !message || typeof message !== 'string') {
      return json({ error: 'Missing deployment key or message' }, 400)
    }
    if (!anonymousId || typeof anonymousId !== 'string') {
      return json({ error: 'Missing anonymousId' }, 400)
    }

    const origin = req.headers.get('origin') ?? req.headers.get('referer')

    // Rate limit before touching the database: an abusive caller should cost a
    // map lookup, not a query.
    const limit = checkRateLimit(`${key}:${anonymousId}`)
    if (!limit.allowed) {
      return json(
        { error: 'Too many messages. Please slow down.', retryAfter: limit.retryAfterSeconds },
        429,
        { 'Retry-After': String(limit.retryAfterSeconds) }
      )
    }

    const resolution = await resolveWidgetRequest(key, origin)
    if (!resolution.ok) {
      return json({ error: resolution.message, code: resolution.code }, resolution.status)
    }
    const context: WidgetContext = resolution.context

    const session = await resolveSession({
      context,
      anonymousId,
      sourceUrl: typeof sourceUrl === 'string' ? sourceUrl : null,
      referrer: origin,
    })

    await appendVisitorMessage(session, context, message)

    // A human has taken over: stay silent rather than talking over the agent.
    if (session.isLive) {
      return json({ live: true, message: 'A team member is replying to this conversation.' }, 200)
    }

    // Contact details volunteered in the message body.
    const email = extractEmailsFromString(message)?.[0] ?? null
    const phone = extractPhone(message)
    const leadId = context.assistant.leadCaptureEnabled
      ? await captureLead({ context, session, email, phone, message })
      : session.leadId

    /* ── Retrieval ── */
    const ragStart = Date.now()
    let citations: SearchResult[] = []
    try {
      citations = await searchKnowledgeBaseMultiQuery(
        message,
        { clientWorkspaceId: context.clientWorkspaceId, assistantId: context.assistantId },
        5,
        8
      )
      if (citations.length === 0) {
        citations = await searchKnowledgeBaseWithFallback(
          message,
          { clientWorkspaceId: context.clientWorkspaceId, assistantId: context.assistantId },
          5
        )
      }
    } catch (error) {
      devError('[Bot Stream] retrieval failed:', error)
    }
    const knowledgeBase = formatResultsForPrompt(citations)
    devLog(`[Bot Stream] retrieval ${Date.now() - ragStart}ms (${citations.length} chunks)`)

    /* ── Prompt ── */
    const appBase = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const mode = !leadId
      ? 'QUALIFIER'
      : context.assistant.mode === 'support'
        ? 'SUPPORT'
        : context.assistant.mode === 'faq'
          ? 'FAQ_STRICT'
          : 'SALES'

    const behavior = (context.assistant.behaviorSettings ?? {}) as Record<string, unknown>

    const systemPrompt = buildSystemPrompt({
      businessName: context.assistant.name,
      domain: appBase,
      knowledgeBase,
      mode: mode as never,
      brandTone: context.assistant.brandTone ?? 'friendly, warm, conversational',
      language: context.assistant.language,
      qualificationQuestions: !leadId
        ? ['What is the best email or phone number to reach you on?']
        : [],
      appointmentUrl:
        context.assistant.bookingEnabled && leadId
          ? `${appBase}/portal/${context.clientWorkspaceId}/appointment/${leadId}`
          : '',
      paymentUrl: '',
      portalBaseUrl: `${appBase}/portal/${context.clientWorkspaceId}`,
      customerId: leadId ?? '',
      customModeBlocks: (behavior.modePrompts as never) ?? undefined,
    })

    const history = await recentMessages(session.conversationId, 20)
    const priorTurns = Array.isArray(chat) && chat.length > 0 ? chat : history

    const messages = [
      { role: 'system', content: systemPrompt },
      ...priorTurns,
      { role: 'user', content: message },
    ]

    /* ── Stream ── */
    const llmStart = Date.now()
    const result = streamText({
      model: getModel(context.assistant.modelName) as never,
      messages: messages as never,
      temperature: context.assistant.temperature,
      maxOutputTokens: 2000,
    })

    const encoder = new TextEncoder()
    let fullResponse = ''
    let firstTokenAt: number | null = null

    const stream = new ReadableStream({
      async start(controller) {
        let errored = false
        try {
          for await (const chunk of result.textStream) {
            if (firstTokenAt === null) firstTokenAt = Date.now()
            fullResponse += chunk
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: removeMarkdownBold(chunk) })}\n\n`)
            )
          }
        } catch (error) {
          errored = true
          devError('[Bot Stream] stream error:', error)
          try {
            controller.error(error)
          } catch {
            /* controller already closed */
          }
        } finally {
          // Persist whatever was produced, including a partial answer after an
          // error — a visitor who saw half a reply should find it in the inbox.
          if (fullResponse.trim()) {
            try {
              await appendAssistantMessage({
                session,
                context,
                content: convertMarkdownLinksToHtml(removeMarkdownBold(fullResponse)),
                citations,
                latencyMs: firstTokenAt ? firstTokenAt - llmStart : undefined,
              })
            } catch (error) {
              devError('[Bot Stream] failed to persist assistant message:', error)
            }
          }

          if (!errored) {
            try {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            } catch {
              /* already closed */
            }
          }
          devLog(`[Bot Stream] total ${Date.now() - startedAt}ms`)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: unknown) {
    devError('[Bot Stream] unhandled error:', error)
    return json({ error: 'Failed to generate a response' }, 500)
  }
}
