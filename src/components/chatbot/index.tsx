'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React, { useState, useEffect } from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import { getUploadCareUrl } from '@/lib/uploadcare'
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
      console.log('🖼️ Icon URL:', getUploadCareUrl(currentBot.chatBot.icon))
    }
  }, [currentBot, iconError, loading])

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
          botIcon={currentBot?.chatBot?.icon}
        />
      )}
      <div
        className={cn(
          'rounded-full relative cursor-pointer shadow-md w-20 h-20 flex items-center justify-center bg-grandis',
          loading ? 'invisible' : 'visible'
        )}
        onClick={onOpenChatBot}
      >
        {currentBot?.chatBot?.icon && !iconError ? (
          <Image
            src={getUploadCareUrl(currentBot.chatBot.icon)}
            alt="bot"
            fill
            onError={() => setIconError(true)}
            onLoad={() => setIconError(false)}
          />
        ) : (
          <BotIcon />
        )}
      </div>
    </div>
  )
}

export default AiChatBot
