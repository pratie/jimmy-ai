'use client'

import React from 'react'
import { User } from 'lucide-react'

import { Avatar, AvatarFallback } from '../ui/avatar'
import { cn } from '@/lib/utils'
import { formatInboxTime } from '@/hooks/conversation/use-conversation'
import type { InboxConversation } from '@/actions/conversation'

type Props = {
  conversation: InboxConversation
  active: boolean
  onChat(): void
}

/** Best available name for a visitor: whatever the assistant managed to capture. */
export const visitorLabel = (lead: InboxConversation['lead']) =>
  lead?.name || lead?.email || lead?.phone || 'Anonymous visitor'

const ChatCard = ({ conversation, active, onChat }: Props) => {
  const preview = conversation.preview

  return (
    <button
      type="button"
      onClick={onChat}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'w-full border-b border-border px-4 py-3.5 text-left transition-colors',
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        active && 'bg-accent'
      )}
    >
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {visitorLabel(conversation.lead)}
            </p>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatInboxTime(conversation.lastMessageAt ?? conversation.startedAt)}
            </span>
          </div>

          <p className="truncate text-xs text-muted-foreground">
            {preview?.message
              ? `${preview.role === 'assistant' ? 'Assistant: ' : ''}${preview.message}`
              : 'No messages yet'}
          </p>
        </div>
      </div>
    </button>
  )
}

export default ChatCard
