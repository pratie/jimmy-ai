import { ChatBotMessageProps } from '@/schemas/conversation.schema'
import React, { forwardRef, useState } from 'react'
import { UseFormRegister } from 'react-hook-form'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import RealTimeMode from './real-time'
import { getKieImageUrl } from '@/lib/kie-api'
import TabsMenu from '../tabs/intex'
import { BOT_TABS_MENU } from '@/constants/menu'
import ChatIcon from '@/icons/chat-icon'
import { TabsContent } from '../ui/tabs'
import { Separator } from '../ui/separator'
import Bubble from './bubble'
import { Responding } from './responding'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Paperclip, Send, X, ChevronDown } from 'lucide-react'
import { Label } from '../ui/label'
import { CardDescription, CardTitle } from '../ui/card'
import Accordion from '../accordian'
import UploadButton from '../upload-button'

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
      <div className={(responsive ? 'h-full w-full max-w-none' : 'h-[620px] w-[420px]') + ' relative flex flex-col min-h-0 bg-white rounded-2xl border shadow-xl overflow-hidden'}>
        <div className="flex justify-between px-4 pt-4">
          <div className="flex gap-2">
            <Avatar className="w-20 h-20">
              {botIcon && !avatarError ? (
                <AvatarImage
                  src={getKieImageUrl(botIcon)}
                  alt="Bot Avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl">
                  AI
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex items-start flex-col">
              <h3 className="text-lg font-bold leading-none">
                {domainName || 'Sales Rep'}
              </h3>
              <p className="text-sm text-muted-foreground">Chat Assistant</p>
              {realtimeMode?.mode && (
                <RealTimeMode
                  setChats={setChat}
                  chatRoomId={realtimeMode.chatroom}
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onClose && (
              <button
                type="button"
                aria-label="Minimize chat"
                onClick={onClose}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-muted transition"
                title="Minimize"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                aria-label="Close chat"
                onClick={onClose}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-muted transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <TabsMenu
          triggers={BOT_TABS_MENU}
          className=" bg-transparent border-[1px] border-border m-2"
        >
          <TabsContent value="chat">
            <Separator orientation="horizontal" />
            <div className="flex flex-col h-full min-h-0">
              <div
                style={{
                  background: theme || '',
                  color: textColor || '',
                }}
                className="px-3 flex flex-1 min-h-[300px] flex-col py-5 gap-3 chat-window overflow-y-auto overscroll-contain scroll-smooth"
                ref={ref}
              >
                {chats.map((chat, key) => (
                  <Bubble
                    key={key}
                    message={chat}
                    botIcon={botIcon}
                  />
                ))}
                {onResponding && <Responding botIcon={botIcon} />}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  onChat()
                }}
                className="flex px-3 py-3 items-center gap-2 bg-porcelain border-t"
              >
                <Input
                  {...register('content')}
                  placeholder={`Ask anything about ${domainName}...`}
                  className="focus-visible:ring-0 flex-1 min-h-[44px] focus-visible:ring-offset-0 bg-porcelain rounded-md outline-none"
                />
                <Button type="submit" className="shrink-0" aria-label="Send">
                  <Send />
                </Button>
                <Label htmlFor="bot-image">
                  <Paperclip />
                  <Input
                    {...register('image')}
                    type="file"
                    id="bot-image"
                    className="hidden"
                  />
                </Label>
              </form>
            </div>
            {showJump && (
              <button
                type="button"
                onClick={() => {
                  const el = (ref as any)?.current as HTMLDivElement | null
                  if (el) el.scroll({ top: el.scrollHeight, behavior: 'smooth' })
                }}
                className="absolute bottom-20 right-4 z-20 rounded-full bg-main text-black px-3 py-1.5 text-xs border border-border shadow-md flex items-center gap-1"
              >
                <ChevronDown className="w-4 h-4" />
                Jump to latest
              </button>
            )}
          </TabsContent>

          <TabsContent value="faqs">
            <div className="h-[485px] overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
              <div>
                <CardTitle>FAQs</CardTitle>
                <CardDescription>
                  Browse from a list of questions people usually ask.
                </CardDescription>
              </div>
              <Separator orientation="horizontal" />

              {helpdesk.map((desk) => (
                <Accordion
                  key={desk.id}
                  trigger={desk.question}
                  content={desk.answer}
                />
              ))}
            </div>
          </TabsContent>
        </TabsMenu>
      </div>
    )
  }
)

BotWindow.displayName = 'BotWindow'
