'use client'

import { useChatContext } from '@/context/user-chat-context'
import ConversationMenu from '.'
import Messenger from './messenger'

type Domain = { name: string; id: string; icon: string }

export default function ConversationWorkspace({ domains }: { domains?: Domain[] }) {
  const { chatRoom, setChatRoom, setChats, setLead } = useChatContext()

  const closeConversation = () => {
    setChatRoom(undefined)
    setChats([])
    setLead(null)
  }

  return (
    <div className="mx-auto h-full max-w-[1280px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="hidden h-full md:flex">
        <div className="flex w-[340px] shrink-0 flex-col border-r border-border"><ConversationMenu domains={domains} /></div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden"><Messenger /></div>
      </div>
      <div className="h-full md:hidden">
        {chatRoom ? <Messenger onBack={closeConversation} /> : <ConversationMenu domains={domains} />}
      </div>
    </div>
  )
}
