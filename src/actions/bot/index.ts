'use server'

import { generateText } from 'ai'

import { getModel } from '@/lib/ai-models'
import { buildSystemPrompt } from '@/lib/promptBuilder'
import { client } from '@/lib/prisma'
import { devError, extractEmailsFromString } from '@/lib/utils'
import {
  formatResultsForPrompt,
  searchKnowledgeBaseWithFallback,
  type SearchResult,
} from '@/lib/vector-search'
import { checkRateLimit, resolveWidgetRequest } from '@/lib/widget/resolve'
import {
  appendAssistantMessage,
  appendVisitorMessage,
  captureLead,
  resolveSession,
} from '@/lib/chat/session'

/**
 * Non-streaming widget path.
 *
 * Shares every guarantee of the streaming route — same `resolveWidgetRequest`,
 * same `lib/chat/session` — so there is no second, weaker way into the
 * assistant. The old version duplicated the entire pipeline with its own auth,
 * retrieval and persistence, which meant a fix in one path silently missed the
 * other.
 */

const removeMarkdownBold = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '$1')

const convertMarkdownLinksToHtml = (text: string) =>
  text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  )

/** Public widget configuration — branding, greeting, appearance. */
export const onGetCurrentChatBot = async (key: string) => {
  try {
    const resolution = await resolveWidgetRequest(key, null)
    if (!resolution.ok) return undefined

    const { context } = resolution
    const behavior = (context.assistant.behaviorSettings ?? {}) as Record<string, unknown>

    const [assistant, organization] = await Promise.all([
      client.assistant.findUnique({
        where: { id: context.assistantId },
        select: { brandingSettings: true },
      }),
      client.organization.findUnique({
        where: { id: context.organizationId },
        select: { name: true, logoUrl: true },
      }),
    ])
    const appearance = (assistant?.brandingSettings ?? {}) as Record<string, unknown>

    return {
      id: context.assistantId,
      name: context.assistant.name,
      icon: (appearance.icon as string) ?? organization?.logoUrl ?? null,
      chatBot: {
        id: context.assistantId,
        welcomeMessage: context.assistant.welcomeMessage,
        icon: (appearance.icon as string) ?? null,
        textColor: (appearance.textColor as string) ?? null,
        background: (appearance.background as string) ?? null,
        theme: appearance.theme ?? null,
        helpdesk: Boolean(behavior.helpdesk),
      },
      // Branding is gated by the plan entitlement, resolved centrally, rather
      // than by the hardcoded plan-name comparison this used to do.
      showBranding: !context.hideChatDockBranding,
      agencyName: organization?.name ?? 'ChatDock',
    }
  } catch (error) {
    devError('[Bot] onGetCurrentChatBot failed:', error)
    return undefined
  }
}

/**
 * One assistant turn.
 *
 * @param key deployment public key, or a share token for a demo link.
 */
export const onAiChatBotAssistant = async (
  key: string,
  chat: { role: 'assistant' | 'user'; content: string }[],
  _author: 'user',
  message: string,
  anonymousId?: string
) => {
  try {
    if (!message?.trim()) return undefined
    const visitorKey = anonymousId ?? 'anonymous'

    const limit = checkRateLimit(`${key}:${visitorKey}`)
    if (!limit.allowed) {
      return {
        response: {
          role: 'assistant' as const,
          content: 'You are sending messages very quickly — please wait a moment and try again.',
        },
      }
    }

    const resolution = await resolveWidgetRequest(key, null)
    if (!resolution.ok) {
      return { response: { role: 'assistant' as const, content: resolution.message } }
    }
    const { context } = resolution

    const session = await resolveSession({ context, anonymousId: visitorKey })
    await appendVisitorMessage(session, context, message)

    const email = extractEmailsFromString(message)?.[0] ?? null
    const leadId = context.assistant.leadCaptureEnabled
      ? await captureLead({ context, session, email })
      : session.leadId

    let citations: SearchResult[] = []
    try {
      citations = await searchKnowledgeBaseWithFallback(
        message,
        // Not `assistantId` — see the note on `retrievalAssistantId` in
        // lib/widget/resolve: an unlinked assistant must fall back to
        // workspace-wide retrieval rather than matching nothing.
        { clientWorkspaceId: context.clientWorkspaceId, assistantId: context.retrievalAssistantId },
        5
      )
    } catch (error) {
      devError('[Bot] retrieval failed:', error)
    }

    const appBase = process.env.NEXT_PUBLIC_APP_URL ?? ''
    // The configured mode, always — see the note in api/bot/stream. Forcing
    // QUALIFIER before a lead existed meant every visitor was qualified before
    // they were helped, which is the behaviour that made it ask for an email
    // almost every turn.
    const mode =
      context.assistant.mode === 'support'
        ? 'SUPPORT'
        : context.assistant.mode === 'faq'
          ? 'FAQ_STRICT'
          : 'SALES'

    const behavior = (context.assistant.behaviorSettings ?? {}) as Record<string, unknown>

    // Qualification questions this lead has not answered yet.
    const pending = await client.leadFieldDefinition.findMany({
      where: {
        clientWorkspaceId: context.clientWorkspaceId,
        enabled: true,
        ...(leadId ? { values: { none: { leadId } } } : {}),
      },
      orderBy: { displayOrder: 'asc' },
      select: { label: true },
      take: 5,
    })

    const systemPrompt = buildSystemPrompt({
      businessName: context.assistant.name,
      // ChatDock's own URL is not the client's website; naming it here claimed
      // the assistant belonged to a domain it does not.
      domain: '',
      knowledgeBase: formatResultsForPrompt(citations),
      mode: mode as never,
      brandTone: context.assistant.brandTone ?? 'friendly, warm, conversational',
      language: context.assistant.language,
      qualificationQuestions: pending.map((q) => q.label),
      hasContactDetails: Boolean(leadId),
      turnCount: Array.isArray(chat) ? chat.filter((m) => m.role === 'user').length : 0,
      appointmentUrl:
        context.assistant.bookingEnabled && leadId
          ? `${appBase}/portal/${context.clientWorkspaceId}/appointment/${leadId}`
          : '',
      paymentUrl: '',
      portalBaseUrl: `${appBase}/portal/${context.clientWorkspaceId}`,
      customerId: leadId ?? '',
      customModeBlocks: (behavior.modePrompts as never) ?? undefined,
    })

    const startedAt = Date.now()
    const { text, usage } = await generateText({
      model: getModel(context.assistant.modelName) as never,
      // AI SDK v5 takes the system prompt as its own option. Threading it in as
      // a `messages[0]` with role 'system' is not the documented shape and some
      // providers drop or demote it, which is how the assistant ended up
      // ignoring its own instructions on this path while the streaming route —
      // which passes it here — obeyed them.
      system: systemPrompt,
      messages: [...chat, { role: 'user', content: message }],
      temperature: context.assistant.temperature,
      maxOutputTokens: 800,
    })

    if (!text) return undefined

    const content = convertMarkdownLinksToHtml(removeMarkdownBold(text))

    await appendAssistantMessage({
      session,
      context,
      content,
      citations,
      promptTokens: usage?.inputTokens ?? undefined,
      completionTokens: usage?.outputTokens ?? undefined,
      latencyMs: Date.now() - startedAt,
    })

    return { response: { role: 'assistant' as const, content } }
  } catch (error) {
    devError('[Bot] onAiChatBotAssistant failed:', error)
    return undefined
  }
}
