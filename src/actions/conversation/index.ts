'use server'

import { client } from '@/lib/prisma'
import { accessibleWorkspaceIds, requireTenantContext, requireWorkspace } from '@/lib/tenant'
import { AuthorizationError } from '@/lib/permissions'

/**
 * Read-only conversation inbox.
 *
 * The assistant answers every conversation itself; there is no human takeover.
 * The previous version of this module exposed a realtime handoff surface
 * (`onToggleRealtime`, `onOwnerSendMessage`, a Pusher-delivered reply channel)
 * whose delivery half was never built — an owner's "reply" was written to the
 * database and never reached the visitor. Showing a composer for a message that
 * cannot arrive is worse than showing none, so the inbox is now strictly a
 * transcript reader.
 *
 * `Conversation.handoffStatus` remains in the schema but is no longer read.
 */

export type InboxLead = {
  name: string | null
  email: string | null
  phone: string | null
}

export type InboxConversation = {
  id: string
  startedAt: Date
  lastMessageAt: Date | null
  messageCount: number
  lead: InboxLead | null
  /** Most recent message, for the list preview. */
  preview: { message: string; createdAt: Date; role: 'user' | 'assistant' } | null
}

export type ConversationTranscript = {
  id: string
  startedAt: Date
  lead: InboxLead | null
  messages: {
    id: string
    role: 'user' | 'assistant'
    message: string
    createdAt: Date
  }[]
}

/** Confirms a conversation belongs to a workspace the caller may reach. */
async function assertConversationAccess(conversationId: string) {
  const ctx = await requireTenantContext()
  const workspaceIds = await accessibleWorkspaceIds(ctx)

  const conversation = await client.conversation.findFirst({
    where: { id: conversationId, clientWorkspaceId: { in: workspaceIds } },
    select: {
      id: true,
      clientWorkspaceId: true,
      startedAt: true,
      lead: { select: { name: true, email: true, phone: true } },
    },
  })
  if (!conversation) {
    throw new AuthorizationError(
      'viewConversations',
      'conversation is not in an accessible workspace'
    )
  }

  await requireWorkspace(conversation.clientWorkspaceId, 'viewConversations')
  return conversation
}

/** Inbox listing for one client workspace, newest activity first. */
export const onGetDomainChatRooms = async (
  id: string
): Promise<{ conversations: InboxConversation[] }> => {
  try {
    const { access } = await requireWorkspace(id, 'viewConversations')

    const conversations = await client.conversation.findMany({
      where: { clientWorkspaceId: access.clientWorkspaceId },
      orderBy: { lastMessageAt: 'desc' },
      select: {
        id: true,
        startedAt: true,
        lastMessageAt: true,
        messageCount: true,
        lead: { select: { name: true, email: true, phone: true } },
        messages: {
          select: { content: true, createdAt: true, role: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return {
      conversations: conversations.map((conversation) => {
        const last = conversation.messages[0]
        return {
          id: conversation.id,
          startedAt: conversation.startedAt,
          lastMessageAt: conversation.lastMessageAt,
          messageCount: conversation.messageCount,
          lead: conversation.lead ?? null,
          preview: last
            ? {
                message: last.content,
                createdAt: last.createdAt,
                role: last.role === 'visitor' ? ('user' as const) : ('assistant' as const),
              }
            : null,
        }
      }),
    }
  } catch (error) {
    if (!(error instanceof AuthorizationError)) {
      console.error('[Conversation] onGetDomainChatRooms failed:', error)
    }
    return { conversations: [] }
  }
}

/** Full transcript plus whatever contact details the assistant captured. */
export const onGetChatMessages = async (
  id: string
): Promise<ConversationTranscript | undefined> => {
  try {
    const conversation = await assertConversationAccess(id)

    const messages = await client.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true },
    })

    return {
      id: conversation.id,
      startedAt: conversation.startedAt,
      lead: conversation.lead ?? null,
      messages: messages.map((m) => ({
        id: m.id,
        // The transcript is a two-sided read: everything that is not the
        // visitor is rendered as the assistant's side.
        role: m.role === 'visitor' ? ('user' as const) : ('assistant' as const),
        message: m.content,
        createdAt: m.createdAt,
      })),
    }
  } catch (error) {
    if (!(error instanceof AuthorizationError)) {
      console.error('[Conversation] onGetChatMessages failed:', error)
    }
    return undefined
  }
}
