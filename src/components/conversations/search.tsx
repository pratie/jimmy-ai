import React, { useEffect } from 'react'
import { FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { useAgent } from '@/context/agent-context'

type Props = {
  register: UseFormRegister<FieldValues>
  setValue: UseFormSetValue<FieldValues>
  onAutoSelect: (domainId: string) => void
  domains?:
    | {
        name: string
        id: string
        icon: string | null
      }[]
    | undefined
}

const ConversationSearch = ({ register, setValue, onAutoSelect, domains }: Props) => {
  const { activeAgent } = useAgent()

  // Auto-select domain based on activeAgent context first, or fallback to first domain
  useEffect(() => {
    if (activeAgent) {
      setValue('domain', activeAgent.id)
      onAutoSelect(activeAgent.id)
    } else if (domains && domains.length > 0) {
      setValue('domain', domains[0].id)
      onAutoSelect(domains[0].id)
    }
  }, [activeAgent, domains, setValue, onAutoSelect])

  if (activeAgent) {
    return (
      <div className="mx-4 my-3 flex flex-col rounded-xl bg-slate-50 px-3 py-3 font-heading">
        <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Active workspace</span>
        <span className="mt-1 flex items-center gap-2 truncate text-xs font-extrabold text-slate-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {activeAgent.name}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col px-4 py-3 font-heading">
      <span className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Filter workspace</span>
      <select
        {...register('domain')}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:border-[#5b5ce2]/40 focus:bg-white focus:ring-4 focus:ring-[#5b5ce2]/8"
      >
        <option
          disabled
          value=""
        >
          Select an agent domain
        </option>
        {domains?.map((domain) => (
          <option
            value={domain.id}
            key={domain.id}
          >
            {domain.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ConversationSearch
