// Public streaming chat endpoint.
// Route: /api/bot/stream

import { streamText } from 'ai'

import { client } from '@/lib/prisma'
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

/**
 * Strips legacy control tags from anything the model produces.
 *
 * The old system prompt told the model to append `(realtime)` when the
 * knowledge base fell short and `(complete)` after a qualification question.
 * Nothing removed them, so visitors saw the markers in the chat. The prompt no
 * longer asks for either, but a model that has seen them in conversation
 * history will happily continue the pattern, and a stray marker in front of a
 * client's customer is not worth the risk of trusting the prompt alone.
 */
const stripControlTags = (text: string) =>
  text.replace(/\s*\((?:realtime|complete)\)\s*/gi, ' ').replace(/[ \t]{2,}/g, ' ').trimEnd()

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

    // The operator's own qualifying questions, and how far into the
    // conversation we are. Both feed the prompt's contact-detail rules: it must
    // never ask on the first reply, and must not ask at all once details exist.
    const [leadFields, priorVisitorTurns] = await Promise.all([
      client.leadFieldDefinition.findMany({
        where: { clientWorkspaceId: context.clientWorkspaceId, enabled: true },
        orderBy: { displayOrder: 'asc' },
        select: { label: true },
        take: 5,
      }),
      client.message.count({
        where: { conversationId: session.conversationId, role: 'visitor' },
      }),
    ])
    const leadFieldQuestions = leadFields.map((field) => field.label)
    // The assistant's configured mode, always. This used to force QUALIFIER
    // until a lead existed, so the mode an operator picked did nothing for the
    // entire part of the conversation that decides whether there is a lead at
    // all — and every visitor met a qualifier before they met an answer.
    // Whether contact details are still needed is now a separate input.
    const mode =
      context.assistant.mode === 'support'
        ? 'SUPPORT'
        : context.assistant.mode === 'faq'
          ? 'FAQ_STRICT'
          : 'SALES'

    const behavior = (context.assistant.behaviorSettings ?? {}) as Record<string, unknown>

    const systemPrompt = buildSystemPrompt({
      businessName: context.assistant.name,
      // Not `appBase` — that is ChatDock's own URL, and naming it here told the
      // model it was the assistant for the client "at chatdock.io". The client's
      // website is not carried on the widget context, so say nothing rather
      // than something false.
      domain: '',
      knowledgeBase,
      mode: mode as never,
      brandTone: context.assistant.brandTone ?? 'friendly, warm, conversational',
      language: context.assistant.language,
      // The operator's own questions only. Asking for contact details is
      // handled by the prompt's own rules, which know not to ask on the first
      // reply and not to ask twice — passing it here as a per-turn
      // "qualification question" is what made it ask on nearly every turn.
      qualificationQuestions: leadFieldQuestions,
      hasContactDetails: Boolean(leadId),
      // `appendVisitorMessage` has already stored the current turn, so subtract
      // it: what the prompt needs is how many times this visitor was answered
      // before now, and zero means "you are writing the first reply".
      turnCount: Math.max(0, priorVisitorTurns - 1),
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

    // The system prompt goes in `system`, not as a message in the array. The
    // AI SDK warns on every request otherwise, and it is right to: a system
    // message sitting in the same list as visitor turns is one bug away from
    // being reachable by whatever a visitor types.
    const messages = [...priorTurns, { role: 'user', content: message }]

    /* ── Stream ── */
    const llmStart = Date.now()
    const result = streamText({
      model: getModel(context.assistant.modelName) as never,
      system: systemPrompt,
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
              encoder.encode(`data: ${JSON.stringify({ content: stripControlTags(removeMarkdownBold(chunk)) })}\n\n`)
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
                content: convertMarkdownLinksToHtml(stripControlTags(removeMarkdownBold(fullResponse))),
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
