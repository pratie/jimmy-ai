'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React, { useState, useEffect } from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import { getKieImageUrl } from '@/lib/kie-api'
import Image from 'next/image'
import { BotIcon } from '@/icons/bot-icon'

type Props = {}

const AiChatBot = (props: Props) => {
  const [iconError, setIconError] = useState(false)
  const {
    onOpenChatBot,
    botOpened,
    onChats,
    register,
    onStartChatting,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    onRealTime,
    setOnChats,
    errors,
  } = useChatBot()

  // Debug logging for icon
  useEffect(() => {
    console.log('🤖 Current bot data:', {
      currentBot,
      hasIcon: !!currentBot?.chatBot?.icon,
      iconValue: currentBot?.chatBot?.icon,
      iconError,
      loading
    })
    if (currentBot?.chatBot?.icon) {
      console.log('🖼️ Icon URL:', getKieImageUrl(currentBot.chatBot.icon))
    }
  }, [currentBot, iconError, loading])

  useEffect(() => {
    setIconError(false)
  }, [currentBot?.chatBot?.icon])

  return (
    <div className="h-screen flex flex-col justify-end items-end gap-4">
      {botOpened && (
        <BotWindow
          errors={errors}
          setChat={setOnChats}
          realtimeMode={onRealTime}
          helpdesk={currentBot?.helpdesk!}
          domainName={currentBot?.name!}
          ref={messageWindowRef}
          help={currentBot?.chatBot?.helpdesk}
          theme={currentBot?.chatBot?.background}
          textColor={currentBot?.chatBot?.textColor}
          chats={onChats}
          register={register}
          onChat={onStartChatting}
          onResponding={onAiTyping}
          botIcon={currentBot?.chatBot?.icon || currentBot?.icon || null}
        />
      )}
      {loading ? (
        <div className="rounded-full relative shadow-md w-20 h-20 flex items-center justify-center bg-grandis animate-pulse">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div
          className="rounded-full relative cursor-pointer shadow-md w-20 h-20 flex items-center justify-center bg-grandis"
          onClick={onOpenChatBot}
        >
          {((currentBot?.chatBot?.icon || currentBot?.icon) && !iconError) ? (
            <Image
              src={getKieImageUrl(currentBot?.chatBot?.icon || currentBot?.icon || '')}
              alt="bot"
              fill
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
