'use client'

import React from 'react'
import { ArrowLeft, Bot, Mail, MessagesSquare, Phone, Sparkles, User } from 'lucide-react'

import { formatMessageTime, useChatWindow } from '@/hooks/conversation/use-conversation'
import { renderMessageContent } from '../chatbot/bubble'
import { cn } from '@/lib/utils'
import { Loader } from '../loader'

/** Contact details the assistant captured, shown above the transcript. */
const LeadSummary = ({
  lead,
}: {
  lead: { name: string | null; email: string | null; phone: string | null }
}) => {
  const fields = [
    lead.name ? { icon: User, value: lead.name, label: 'Name' } : null,
    lead.email ? { icon: Mail, value: lead.email, label: 'Email' } : null,
    lead.phone ? { icon: Phone, value: lead.phone, label: 'Phone' } : null,
  ].filter(Boolean) as { icon: typeof User; value: string; label: string }[]

  if (!fields.length) return null

  return (
    <div className="mx-auto mb-2 w-full max-w-3xl rounded-xl border border-border bg-card p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Captured contact details
      </p>
      <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-2">
        {fields.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-foreground">
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">{label}: </span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** One turn of the transcript. Read-only — nothing here can be sent from. */
const TranscriptBubble = ({
  role,
  message,
  createdAt,
}: {
  role: 'assistant' | 'user'
  message: string
  createdAt: Date
}) => {
  const isAssistant = role === 'assistant'

  return (
    <div className={cn('flex w-full flex-col gap-1', isAssistant ? 'items-start' : 'items-end')}>
      <div
        className={cn(
          'max-w-[min(32rem,85%)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isAssistant
            ? 'rounded-bl-sm bg-muted text-foreground'
            : 'rounded-br-sm bg-primary text-primary-foreground'
        )}
      >
        <span className="whitespace-pre-wrap break-words">{renderMessageContent(message)}</span>
      </div>
      <span className="px-1 text-[10px] text-muted-foreground">
        {isAssistant ? 'Assistant' : 'Visitor'} · {formatMessageTime(createdAt)}
      </span>
    </div>
  )
}

const Messenger = ({ onBack }: { onBack?: () => void }) => {
  const { messageWindowRef, chats, loading, chatRoom, lead } = useChatWindow()

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-border bg-card px-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Bot className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">Transcript</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {chatRoom
              ? 'Your AI assistant handles all replies'
              : 'Pick a conversation to read it'}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <Loader loading={loading}>
          <div
            ref={messageWindowRef}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-6 md:px-8"
          >
            {!chatRoom ? (
              <div className="m-auto flex max-w-sm flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-muted text-muted-foreground">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  Select a conversation
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Read the full visitor journey and any contact details the assistant captured
                  along the way.
                </p>
              </div>
            ) : chats.length ? (
              <>
                {lead && <LeadSummary lead={lead} />}
                {chats.map((chat) => (
                  <TranscriptBubble
                    key={chat.id}
                    role={chat.role}
                    message={chat.message}
                    createdAt={chat.createdAt}
                  />
                ))}
              </>
            ) : (
              <div className="m-auto flex max-w-sm flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-muted text-muted-foreground">
                  <MessagesSquare className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">No messages</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This conversation was started but nothing was ever said.
                </p>
              </div>
            )}
          </div>
        </Loader>
      </div>
    </div>
  )
}

export default Messenger
