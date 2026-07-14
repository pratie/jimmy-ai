'use client'

import { BotWindow } from '@/components/chatbot/window'
import { Loader } from '@/components/loader'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import { cn } from '@/lib/utils'
import { Check, MessageSquareText, RotateCcw, ShieldCheck } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const TESTS = [
  { id: 'accuracy', label: 'Core service question', hint: 'Ask what the business offers.' },
  { id: 'objection', label: 'Pricing or objection', hint: 'Check how it handles uncertainty.' },
  { id: 'conversion', label: 'Conversion path', hint: 'Try to book or leave contact details.' },
  { id: 'boundary', label: 'Out-of-scope question', hint: 'Confirm it stays within approved knowledge.' },
]

export default function ChatbotPreview({ domainId }: { domainId: string }) {
  const [checked, setChecked] = useState<string[]>([])
  const {
    register,
    setValue,
    watch,
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

  useEffect(() => setOnChats([]), [domainId, setOnChats])

  const resetConversation = () => {
    setOnChats(currentBot?.chatBot?.welcomeMessage ? [{ role: 'assistant', content: currentBot.chatBot.welcomeMessage }] : [])
    setValue('content', '')
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-indigo-600" /><div><p className="text-sm font-semibold text-slate-900">Visitor conversation</p><p className="mt-0.5 text-[10px] text-slate-400">Uses the live agent configuration</p></div></div>
          <button type="button" onClick={resetConversation} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
        </div>
        <div className="bg-[linear-gradient(135deg,#f8f9fc_0%,#eef0f6_100%)] p-3 sm:p-5">
          <Loader loading={loading}>
            {currentBot ? (
              <div className="mx-auto h-[600px] max-w-[430px]">
                <BotWindow
                  errors={errors}
                  setChat={setOnChats}
                  realtimeMode={onRealTime}
                  helpdesk={currentBot.helpdesk || []}
                  domainName={currentBot.name}
                  ref={messageWindowRef}
                  help={currentBot.chatBot?.helpdesk}
                  theme={currentBot.chatBot?.background}
                  textColor={currentBot.chatBot?.textColor}
                  themeConfig={currentBot.chatBot?.theme as any}
                  chats={onChats}
                  register={register}
                  watch={watch}
                  onChat={onStartChatting}
                  onResponding={onAiTyping}
                  botIcon={currentBot.chatBot?.icon || currentBot.icon || null}
                  onSuggestion={(suggestion) => setValue('content', suggestion, { shouldValidate: true })}
                />
              </div>
            ) : <div className="grid h-[500px] place-items-center text-sm text-slate-500">No agent configuration was found.</div>}
          </Loader>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.04)]">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-900">Launch review</p><p className="mt-1 text-xs text-slate-500">A practical client handoff checklist.</p></div><span className="text-xs font-semibold text-indigo-600">{checked.length}/{TESTS.length}</span></div>
          <div className="mt-5 space-y-2">
            {TESTS.map((test) => {
              const done = checked.includes(test.id)
              return <button key={test.id} type="button" onClick={() => setChecked((items) => done ? items.filter((id) => id !== test.id) : [...items, test.id])} className={cn('flex w-full items-start gap-3 rounded-xl border p-3 text-left transition', done ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50')}><span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border', done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent')}><Check className="h-3 w-3" /></span><span><span className="block text-xs font-semibold text-slate-800">{test.label}</span><span className="mt-1 block text-[11px] leading-4 text-slate-500">{test.hint}</span></span></button>
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-[#111827] p-5 text-white">
          <ShieldCheck className="h-5 w-5 text-[#aaaaff]" />
          <p className="mt-4 text-sm font-semibold">Review the answer, not just the styling</p>
          <p className="mt-2 text-xs leading-5 text-white/50">If an answer feels weak, update the knowledge source or agent instructions before installing the widget.</p>
        </div>
      </aside>
    </div>
  )
}
