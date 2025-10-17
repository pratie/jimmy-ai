import { ChatBotMessageProps } from '@/schemas/conversation.schema'
import React, { forwardRef, useState } from 'react'
import { UseFormRegister } from 'react-hook-form'
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
  chats: { role: 'assistant' | 'user'; content: string; link?: string }[]
  onChat(): void
  onResponding: boolean
  domainName: string
  theme?: string | null
  textColor?: string | null
  help?: boolean
  botIcon?: string | null
  responsive?: boolean
  onClose?: () => void
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
      chats,
      onChat,
      onResponding,
      domainName,
      helpdesk,
      realtimeMode,
      setChat,
      textColor,
      theme,
      help,
      botIcon,
      responsive,
      onClose,
    },
    ref
  ) => {
    const [avatarError, setAvatarError] = useState(false)
    const [showJump, setShowJump] = useState(false)

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
      <div className={cn(
        'relative flex flex-col bg-white rounded-2xl border shadow-xl overflow-hidden',
        responsive ? 'h-full w-full max-w-none' : 'h-[520px] w-[360px] sm:h-[600px] sm:w-[380px] md:h-[620px] md:w-[420px]'
      )}>
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-3 py-2 border-b bg-white shrink-0">
          <div className="flex gap-2 items-center">
            <Avatar className="w-9 h-9">
              {botIcon && !avatarError ? (
                <AvatarImage
                  src={getKieImageUrl(botIcon)}
                  alt="Bot Avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm">
                  AI
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold leading-tight">
                {domainName || 'Assistant'}
              </h3>
              <p className="text-xs text-gray-500">Online</p>
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
                className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
        {/* Tabs and content area - proper flex layout */}
        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-2 mt-1 mb-0 grid w-[calc(100%-1rem)] grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              FAQs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0">
            {/* Messages area - takes all available space */}
            <div
              style={{
                background: theme || '',
                color: textColor || '',
              }}
              className="flex-1 overflow-y-auto px-3 py-2"
              ref={ref}
            >
              <div className="flex flex-col gap-2">
                {chats.map((chat, key) => (
                  <Bubble
                    key={key}
                    message={chat}
                    botIcon={botIcon}
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
              className="flex px-2 py-2 items-center gap-2 bg-white border-t shrink-0"
            >
              <Input
                {...register('content')}
                placeholder={`Type a message...`}
                className="flex-1 h-[40px] bg-gray-50 border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="shrink-0 h-[40px] w-[40px] rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
              <Label htmlFor="bot-image" className="cursor-pointer">
                <div className="h-[40px] w-[40px] rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
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

          <TabsContent value="faqs" className="flex-1 overflow-y-auto m-0 p-3">
            <div className="space-y-4">
              <div>
                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
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
