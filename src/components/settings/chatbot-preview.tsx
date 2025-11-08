'use client'

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BotWindow } from '@/components/chatbot/window'
import { Loader } from '@/components/loader'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'

type Props = {
  domainId: string
}

const ChatbotPreview = ({ domainId }: Props) => {
  const {
    register,
    watch,
    onStartChatting,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    onRealTime,
    onChats,
    setOnChats,
    errors,
  } = useChatBot({ domainId, defaultOpen: true, disablePostMessage: true })

  useEffect(() => {
    // Clear chats when switching domains (defensive)
    setOnChats([])
  }, [domainId, setOnChats])

  return (
    <Card className="w-full border-[3px] border-black rounded-[22px] shadow-[8px_8px_0px_rgba(0,0,0,0.85)]">
      <CardHeader className="border-b-[3px] border-black">
        <CardTitle>
          {currentBot?.name ? `${currentBot.name} GPT` : 'Assistant GPT'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6">
          <Loader loading={loading}>
            {currentBot ? (
              <div className="w-full h-[560px] sm:h-[620px] md:h-[680px] lg:h-[720px]">
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
                  themeConfig={currentBot?.chatBot?.theme as any}
                  chats={onChats}
                  register={register}
                  watch={watch}
                  onChat={onStartChatting}
                  onResponding={onAiTyping}
                  botIcon={currentBot?.chatBot?.icon || currentBot?.icon || null}
                  responsive
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No chatbot configuration found for this domain.
              </div>
            )}
          </Loader>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatbotPreview
