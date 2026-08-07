import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  onGetChatMessages,
  onGetDomainChatRooms,
  type InboxConversation,
} from '@/actions/conversation'
import { useChatContext } from '@/context/user-chat-context'
import { ConversationSearchSchema } from '@/schemas/conversation.schema'

/**
 * The conversation inbox is read-only: the assistant handles every reply, so
 * there is nothing here that sends. The hook only fetches a workspace's
 * conversations and, on selection, that conversation's transcript.
 */
export const useConversation = () => {
  const { register, watch, setValue } = useForm({
    resolver: zodResolver(ConversationSearchSchema),
    mode: 'onChange',
  })
  const { setLoading: loadMessages, setChats, setChatRoom, setLead } = useChatContext()
  const [conversations, setConversations] = useState<InboxConversation[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const onLoadChatRoomsForDomain = useCallback(async (domainId: string) => {
    setLoading(true)
    try {
      const result = await onGetDomainChatRooms(domainId)
      setConversations(result.conversations)
    } catch (error) {
      console.error('[Conversations] failed to load inbox:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const search = watch(async (value) => {
      if (value.domain) {
        await onLoadChatRoomsForDomain(value.domain)
      }
    })
    return () => search.unsubscribe()
  }, [watch, onLoadChatRoomsForDomain])

  const onGetActiveChatMessages = async (id: string) => {
    try {
      setChatRoom(id)
      loadMessages(true)
      const transcript = await onGetChatMessages(id)
      if (transcript) {
        setChats(transcript.messages)
        setLead(transcript.lead)
      } else {
        setChats([])
        setLead(null)
      }
    } catch (error) {
      console.error('[Conversations] failed to load transcript:', error)
    } finally {
      loadMessages(false)
    }
  }

  return {
    register,
    setValue,
    conversations,
    loading,
    onGetActiveChatMessages,
    onLoadChatRoomsForDomain,
  }
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * Time label for a conversation row: clock time for today, day + month before
 * that, and the year once it is no longer the current one.
 */
export const formatInboxTime = (value: Date | string | null | undefined) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  const stamp = `${date.getDate()} ${MONTHS[date.getMonth()]}`
  return date.getFullYear() === now.getFullYear() ? stamp : `${stamp} ${date.getFullYear()}`
}

/** Full timestamp for a message inside the transcript. */
export const formatMessageTime = (value: Date | string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Scroll-managed transcript reader for the selected conversation. */
export const useChatWindow = () => {
  const { chats, loading, chatRoom, lead } = useChatContext()
  const messageWindowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth',
    })
  }, [chats])

  return { messageWindowRef, chats, loading, chatRoom, lead }
}
