'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React, { useState, useEffect } from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import { getKieImageUrl } from '@/lib/kie-api'
import Image from 'next/image'
import { X } from 'lucide-react'
import { BotIcon } from '@/icons/bot-icon'
import { Loader } from '@/components/loader'

type Props = {}

const AiChatBot = (props: Props) => {
  const [iconError, setIconError] = useState(false)
  const {
    onOpenChatBot,
    botOpened,
    onChats,
    register,
    watch,
    onStartChatting,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    onRealTime,
    setOnChats,
    errors,
  } = useChatBot()

  // Reset icon error when icon changes
  useEffect(() => {
    setIconError(false)
  }, [currentBot?.chatBot?.icon])

  return (
    <div className="fixed inset-0 flex flex-col justify-end items-end p-0 pointer-events-none bg-transparent">
      {botOpened && (
        <div className="relative pointer-events-auto bg-transparent">
          {/* Defer loading spinner to the chat window area */}
          <Loader loading={loading}>
            <BotWindow
              errors={errors}
              setChat={setOnChats}
              realtimeMode={onRealTime}
              helpdesk={currentBot?.helpdesk || []}
              domainName={currentBot?.name || 'Assistant'}
              ref={messageWindowRef}
              help={currentBot?.chatBot?.helpdesk}
              theme={currentBot?.chatBot?.background}
              textColor={currentBot?.chatBot?.textColor}
              themeConfig={currentBot?.chatBot?.theme as any}
              chats={onChats}
              register={register}
              watch={watch}
              onChat={onStartChatting}
              onResponding={onAiTyping}
              botIcon={currentBot?.chatBot?.icon || currentBot?.icon || null}
              showBranding={Boolean(currentBot?.showBranding)}
              responsive={typeof window !== 'undefined' && window.innerWidth < 640}
              onClose={onOpenChatBot}
            />
          </Loader>
        </div>
      )}

      {/* Always show the bubble promptly, even while loading */}
      {!botOpened && (
        <div
          className="rounded-full overflow-hidden relative cursor-pointer w-16 h-16 flex items-center justify-center bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow pointer-events-auto"
          onClick={onOpenChatBot}
        >
          {((currentBot?.chatBot?.icon || currentBot?.icon) && !iconError) ? (
            <Image
              src={getKieImageUrl(currentBot?.chatBot?.icon || currentBot?.icon || '')}
              alt="bot"
              fill
              className="object-cover rounded-full"
              onError={() => setIconError(true)}
              onLoad={() => setIconError(false)}
            />
          ) : (
            <BotIcon />
          )}
        </div>
      )}
    </div>
  )
}

export default AiChatBot
