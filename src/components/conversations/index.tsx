'use client'

import React from 'react'
import { Inbox } from 'lucide-react'

import { useConversation } from '@/hooks/conversation/use-conversation'
import { useChatContext } from '@/context/user-chat-context'
import ConversationSearch from './search'
import ChatCard from './chat-card'
import { Loader } from '../loader'

type Props = {
  domains?:
    | {
        name: string
        id: string
        icon: string
      }[]
    | undefined
}

const ConversationMenu = ({ domains }: Props) => {
  const {
    register,
    setValue,
    conversations,
    loading,
    onGetActiveChatMessages,
    onLoadChatRoomsForDomain,
  } = useConversation()
  const { chatRoom } = useChatContext()

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="shrink-0 border-b border-border px-5 pb-4 pt-5">
        <p className="text-sm font-semibold text-foreground">Conversations</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Every chat your assistant has handled.
        </p>
      </div>

      <ConversationSearch
        domains={domains}
        register={register}
        setValue={setValue}
        onAutoSelect={onLoadChatRoomsForDomain}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Loader loading={loading}>
          {conversations.length ? (
            conversations.map((conversation) => (
              <ChatCard
                key={conversation.id}
                conversation={conversation}
                active={chatRoom === conversation.id}
                onChat={() => onGetActiveChatMessages(conversation.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">No conversations yet</p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Share your assistant or test it in the playground — visitor chats will show up
                here.
              </p>
            </div>
          )}
        </Loader>
      </div>
    </div>
  )
}

export default ConversationMenu
