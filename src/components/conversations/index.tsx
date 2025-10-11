'use client'
import { useConversation } from '@/hooks/conversation/use-conversation'
import React from 'react'
import ConversationSearch from './search'
import { Loader } from '../loader'
import ChatCard from './chat-card'
import { CardDescription } from '../ui/card'

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
  const { register, setValue, chatRooms, loading, onGetActiveChatMessages, onLoadChatRoomsForDomain } =
    useConversation()

  return (
    <div className="py-3 px-0">
      <ConversationSearch
        domains={domains}
        register={register}
        setValue={setValue}
        onAutoSelect={onLoadChatRoomsForDomain}
      />
      <div className="flex flex-col">
        <Loader loading={loading}>
          {chatRooms.length ? (
            chatRooms.map((room) => (
              <ChatCard
                seen={room.chatRoom[0].message[0]?.seen}
                id={room.chatRoom[0].id}
                onChat={() => onGetActiveChatMessages(room.chatRoom[0].id)}
                createdAt={room.chatRoom[0].message[0]?.createdAt}
                key={room.chatRoom[0].id}
                title={room.email || '👤 Anonymous User'}
                description={room.chatRoom[0].message[0]?.message}
              />
            ))
          ) : (
            <CardDescription className="px-5 py-8 text-center text-muted-foreground">
              No conversations yet for this domain
            </CardDescription>
          )}
        </Loader>
      </div>
    </div>
  )
}

export default ConversationMenu
