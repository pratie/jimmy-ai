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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chatbot Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Loader loading={loading}>
          {currentBot ? (
            <div className="max-w-[450px]">
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
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No chatbot configuration found for this domain.
            </div>
          )}
        </Loader>
      </CardContent>
    </Card>
  )
}

export default ChatbotPreview

