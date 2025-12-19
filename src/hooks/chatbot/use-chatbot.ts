import { onAiChatBotAssistant, onGetCurrentChatBot } from '@/actions/bot'
import { postToParent } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher-client'
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
  const STORAGE_KEY = 'chatdock_anonymous_id'

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
    watch,
    formState: { errors },
  } = useForm<ChatBotMessageProps>({
    resolver: zodResolver(ChatBotMessageSchema),
  })
  const [currentBot, setCurrentBot] = useState<
    | {
      name: string
      icon: string | null
      showBranding?: boolean
      chatBot: {
        id: string
        icon: string | null
        welcomeMessage: string | null
        background: string | null
        textColor: string | null
        theme?: any | null
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
    const el = messageWindowRef.current
    if (!el) return
    const threshold = 80
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
    if (!nearBottom) return
    el.scroll({ top: el.scrollHeight, left: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    onScrollToBottom()
  }, [onChats, messageWindowRef])

  useEffect(() => {
    if (!disablePostMessage) {
      postToParent(
        JSON.stringify({
          width: botOpened ? 380 : 80,
          height: botOpened ? 620 : 80,
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
    // Always snap to bottom on user send
    { const el = messageWindowRef.current; if (el) setTimeout(() => el.scroll({ top: el.scrollHeight, behavior: 'smooth' }), 0) }

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
        { const el = messageWindowRef.current; if (el) setTimeout(() => el.scroll({ top: el.scrollHeight, behavior: 'smooth' }), 0) }
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
        { const el = messageWindowRef.current; if (el) setTimeout(() => el.scroll({ top: el.scrollHeight, behavior: 'smooth' }), 0) }
        { const el = messageWindowRef.current; if (el) setTimeout(() => el.scroll({ top: el.scrollHeight, behavior: 'smooth' }), 0) }
        if (response.live) {
          setOnRealTime((prev) => ({
            ...prev,
            chatroom: response.chatRoom,
            mode: response.live,
          }))
        } else {
          setOnChats((prev: any) => [...prev, response.response])
          { const el = messageWindowRef.current; if (el) setTimeout(() => el.scroll({ top: el.scrollHeight, behavior: 'smooth' }), 0) }
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
        { const el = messageWindowRef.current; if (el) setTimeout(() => el.scroll({ top: el.scrollHeight, behavior: 'smooth' }), 0) }
      }

      setOnAiTyping(true)

      // Use streaming API
      try {
        const streamResponse = await fetch('/api/bot/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domainId: currentBotId,
            chat: onChats,
            message: values.content,
            anonymousId,
          }),
        })
        const contentType = streamResponse.headers.get('Content-Type') || ''
        const isSSE = contentType.startsWith('text/event-stream')

        // JSON response path (e.g., live mode or errors)
        if (!isSSE) {
          const data = await streamResponse.json().catch(() => ({}))
          setOnAiTyping(false)

          if (data && data.live) {
            setOnRealTime((prev) => ({
              ...prev,
              chatroom: data.chatRoom,
              mode: true,
            }))
            // Do not add/keep empty assistant placeholder in live mode
            setOnChats((prev: any) => {
              const updated = [...prev]
              if (
                updated.length > 0 &&
                updated[updated.length - 1].role === 'assistant' &&
                (!updated[updated.length - 1].content || updated[updated.length - 1].content.trim() === '')
              ) {
                updated.pop()
              }
              return updated
            })
            return
          }

          if (data && data.error) {
            // Show server message or generic error
            setOnChats((prev: any) => [
              ...prev,
              { role: 'assistant', content: data.message || 'Sorry, I encountered an error. Please try again.' },
            ])
            return
          }

          // Fallback to generic error path
          if (!streamResponse.ok) {
            throw new Error(`HTTP error! status: ${streamResponse.status}`)
          }
          return
        }

        // SSE streaming path
        const reader = streamResponse.body?.getReader()
        const decoder = new TextDecoder()
        let assistantMessage = ''
        let buffer = ''

        if (!reader) {
          throw new Error('No response body')
        }

        // Create assistant message placeholder only for SSE
        setOnChats((prev: any) => [...prev, { role: 'assistant', content: '' }])
        { const el = messageWindowRef.current; if (el) setTimeout(() => el.scroll({ top: el.scrollHeight, behavior: 'smooth' }), 0) }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          // Process complete SSE events separated by blank line
          const events = buffer.split('\n\n')
          buffer = events.pop() || '' // keep incomplete fragment

          for (const evt of events) {
            // Join multi-line data fields if any
            const dataLines = evt
              .split('\n')
              .filter((l) => l.startsWith('data: '))
              .map((l) => l.slice(6))

            if (dataLines.length === 0) continue
            const dataPayload = dataLines.join('\n')
            if (dataPayload === '[DONE]') continue

            try {
              const parsed = JSON.parse(dataPayload)
              if (parsed.content) {
                assistantMessage += parsed.content
                setOnChats((prev: any) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage,
                  }
                  return updated
                })
              }
            } catch (_) {
              // ignore malformed partials
            }
          }
        }

        setOnAiTyping(false)
      } catch (error) {
        console.error('[Chatbot] Stream error:', error)
        setOnAiTyping(false)

        // Fallback to non-streaming: replace the assistant placeholder instead of appending
        const response = await onAiChatBotAssistant(
          currentBotId!,
          onChats,
          'user',
          values.content,
          anonymousId
        )

        if (response) {
          if (response.live) {
            // Enter realtime mode; remove empty assistant placeholder if present
            setOnRealTime((prev) => ({
              ...prev,
              chatroom: response.chatRoom,
              mode: response.live,
            }))
            setOnChats((prev: any) => {
              const updated = [...prev]
              if (
                updated.length > 0 &&
                updated[updated.length - 1].role === 'assistant' &&
                (!updated[updated.length - 1].content || updated[updated.length - 1].content.trim() === '')
              ) {
                updated.pop()
              }
              return updated
            })
          } else if (response.response) {
            setOnChats((prev: any) => {
              const updated = [...prev]
              if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                // Replace the placeholder/partial assistant message with fallback content
                updated[updated.length - 1] = response.response
              } else {
                updated.push(response.response)
              }
              return updated
            })
          }
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
    watch,
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
