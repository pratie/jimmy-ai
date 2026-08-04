'use server'

import { client } from '@/lib/prisma'
import { accessibleWorkspaceIds, requireTenantContext, requireWorkspace } from '@/lib/tenant'
import { AuthorizationError } from '@/lib/permissions'

/**
 * Conversation inbox and human handoff.
 *
 * The old `ChatRoom.live` boolean meant "a human is here", "a human was
 * requested" and "a human finished" all at once, so the UI could not tell an
 * abandoned takeover from a completed one. `Conversation.handoffStatus` has six
 * explicit states; the `live` field these actions still return is derived from
 * it for the current UI.
 */

const liveFrom = (status: string) => status === 'active' || status === 'accepted'

/** Confirms a conversation belongs to a workspace the caller may reach. */
async function assertConversationAccess(
  conversationId: string,
  permission: 'viewConversations' | 'takeOverConversation'
) {
  const ctx = await requireTenantContext()
  const workspaceIds = await accessibleWorkspaceIds(ctx)

  const conversation = await client.conversation.findFirst({
    where: { id: conversationId, clientWorkspaceId: { in: workspaceIds } },
    select: { id: true, clientWorkspaceId: true, handoffStatus: true },
  })
  if (!conversation) {
    throw new AuthorizationError(permission, 'conversation is not in an accessible workspace')
  }

  await requireWorkspace(conversation.clientWorkspaceId, permission)
  return conversation
}

/**
 * Starts or ends a human takeover.
 * `requested` is set by the assistant; an agent moving to `active` is what
 * actually silences automated replies.
 */
export const onToggleRealtime = async (id: string, state: boolean) => {
  try {
    const conversation = await assertConversationAccess(id, 'takeOverConversation')

    const updated = await client.conversation.update({
      where: { id: conversation.id },
      data: { handoffStatus: state ? 'active' : 'completed' },
      select: { id: true, handoffStatus: true },
    })

    return {
      status: 200,
      message: state ? 'Realtime mode enabled' : 'Realtime mode disabled',
      chatRoom: { id: updated.id, live: liveFrom(updated.handoffStatus) },
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403, message: error.message }
    console.error('[Conversation] onToggleRealtime failed:', error)
    return { status: 400, message: 'Could not change realtime mode' }
  }
}

export const onGetConversationMode = async (id: string) => {
  try {
    const conversation = await assertConversationAccess(id, 'viewConversations')
    return { live: liveFrom(conversation.handoffStatus), handoffStatus: conversation.handoffStatus }
  } catch (error) {
    console.error('[Conversation] onGetConversationMode failed:', error)
    return undefined
  }
}

/** Inbox listing for one client workspace. */
export const onGetDomainChatRooms = async (id: string) => {
  try {
    const { access } = await requireWorkspace(id, 'viewConversations')

    const conversations = await client.conversation.findMany({
      where: { clientWorkspaceId: access.clientWorkspaceId },
      orderBy: { lastMessageAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        handoffStatus: true,
        lead: { select: { email: true, name: true, phone: true } },
        visitor: { select: { anonymousId: true } },
        messages: {
          select: { content: true, createdAt: true, role: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return {
      customer: conversations.map((conversation) => ({
        email: conversation.lead?.email ?? null,
        name: conversation.lead?.name ?? null,
        phone: conversation.lead?.phone ?? null,
        chatRoom: [
          {
            id: conversation.id,
            createdAt: conversation.createdAt,
            live: liveFrom(conversation.handoffStatus),
            message: conversation.messages.map((m) => ({
              message: m.content,
              createdAt: m.createdAt,
              // `seen` no longer exists as a column; an agent-authored message
              // is inherently seen by the agent.
              seen: m.role !== 'visitor',
            })),
          },
        ],
      })),
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { customer: [] }
    console.error('[Conversation] onGetDomainChatRooms failed:', error)
    return { customer: [] }
  }
}

export const onGetChatMessages = async (id: string) => {
  try {
    const conversation = await assertConversationAccess(id, 'viewConversations')

    const messages = await client.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true, messageType: true },
    })

    return [
      {
        id: conversation.id,
        live: liveFrom(conversation.handoffStatus),
        message: messages.map((m) => ({
          id: m.id,
          // The UI still expects the legacy two-value role.
          role: m.role === 'visitor' ? 'user' : 'assistant',
          message: m.content,
          createdAt: m.createdAt,
          seen: true,
        })),
      },
    ]
  } catch (error) {
    console.error('[Conversation] onGetChatMessages failed:', error)
    return undefined
  }
}

/**
 * No-op retained for the UI.
 *
 * Per-message read receipts were dropped: `ChatMessage.seen` was written but
 * never read anywhere that affected behaviour. Reintroduce it deliberately if
 * unread badges become a real requirement.
 */
export const onViewUnReadMessages = async (_id: string) => {
  return { status: 200 }
}

export const onRealTimeChat = async (
  chatRoomId: string,
  message: string,
  id: string,
  role: 'assistant' | 'user'
) => {
  return { chatRoomId, message, id, role }
}

/** An agent replying as a human inside a live conversation. */
export const onOwnerSendMessage = async (
  chatRoom: string,
  message: string,
  role: 'assistant' | 'user'
) => {
  try {
    const conversation = await assertConversationAccess(chatRoom, 'takeOverConversation')

    const created = await client.message.create({
      data: {
        conversationId: conversation.id,
        clientWorkspaceId: conversation.clientWorkspaceId,
        // Recorded as human_agent, not assistant — conflating the two makes
        // "how much did the assistant actually handle" unanswerable, and that
        // number is the client-facing proof of value.
        role: role === 'assistant' ? 'human_agent' : 'visitor',
        messageType: 'text',
        content: message,
      },
      select: { id: true, content: true, role: true, createdAt: true },
    })

    await client.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: created.createdAt, messageCount: { increment: 1 } },
    })

    return {
      status: 200,
      message: [{ id: created.id, message: created.content, role, createdAt: created.createdAt }],
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403, message: [] }
    console.error('[Conversation] onOwnerSendMessage failed:', error)
    return { status: 400, message: [] }
  }
}
