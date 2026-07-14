'use client'

import { useChatWindow } from '@/hooks/conversation/use-conversation'
import { ArrowLeft, ArrowUp, Bot, Paperclip, Radio, Sparkles } from 'lucide-react'
import React from 'react'
import Bubble from '../chatbot/bubble'
import { Loader } from '../loader'

const Messenger = ({ onBack }: { onBack?: () => void }) => {
  const { messageWindowRef, chats, loading, chatRoom, onHandleSentMessage, register } = useChatWindow()

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#fafbfe]">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
        <div className="flex items-center gap-3">
          {onBack && <button type="button" onClick={onBack} aria-label="Back to conversations" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500"><ArrowLeft className="h-4 w-4" /></button>}
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0b1020] text-white"><Bot className="h-[18px] w-[18px]" /></div>
          <div><p className="text-xs font-semibold text-slate-900">Conversation workspace</p><p className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-slate-400"><Radio className="h-3 w-3 text-emerald-500" /> AI replies active</p></div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">Online</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <Loader loading={loading}>
          <div ref={messageWindowRef} className="chat-window flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-6 md:px-8">
            {chats.length ? chats.map((chat) => (
              <Bubble key={chat.id} message={{ role: chat.role!, content: chat.message }} createdAt={chat.createdAt} />
            )) : (
              <div className="m-auto flex max-w-sm flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-indigo-50 text-[#5b5ce2]"><Sparkles className="h-7 w-7" /></div>
                <h3 className="mt-5 text-lg font-black tracking-tight text-slate-900">Select a conversation</h3>
                <p className="mt-2 text-xs font-medium leading-5 text-slate-400">Read the full visitor journey, inspect captured context, or take over from the AI agent.</p>
              </div>
            )}
          </div>
        </Loader>
      </div>

      <form onSubmit={onHandleSentMessage} className="shrink-0 border-t border-slate-200 bg-white p-4 md:p-5">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-[#5b5ce2]/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#5b5ce2]/8">
          <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-slate-700" aria-label="Attach file"><Paperclip className="h-4 w-4" /></button>
          <input {...register('content')} placeholder={chatRoom ? 'Reply to this conversation…' : 'Select a conversation to reply'} disabled={!chatRoom} className="h-9 min-w-0 flex-1 bg-transparent px-1 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed" />
          <button type="submit" disabled={!chatRoom} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5b5ce2] text-white shadow-md transition hover:bg-[#4f50d8] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" aria-label="Send message"><ArrowUp className="h-4 w-4" /></button>
        </div>
      </form>
    </div>
  )
}

export default Messenger
