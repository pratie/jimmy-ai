'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React, { useState, useEffect } from 'react'
import { BotWindow } from './window'
import { getKieImageUrl } from '@/lib/kie-api'
import Image from 'next/image'
import { Loader } from '@/components/loader'

type Props = {}

const AiChatBot = (props: Props) => {
  const [iconError, setIconError] = useState(false)
  const {
    onOpenChatBot,
    botOpened,
    onChats,
    register,
    setValue,
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
        <div className="absolute inset-0 pointer-events-auto bg-transparent">
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
              onSuggestion={(suggestion) => setValue('content', suggestion, { shouldValidate: true })}
              watch={watch}
              onChat={onStartChatting}
              onResponding={onAiTyping}
              botIcon={currentBot?.chatBot?.icon || currentBot?.icon || null}
              showBranding={Boolean(currentBot?.showBranding)}
              agencyName={currentBot?.agencyName}
              responsive={typeof window !== 'undefined' && window.innerWidth < 640}
              onClose={onOpenChatBot}
            />
          </Loader>
        </div>
      )}

      {/* Always show the bubble promptly, even while loading */}
      {!botOpened && (
        <button
          type="button"
          aria-label={`Open chat with ${currentBot?.name || 'assistant'}`}
          className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,.24)] focus:outline-none focus:ring-4 focus:ring-indigo-200 pointer-events-auto"
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
            <Image src="/images/chatdock-mark.png" alt="" fill sizes="64px" className="object-contain p-2" />
          )}
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default AiChatBot
