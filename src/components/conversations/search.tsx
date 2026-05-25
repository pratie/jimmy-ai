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
      <div className="flex flex-col px-5 py-3.5 bg-muted/20 border-b border-border font-heading">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Workspace</span>
        <span className="text-sm font-extrabold text-foreground mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {activeAgent.name}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col py-3 px-5 font-heading">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Domain</span>
      <select
        {...register('domain')}
        className="px-3 py-3 text-xs font-semibold border border-input rounded-xl bg-background focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
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
