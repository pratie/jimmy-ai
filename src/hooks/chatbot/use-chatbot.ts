import { onAiChatBotAssistant, onGetCurrentChatBot } from '@/actions/bot'
import { postToParent, pusherClient } from '@/lib/utils'
import { uploadFile } from '@/lib/kie-api'
import {
  ChatBotMessageProps,
  ChatBotMessageSchema,
} from '@/schemas/conversation.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'

import { useForm } from 'react-hook-form'

// Generate or retrieve anonymous user ID
const getAnonymousId = (): string => {
  const STORAGE_KEY = 'corinna_anonymous_id'

  if (typeof window === 'undefined') return ''

  let anonymousId = localStorage.getItem(STORAGE_KEY)

  if (!anonymousId) {
    // Generate UUID v4
    anonymousId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    localStorage.setItem(STORAGE_KEY, anonymousId)
  }

  return anonymousId
}

type UseChatBotOptions = {
  domainId?: string
  defaultOpen?: boolean
  disablePostMessage?: boolean
}

export const useChatBot = (options?: UseChatBotOptions) => {
  const { domainId, defaultOpen, disablePostMessage } = options || {}
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatBotMessageProps>({
    resolver: zodResolver(ChatBotMessageSchema),
  })
  const [currentBot, setCurrentBot] = useState<
    | {
        name: string
        icon: string | null
        chatBot: {
          id: string
          icon: string | null
          welcomeMessage: string | null
          background: string | null
          textColor: string | null
          helpdesk: boolean
        } | null
        helpdesk: {
          id: string
          question: string
          answer: string
          domainId: string | null
        }[]
      }
    | undefined
  >()
  const messageWindowRef = useRef<HTMLDivElement | null>(null)
  const [botOpened, setBotOpened] = useState<boolean>(!!defaultOpen)
  const onOpenChatBot = () => setBotOpened((prev) => !prev)
  const [loading, setLoading] = useState<boolean>(true)
  const [onChats, setOnChats] = useState<
    { role: 'assistant' | 'user'; content: string; link?: string }[]
  >([])
  const [onAiTyping, setOnAiTyping] = useState<boolean>(false)
  const [currentBotId, setCurrentBotId] = useState<string>()
  const [onRealTime, setOnRealTime] = useState<
    { chatroom: string; mode: boolean } | undefined
  >(undefined)

  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    onScrollToBottom()
  }, [onChats, messageWindowRef])

  useEffect(() => {
    if (!disablePostMessage) {
      postToParent(
        JSON.stringify({
          width: botOpened ? 550 : 80,
          height: botOpened ? 800 : 80,
        })
      )
    }
  }, [botOpened, disablePostMessage])

  const onGetDomainChatBot = async (id: string) => {
    setCurrentBotId(id)
    const chatbot = await onGetCurrentChatBot(id)
    if (chatbot) {
      const welcomeMessage = chatbot.chatBot?.welcomeMessage
      if (welcomeMessage) {
        setOnChats((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: welcomeMessage,
          },
        ])
      }
      setCurrentBot(chatbot)
      setLoading(false)
    } else {
      // Chatbot not found - show error message
      console.error('[Chatbot] Domain not found:', id)
      setOnChats([{
        role: 'assistant',
        content: 'Configuration error. Please contact support.'
      }])
      setLoading(false)
    }
  }

  useEffect(() => {
    // If domainId provided (preview mode), load directly and skip postMessage listener
    if (domainId) {
      onGetDomainChatBot(domainId)
      return
    }

    let handled = false
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    const handleMessage = (e: MessageEvent) => {
      console.log(e.data)
      const botid = e.data
      if (!handled && typeof botid === 'string') {
        // Validate UUID format
        if (!UUID_REGEX.test(botid)) {
          console.error('[Chatbot] Invalid domain ID format:', botid)
          setOnChats([
            {
              role: 'assistant',
              content:
                'Configuration error: Invalid domain ID. Please check your embed code.',
            },
          ])
          setLoading(false)
          return
        }

        handled = true
        onGetDomainChatBot(botid)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [domainId])

  const onStartChatting = handleSubmit(async (values) => {
    console.log('ALL VALUES', values)
    const anonymousId = getAnonymousId()

    if (values.image?.length) {
      console.log('IMAGE FROM ', values.image[0])
      const uploadResult = await uploadFile(values.image[0])

      if (!uploadResult.success) {
        console.error('Upload failed:', uploadResult.error)
        return
      }

      const uploaded = uploadResult.data!
      if (!onRealTime?.mode) {
        setOnChats((prev: any) => [
          ...prev,
          {
            role: 'user',
            content: uploaded.downloadUrl,
          },
        ])
      }

      console.log('🟡 RESPONSE FROM KIE', uploaded.downloadUrl)
      setOnAiTyping(true)
      const response = await onAiChatBotAssistant(
        currentBotId!,
        onChats,
        'user',
        uploaded.downloadUrl,
        anonymousId
      )

      if (response) {
        setOnAiTyping(false)
        if (response.live) {
          setOnRealTime((prev) => ({
            ...prev,
            chatroom: response.chatRoom,
            mode: response.live,
          }))
        } else {
          setOnChats((prev: any) => [...prev, response.response])
        }
      }
    }
    reset()

    if (values.content) {
      if (!onRealTime?.mode) {
        setOnChats((prev: any) => [
          ...prev,
          {
            role: 'user',
            content: values.content,
          },
        ])
      }

      setOnAiTyping(true)

      const response = await onAiChatBotAssistant(
        currentBotId!,
        onChats,
        'user',
        values.content,
        anonymousId
      )

      if (response) {
        setOnAiTyping(false)
        if (response.live) {
          setOnRealTime((prev) => ({
            ...prev,
            chatroom: response.chatRoom,
            mode: response.live,
          }))
        } else {
          setOnChats((prev: any) => [...prev, response.response])
        }
      }
    }
  })

  return {
    botOpened,
    onOpenChatBot,
    onStartChatting,
    onChats,
    register,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    setOnChats,
    onRealTime,
    errors,
  }
}

export const useRealTime = (
  chatRoom: string,
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
) => {
  const counterRef = useRef(1)

  useEffect(() => {
    if (!chatRoom) return

    counterRef.current = 1

    const handler = (data: any) => {
      console.log('✅', data)
      if (counterRef.current !== 1) {
        setChats((prev) => [
          ...prev,
          {
            role: data.chat.role,
            content: data.chat.message,
          },
        ])
      }
      counterRef.current += 1
    }

    pusherClient.subscribe(chatRoom)
    pusherClient.bind('realtime-mode', handler)

    return () => {
      pusherClient.unbind('realtime-mode', handler)
      pusherClient.unsubscribe(chatRoom)
    }
  }, [chatRoom, setChats])
}
