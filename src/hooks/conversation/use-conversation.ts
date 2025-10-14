import {
  onGetChatMessages,
  onGetDomainChatRooms,
  onOwnerSendMessage,
  onRealTimeChat,
  onViewUnReadMessages,
} from '@/actions/conversation'
import { useChatContext } from '@/context/user-chat-context'
import { getMonthName } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher-client'
import {
  ChatBotMessageSchema,
  ConversationSearchSchema,
} from '@/schemas/conversation.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'

export const useConversation = () => {
  const { register, watch, setValue } = useForm({
    resolver: zodResolver(ConversationSearchSchema),
    mode: 'onChange',
  })
  const { setLoading: loadMessages, setChats, setChatRoom } = useChatContext()
  const [chatRooms, setChatRooms] = useState<
    {
      chatRoom: {
        id: string
        createdAt: Date
        message: {
          message: string
          createdAt: Date
          seen: boolean
        }[]
      }[]
      email: string | null
    }[]
  >([])
  const [loading, setLoading] = useState<boolean>(false)

  // Function to manually load chat rooms for a domain
  const onLoadChatRoomsForDomain = useCallback(async (domainId: string) => {
    setLoading(true)
    try {
      const rooms = await onGetDomainChatRooms(domainId)
      if (rooms) {
        setLoading(false)
        setChatRooms(rooms.customer)
      }
    } catch (error) {
      console.log(error)
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
      loadMessages(true)
      const messages = await onGetChatMessages(id)
      if (messages) {
        setChatRoom(id)
        loadMessages(false)
        setChats(messages[0].message)
      }
    } catch (error) {
      console.log(error)
    }
  }
  return {
    register,
    setValue,
    chatRooms,
    loading,
    onGetActiveChatMessages,
    onLoadChatRoomsForDomain,
  }
}

export const useChatTime = (createdAt: Date, roomId: string) => {
  const { chatRoom } = useChatContext()
  const [messageSentAt, setMessageSentAt] = useState<string>()
  const [urgent, setUrgent] = useState<boolean>(false)

  const onSetMessageRecievedDate = () => {
    const dt = new Date(createdAt)
    const current = new Date()
    const currentDate = current.getDate()
    const hr = dt.getHours()
    const min = dt.getMinutes()
    const date = dt.getDate()
    const month = dt.getMonth()
    const difference = currentDate - date

    if (difference <= 0) {
      setMessageSentAt(`${hr}:${min}${hr > 12 ? 'PM' : 'AM'}`)
      if (current.getHours() - dt.getHours() < 2) {
        setUrgent(true)
      }
    } else {
      setMessageSentAt(`${date} ${getMonthName(month)}`)
    }
  }

  const onSeenChat = async () => {
    if (chatRoom == roomId && urgent) {
      await onViewUnReadMessages(roomId)
      setUrgent(false)
    }
  }

  useEffect(() => {
    onSeenChat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom])

  useEffect(() => {
    onSetMessageRecievedDate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { messageSentAt, urgent, onSeenChat }
}

export const useChatWindow = () => {
  const { chats, loading, setChats, chatRoom } = useChatContext()
  const messageWindowRef = useRef<HTMLDivElement | null>(null)
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(ChatBotMessageSchema),
    mode: 'onChange',
  })
  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    onScrollToBottom()
  }, [chats, messageWindowRef])

  useEffect(() => {
    if (!chatRoom) return

    const handler = (data: any) => {
      console.log('[Dashboard] 📨 Pusher message received:', data)
      console.log('[Dashboard] ✅ Adding message to chat')
      setChats((prev) => [...prev, data.chat])
    }

    console.log(`[Dashboard] 🔌 Subscribing to Pusher channel: ${chatRoom}`)
    const channel = pusherClient.subscribe(chatRoom)
    channel.bind('realtime-mode', handler)

    return () => {
      console.log(`[Dashboard] 🔌 Unsubscribing from Pusher channel: ${chatRoom}`)
      channel.unbind('realtime-mode', handler)
      pusherClient.unsubscribe(chatRoom)
    }
  }, [chatRoom, setChats])

  const onHandleSentMessage = handleSubmit(async (values) => {
    try {
      // Validate message content
      if (!values.content || values.content.trim() === '') {
        console.log('Empty message, skipping send')
        return
      }

      reset()
      const message = await onOwnerSendMessage(
        chatRoom!,
        values.content,
        'assistant'
      )

      // onOwnerSendMessage now handles Pusher broadcasting internally
      // No need to manually call onRealTimeChat anymore
      if (message) {
        console.log('[Dashboard] Message sent and broadcasted via Pusher:', message.message[0])
      }
    } catch (error) {
      console.log(error)
    }
  })

  return {
    messageWindowRef,
    register,
    onHandleSentMessage,
    chats,
    loading,
    chatRoom,
  }
}
