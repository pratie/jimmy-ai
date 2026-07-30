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
  agencyName?: string
  onSuggestion?: (suggestion: string) => void
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
      agencyName,
      onSuggestion,
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
      primary: '#0f172a', // slate-900
      surface: '#FFFFFF',
      text: '#0f172a', // slate-900
      headerBg: '#FFFFFF',
      headerText: '#0f172a', // slate-900
      userBubbleBg: '#0f172a', // slate-900
      userBubbleText: '#FFFFFF',
      botBubbleBg: '#f1f5f9', // slate-100
      botBubbleText: '#0f172a', // slate-900
      inputBg: '#FFFFFF',
      inputBorder: '#e2e8f0', // slate-200
      accent: '#0f172a', // slate-900
      radius: 16,
      shadow: 'sm' as 'none' | 'sm',
    }
    const t = { ...THEME_DEFAULT, ...(themeConfig || {}) }

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

    const showFaqs = Boolean(help || helpdesk?.length)
    return (
      <div
        className={cn(
          'relative flex flex-col overflow-hidden font-sans h-full w-full'
        )}
        style={{
          backgroundColor: t.surface || '#FFFFFF',
          color: t.text,
          borderRadius: responsive ? 0 : t.radius,
          boxShadow: responsive ? 'none' : '0 20px 50px -12px rgba(0,0,0,0.2)',
          border: responsive ? 'none' : '1px solid rgba(0,0,0,0.15)'
        }}
      >
        {/* Fixed Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-3.5" style={{ backgroundColor: t.headerBg, color: t.headerText }}>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-black/5">
              {botIcon && !avatarError ? (
                <AvatarImage
                  src={getKieImageUrl(botIcon)}
                  alt="Bot Avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <AvatarFallback className="bg-slate-900 text-white font-bold text-sm">
                  AI
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold leading-tight">
                {domainName || 'Assistant'}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] opacity-60">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                AI assistant · Online
              </p>
              {realtimeMode?.mode && (
                <RealTimeMode
                  setChats={setChat}
                  chatRoomId={realtimeMode.chatroom}
                />
              )}
            </div>
          </div>
          <div className="flex items-center">
            {onClose && (
              <button
                type="button"
                aria-label="Close chat"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-current opacity-50 transition hover:bg-black/5 hover:opacity-80"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {/* Tabs and content area - proper flex layout */}
        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          {showFaqs && <div className="border-b border-black/5 px-4 pt-1" style={{ backgroundColor: t.surface, color: t.text }}>
            <TabsList className="w-full justify-start gap-6 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="chat"
                className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent px-0 py-2 text-sm font-medium text-current opacity-50 data-[state=active]:border-current data-[state=active]:opacity-100 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="faqs"
                className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent px-0 py-2 text-sm font-medium text-current opacity-50 data-[state=active]:border-current data-[state=active]:opacity-100 transition-opacity"
              >
                <HelpCircle className="w-4 h-4" />
                FAQs
              </TabsTrigger>
            </TabsList>
          </div>}

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0">
            {/* Messages area - takes all available space */}
            <div
              style={{ color: textColor || t.text, backgroundColor: t.surface }}
              className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
              ref={ref}
            >
              <div className="flex flex-col gap-4">
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
                  />
                ))}
                {onResponding && <Responding botIcon={botIcon} theme={{ botBg: t.botBubbleBg, botText: t.botBubbleText }} />}
                {chats.length <= 1 && onSuggestion && (
                  <div className="ml-8 mt-1" style={{ color: t.text }}>
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] opacity-50">Popular questions</p>
                    <div className="flex flex-wrap gap-2">
                      {['What do you offer?', 'How does pricing work?', 'Can I book a call?'].map((suggestion) => (
                        <button key={suggestion} type="button" onClick={() => onSuggestion(suggestion)} className="rounded-full border px-3 py-1.5 text-[11px] font-medium opacity-70 shadow-sm transition hover:opacity-100" style={{ borderColor: `${t.text}26` }}>{suggestion}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Input Form - always at bottom */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onChat()
              }}
              className="flex shrink-0 items-end gap-2 border-t border-black/5 px-3.5 py-3"
              style={{ backgroundColor: t.surface }}
            >
              <div className="flex-1 relative">
                <Input
                  {...register('content')}
                  placeholder="Ask a question…"
                  className="min-h-[42px] w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm shadow-none transition-all focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
                  style={{ backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
                />
                <Label htmlFor="bot-image" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <Paperclip className="w-4 h-4" />
                  <Input
                    {...register('image')}
                    type="file"
                    id="bot-image"
                    className="hidden"
                  />
                </Label>
              </div>
              <button
                type="submit"
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-200"
                style={{ backgroundColor: canSend ? t.primary : undefined }}
                disabled={!canSend}
                aria-label="Send"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </TabsContent>

          <TabsContent value="faqs" className="flex-1 overflow-y-auto m-0 p-4" style={{ backgroundColor: t.surface, color: t.text }}>
            <div className="space-y-4">
              <div>
                <CardTitle className="text-base font-semibold text-current">Frequently Asked Questions</CardTitle>
                <CardDescription className="text-sm mt-1 text-current opacity-60">
                  Find quick answers to common questions
                </CardDescription>
              </div>
              <Separator className="bg-black/5" />
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
                  <div className="text-center py-12 opacity-50">
                    <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No FAQs available yet</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {showBranding && (
          <div
            className="shrink-0 border-t border-black/5 px-2 py-2 text-center"
            style={{ backgroundColor: t.surface, color: t.text }}
          >
            {agencyName ? (
              <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-medium opacity-50 tracking-wide">
                Powered by {agencyName}
              </span>
            ) : (
              <a
                href="https://chatdock.io/?utm_source=widget&utm_medium=free_badge&utm_campaign=virality"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-[10px] font-medium opacity-50 hover:opacity-80 transition-opacity tracking-wide"
                aria-label="Powered by chatdock.io – Get your AI assistant"
              >
                Powered by chatdock.io
              </a>
            )}
          </div>
        )}

        {showJump && (
          <button
            type="button"
            onClick={() => {
              const el = (ref as any)?.current as HTMLDivElement | null
              if (el) el.scroll({ top: el.scrollHeight, behavior: 'smooth' })
            }}
            className="absolute bottom-20 right-6 z-20 rounded-full bg-white text-slate-600 px-3 py-1.5 text-xs font-medium border border-slate-200 shadow-lg flex items-center gap-1.5 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
          >
            <ChevronDown className="w-3 h-3" />
            <span>Latest</span>
          </button>
        )}
      </div>
    )
  }
)

BotWindow.displayName = 'BotWindow'
