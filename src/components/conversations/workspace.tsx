'use client'

import { useChatContext } from '@/context/user-chat-context'
import ConversationMenu from '.'
import Messenger from './messenger'

type Domain = { name: string; id: string; icon: string }

export default function ConversationWorkspace({ domains }: { domains?: Domain[] }) {
  const { chatRoom, setChatRoom, setChats } = useChatContext()

  const closeConversation = () => {
    setChatRoom(undefined)
    setChats([])
  }

  return (
    <div className="mx-auto h-full max-w-[1280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
      <div className="hidden h-full md:flex">
        <div className="w-[340px] shrink-0 overflow-y-auto border-r border-slate-200"><ConversationMenu domains={domains} /></div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden"><Messenger /></div>
      </div>
      <div className="h-full md:hidden">
        {chatRoom ? <Messenger onBack={closeConversation} /> : <ConversationMenu domains={domains} />}
      </div>
    </div>
  )
}
