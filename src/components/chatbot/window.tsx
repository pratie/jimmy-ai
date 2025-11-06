import { ChatBotMessageProps } from '@/schemas/conversation.schema'
import React, { forwardRef, useState } from 'react'
import { UseFormRegister, UseFormWatch } from 'react-hook-form'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import RealTimeMode from './real-time'
import { getKieImageUrl } from '@/lib/kie-api'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import { CardDescription, CardTitle } from '../ui/card'
import Accordion from '../accordian'
import Bubble from './bubble'
import { Responding } from './responding'
import { Input } from '../ui/input'
import { Paperclip, Send, X, ChevronDown, MessageCircle, HelpCircle } from 'lucide-react'
import { Label } from '../ui/label'
import { Cuprum } from 'next/font/google'

const cuprum = Cuprum({ subsets: ['latin'], weight: ['400', '700'] })

type Props = {
  errors: any
  register: UseFormRegister<ChatBotMessageProps>
  watch?: UseFormWatch<ChatBotMessageProps>
  chats: { role: 'assistant' | 'user'; content: string; link?: string }[]
  onChat(): void
  onResponding: boolean
  domainName: string
  theme?: string | null
  textColor?: string | null
  themeConfig?: any
  help?: boolean
  botIcon?: string | null
  responsive?: boolean
  onClose?: () => void
  showBranding?: boolean
  realtimeMode:
    | {
        chatroom: string
        mode: boolean
      }
    | undefined
  helpdesk: {
    id: string
    question: string
    answer: string
    domainId: string | null
  }[]
  setChat: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
}

export const BotWindow = forwardRef<HTMLDivElement, Props>(
  (
    {
      errors,
      register,
      watch,
      chats,
      onChat,
      onResponding,
      domainName,
      helpdesk,
      realtimeMode,
      setChat,
      textColor,
      themeConfig,
      theme,
      help,
      botIcon,
      responsive,
      onClose,
      showBranding,
    },
    ref
  ) => {
    const [avatarError, setAvatarError] = useState(false)
    const [showJump, setShowJump] = useState(false)
    const contentValue = watch ? (watch('content') as string | undefined) : undefined
    const imageValue = watch ? (watch('image') as any) : undefined
    const hasImage = !!(imageValue && imageValue.length > 0)
    const canSend = !!(contentValue && contentValue.trim().length > 0) || hasImage

    const THEME_DEFAULT = {
      primary: '#2563EB',
      surface: '#FFFFFF',
      text: '#111827',
      headerBg: '#FFFFFF',
      headerText: '#111827',
      userBubbleBg: '#2563EB',
      userBubbleText: '#FFFFFF',
      botBubbleBg: '#F8FAFC',
      botBubbleText: '#0F172A',
      inputBg: '#FFFFFF',
      inputBorder: '#E5E7EB',
      accent: '#2563EB',
      radius: 18,
      shadow: 'sm' as 'none' | 'sm',
    }
    const t = { ...THEME_DEFAULT, ...(themeConfig || {}) }

    // Density presets: compact | cozy | comfortable
    const density = (themeConfig?.density as 'compact' | 'cozy' | 'comfortable') || 'comfortable'
    const UI = {
      // padding (px) and sizes tuned to resemble popular widgets
      bubblePadding: density === 'compact' ? 10 : density === 'comfortable' ? 16 : 12,
      bubbleFontSize: density === 'compact' ? 14 : density === 'comfortable' ? 16 : 15,
      bubbleLineHeight: density === 'compact' ? 1.45 : density === 'comfortable' ? 1.7 : 1.6,
      inputHeight: density === 'compact' ? 40 : density === 'comfortable' ? 48 : 44,
      controlSize: density === 'compact' ? 40 : density === 'comfortable' ? 48 : 44,
      headerPadX: density === 'compact' ? 12 : density === 'comfortable' ? 18 : 16,
      headerPadY: density === 'compact' ? 8 : density === 'comfortable' ? 12 : 10,
    }

    // Toggle jump-to-latest button based on scroll position
    React.useEffect(() => {
      const el = (ref as any)?.current as HTMLDivElement | null
      if (!el) return
      const onScroll = () => {
        const threshold = 120
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
        setShowJump(!nearBottom)
      }
      onScroll()
      el.addEventListener('scroll', onScroll)
      return () => el.removeEventListener('scroll', onScroll)
    }, [ref])

    console.log(errors)
    return (
      <div
        className={cn(
        'relative flex flex-col overflow-hidden',
        cuprum.className,
        responsive ? 'h-full w-full max-w-none' : 'h-[560px] w-[372px] sm:h-[640px] sm:w-[372px] md:h-[70vh] md:w-[372px]'
      )}
        style={{
          backgroundColor: t.surface,
          color: t.text,
          borderRadius: t.radius,
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          border: '1px solid #E5E7EB'
        }}
      >
        {/* Fixed Header */}
        <div
          className="flex justify-between items-center border-b shrink-0"
          style={{ backgroundColor: t.headerBg, color: t.headerText, padding: `${UI.headerPadY}px ${UI.headerPadX}px`, height: 64 }}
        >
          <div className="flex gap-2 items-center">
            <Avatar className="w-8 h-8">
              {botIcon && !avatarError ? (
                <AvatarImage
                  src={getKieImageUrl(botIcon)}
                  alt="Bot Avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <AvatarFallback className="bg-blue-500 text-white font-bold text-sm">
                  AI
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-base font-semibold leading-tight">
                {domainName || 'Assistant'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Online
                </span>
                {realtimeMode?.mode && (
                  <RealTimeMode
                    setChats={setChat}
                    chatRoomId={realtimeMode.chatroom}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {onClose && (
              <button
                type="button"
                aria-label="Close chat"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                style={{ height: 40, width: 40 }}
                title="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
        {/* Tabs and content area - proper flex layout */}
        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-2 mt-1 mb-0 grid w-[calc(100%-1rem)] grid-cols-2 bg-transparent border-b">
            <TabsTrigger
              value="chat"
              className="flex items-center justify-center gap-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 text-gray-600"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="faqs"
              className="flex items-center justify-center gap-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 text-gray-600"
            >
              <HelpCircle className="w-4 h-4" />
              FAQs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0">
            {/* Messages area - takes all available space */}
            <div
              style={{ color: textColor || t.text, backgroundColor: t.surface, paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
              className="flex-1 overflow-y-auto px-4 py-4"
              ref={ref}
            >
              <div className="flex flex-col gap-1.5">
                {chats.map((chat, key) => (
                  <Bubble
                    key={key}
                    message={chat}
                    botIcon={botIcon}
                    theme={{
                      userBg: t.userBubbleBg,
                      userText: t.userBubbleText,
                      botBg: t.botBubbleBg,
                      botText: t.botBubbleText,
                    }}
                    paddingV={12}
                    paddingH={14}
                    fontSize={UI.bubbleFontSize}
                    lineHeight={UI.bubbleLineHeight}
                  />
                ))}
                {onResponding && <Responding botIcon={botIcon} />}
              </div>
            </div>

            {/* Fixed Input Form - always at bottom */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onChat()
              }}
              className="flex px-4 items-center gap-3 bg-white border-t shrink-0"
              style={{ paddingTop: 10, paddingBottom: 10 }}
            >
              <Input
                {...register('content')}
                placeholder={`Type a message...`}
                className="flex-1 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, height: 44, fontSize: UI.bubbleFontSize }}
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                style={{ height: 40, width: 40 }}
                disabled={!canSend}
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
              <Label htmlFor="bot-image" className="cursor-pointer">
                <div
                  className="rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  style={{ height: 40, width: 40 }}
                >
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </div>
                <Input
                  {...register('image')}
                  type="file"
                  id="bot-image"
                  className="hidden"
                />
              </Label>
            </form>
          </TabsContent>

          <TabsContent value="faqs" className="flex-1 overflow-y-auto m-0 p-4">
            <div className="space-y-4">
              <div>
                <CardTitle className="text-[15px] font-semibold">Frequently Asked Questions</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Find quick answers to common questions
                </CardDescription>
              </div>
              <Separator />
              <div className="space-y-3">
                {helpdesk && helpdesk.length > 0 ? (
                  helpdesk.map((desk) => (
                    <Accordion
                      key={desk.id}
                      trigger={desk.question}
                      content={desk.answer}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No FAQs available yet</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {showBranding && (
          <div
            className="shrink-0 border-t px-2 py-1.5 text-center"
            style={{ backgroundColor: t.surface }}
          >
            <a
              href="https://chatdock.io/?utm_source=widget&utm_medium=free_badge&utm_campaign=virality"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 text-[11px] leading-4 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              aria-label="Powered by ChatDock – Get your AI assistant"
            >
              <span>Powered by ChatDock</span>
              <span aria-hidden="true">• Free Plan</span>
            </a>
          </div>
        )}

        {showJump && (
          <button
            type="button"
            onClick={() => {
              const el = (ref as any)?.current as HTMLDivElement | null
              if (el) el.scroll({ top: el.scrollHeight, behavior: 'smooth' })
            }}
            className="absolute bottom-16 right-4 z-20 rounded-full bg-white text-gray-700 px-3 py-1.5 text-sm border border-gray-300 shadow-lg flex items-center gap-1 hover:bg-gray-50 transition"
          >
            <ChevronDown className="w-4 h-4" />
            <span>Jump to latest</span>
          </button>
        )}
      </div>
    )
  }
)

BotWindow.displayName = 'BotWindow'
