'use client'
import { useChatTime } from '@/hooks/conversation/use-conversation'
import React from 'react'
import { CardDescription } from '../ui/card'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { User } from 'lucide-react'
import { UrgentIcon } from '@/icons/urgent-icon'

type Props = {
  title: string
  description?: string
  createdAt: Date
  id: string
  onChat(): void
  seen?: boolean
}

const ChatCard = ({
  title,
  description,
  createdAt,
  onChat,
  id,
  seen,
}: Props) => {
  const { messageSentAt, urgent } = useChatTime(createdAt, id)

  return (
    <button
      onClick={onChat}
      className="w-full border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-indigo-50/50"
    >
      <div className="flex gap-3">
        <div>
          <Avatar>
            <AvatarFallback className="bg-slate-100 text-slate-500">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex min-w-0 flex-1 justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CardDescription className="truncate font-black leading-none text-slate-900">
                {title}
              </CardDescription>
              {urgent && !seen && <UrgentIcon />}
            </div>
            <CardDescription className="mt-1.5 truncate text-[11px] text-slate-400">
              {description
                ? description.substring(0, 20) + '...'
                : 'This chatroom is empty'}
            </CardDescription>
          </div>
          <div className="shrink-0">
            <CardDescription className="text-[10px] font-semibold text-slate-400">
              {createdAt ? messageSentAt : ''}
            </CardDescription>
          </div>
        </div>
      </div>
    </button>
  )
}

export default ChatCard
