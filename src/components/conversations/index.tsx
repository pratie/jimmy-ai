'use client'
import { useConversation } from '@/hooks/conversation/use-conversation'
import React from 'react'
import ConversationSearch from './search'
import { Loader } from '../loader'
import ChatCard from './chat-card'
import { Inbox } from 'lucide-react'

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
    <div className="h-full bg-white">
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <p className="text-sm font-black text-slate-950">Customer conversations</p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">Review, qualify, or take over live.</p>
      </div>
      <ConversationSearch
        domains={domains}
        register={register}
        setValue={setValue}
        onAutoSelect={onLoadChatRoomsForDomain}
      />
      <div className="flex flex-col py-2">
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
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Inbox className="h-5 w-5" /></div>
              <p className="mt-3 text-xs font-black text-slate-700">No conversations yet</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">New visitor messages will appear here.</p>
            </div>
          )}
        </Loader>
      </div>
    </div>
  )
}

export default ConversationMenu
