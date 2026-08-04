import 'server-only'

import { Prisma } from '@prisma/client'

import { client } from '@/lib/prisma'
import { recordUsage } from '@/lib/entitlements'
import type { WidgetContext } from '@/lib/widget/resolve'
import type { SearchResult } from '@/lib/vector-search'
import { devError } from '@/lib/utils'

/**
 * Conversation persistence for the public widget.
 *
 * Pulled out of the streaming route, which had visitor lookup, lead creation,
 * message storage, billing and prompt assembly interleaved across ~400 lines of
 * nesting — so a change to any one of them risked all of them.
 *
 * Differences from the old flow that matter:
 *
 * - A conversation exists from the first message, whether or not an email is
 *   ever given. The old code only created a ChatRoom once a Customer existed,
 *   so anonymous traffic was invisible until it converted — and "conversations
 *   handled" undercounted the assistant's actual work.
 * - A lead can be created from a phone number alone. `Customer` was uniquely
 *   keyed on (email, domainId), which made phone-only capture impossible.
 * - Usage is recorded against the workspace and assistant, so cost and volume
 *   are attributable per client.
 */

export type ChatSession = {
  conversationId: string
  visitorId: string
  leadId: string | null
  /** True when a human has taken over — the assistant must stay silent. */
  isLive: boolean
}

/**
 * Finds or creates the visitor and their open conversation.
 *
 * Conversations are continued rather than recreated per message: the widget
 * sends a stable `anonymousId` for the browser session.
 */
export async function resolveSession(input: {
  context: WidgetContext
  anonymousId: string
  sourceUrl?: string | null
  referrer?: string | null
}): Promise<ChatSession> {
  const { context, anonymousId } = input

  const visitor = await client.visitor.upsert({
    where: {
      clientWorkspaceId_anonymousId: {
        clientWorkspaceId: context.clientWorkspaceId,
        anonymousId,
      },
    },
    create: {
      clientWorkspaceId: context.clientWorkspaceId,
      anonymousId,
      firstSourceUrl: input.sourceUrl ?? null,
      lastSourceUrl: input.sourceUrl ?? null,
    },
    update: {
      lastSeenAt: new Date(),
      lastSourceUrl: input.sourceUrl ?? undefined,
    },
    select: { id: true },
  })

  const existing = await client.conversation.findFirst({
    where: {
      clientWorkspaceId: context.clientWorkspaceId,
      visitorId: visitor.id,
      assistantId: context.assistantId,
      status: 'active',
    },
    orderBy: { startedAt: 'desc' },
    select: { id: true, leadId: true, handoffStatus: true },
  })

  if (existing) {
    return {
      conversationId: existing.id,
      visitorId: visitor.id,
      leadId: existing.leadId,
      isLive: existing.handoffStatus === 'active' || existing.handoffStatus === 'accepted',
    }
  }

  const conversation = await client.conversation.create({
    data: {
      clientWorkspaceId: context.clientWorkspaceId,
      assistantId: context.assistantId,
      deploymentId: context.deploymentId,
      visitorId: visitor.id,
      channel: context.channel,
      status: 'active',
      sourceUrl: input.sourceUrl ?? null,
      referrer: input.referrer ?? null,
      startedAt: new Date(),
    },
    select: { id: true },
  })

  return { conversationId: conversation.id, visitorId: visitor.id, leadId: null, isLive: false }
}

/**
 * Attaches contact details to the conversation, creating the lead if needed.
 *
 * Either an email or a phone number is enough. Deduplication is deliberately an
 * application decision, not a database constraint: matching on email alone
 * would merge two people who share a household address.
 */
export async function captureLead(input: {
  context: WidgetContext
  session: ChatSession
  email?: string | null
  phone?: string | null
  name?: string | null
}): Promise<string | null> {
  const { context, session } = input
  const email = input.email?.trim().toLowerCase() || null
  const phone = input.phone?.trim() || null

  if (!email && !phone) return session.leadId
  if (session.leadId) {
    await client.lead.update({
      where: { id: session.leadId },
      data: {
        email: email ?? undefined,
        phone: phone ?? undefined,
        name: input.name ?? undefined,
      },
    })
    return session.leadId
  }

  // Reuse an existing lead for this visitor before creating a second one.
  const existing = await client.lead.findFirst({
    where: {
      clientWorkspaceId: context.clientWorkspaceId,
      OR: [
        { visitorId: session.visitorId },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })

  const lead = existing
    ? await client.lead.update({
        where: { id: existing.id },
        data: { email: email ?? undefined, phone: phone ?? undefined, name: input.name ?? undefined },
        select: { id: true },
      })
    : await client.lead.create({
        data: {
          clientWorkspaceId: context.clientWorkspaceId,
          assistantId: context.assistantId,
          conversationId: session.conversationId,
          visitorId: session.visitorId,
          email,
          phone,
          name: input.name ?? null,
          source: context.channel === 'web_chat' ? 'web_chat' : context.channel === 'preview' ? 'preview' : 'shareable_demo',
          status: 'new',
        },
        select: { id: true },
      })

  await client.conversation.update({
    where: { id: session.conversationId },
    data: { leadId: lead.id },
  })

  return lead.id
}

export async function appendVisitorMessage(session: ChatSession, context: WidgetContext, content: string) {
  const message = await client.message.create({
    data: {
      conversationId: session.conversationId,
      clientWorkspaceId: context.clientWorkspaceId,
      assistantId: context.assistantId,
      role: 'visitor',
      messageType: 'text',
      content,
    },
    select: { id: true, createdAt: true },
  })

  await client.conversation.update({
    where: { id: session.conversationId },
    data: { lastMessageAt: message.createdAt, messageCount: { increment: 1 } },
  })

  return message
}

/**
 * Stores the assistant's reply, its citations, and the usage it consumed.
 *
 * Citations are written from the chunks that were actually retrieved for this
 * turn, which is what lets an agency audit where an answer came from.
 */
export async function appendAssistantMessage(input: {
  session: ChatSession
  context: WidgetContext
  content: string
  citations?: SearchResult[]
  promptTokens?: number
  completionTokens?: number
  latencyMs?: number
}) {
  const { session, context } = input

  const message = await client.message.create({
    data: {
      conversationId: session.conversationId,
      clientWorkspaceId: context.clientWorkspaceId,
      assistantId: context.assistantId,
      role: 'assistant',
      messageType: 'text',
      content: input.content,
      modelProvider: context.assistant.modelProvider,
      modelName: context.assistant.modelName,
      promptTokens: input.promptTokens ?? null,
      completionTokens: input.completionTokens ?? null,
      latencyMs: input.latencyMs ?? null,
      status: 'complete',
    },
    select: { id: true, createdAt: true },
  })

  if (context.assistant.citationsEnabled && input.citations?.length) {
    await client.messageCitation.createMany({
      data: input.citations.slice(0, 5).map((c) => ({
        messageId: message.id,
        knowledgeDocumentId: c.knowledgeDocumentId,
        knowledgeChunkId: c.id,
        sourceUrl: c.sourceUrl,
        title: c.title,
        relevanceScore: c.similarity,
      })),
      skipDuplicates: true,
    })
  }

  await client.conversation.update({
    where: { id: session.conversationId },
    data: { lastMessageAt: message.createdAt, messageCount: { increment: 1 } },
  })

  // Metered per message, keyed on the message id so a retried write cannot
  // double-charge the organization.
  await recordUsage({
    organizationId: context.organizationId,
    clientWorkspaceId: context.clientWorkspaceId,
    assistantId: context.assistantId,
    conversationId: session.conversationId,
    eventType: 'assistant_message',
    quantity: 1,
    unit: 'message',
    provider: context.assistant.modelProvider,
    model: context.assistant.modelName,
    promptTokens: input.promptTokens ?? null,
    completionTokens: input.completionTokens ?? null,
    idempotencyKey: `msg-${message.id}`,
  }).catch((error) => devError('[Chat] usage recording failed:', error))

  return message
}

/** Marks a conversation resolved or abandoned. */
export async function closeConversation(
  conversationId: string,
  status: 'resolved' | 'abandoned' | 'spam'
) {
  await client.conversation.update({
    where: { id: conversationId },
    data: { status, endedAt: new Date() },
  }).catch((error) => devError('[Chat] closeConversation failed:', error))
}

/** Prior turns for prompt context, oldest first. */
export async function recentMessages(conversationId: string, take = 20) {
  const rows = await client.message.findMany({
    where: { conversationId, role: { in: ['visitor', 'assistant', 'human_agent'] } },
    orderBy: { createdAt: 'desc' },
    take,
    select: { role: true, content: true },
  })

  return rows
    .reverse()
    .map((m) => ({
      role: m.role === 'visitor' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }))
}

export type { Prisma }
