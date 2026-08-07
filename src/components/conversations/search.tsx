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
      <div className="mx-4 my-3 flex shrink-0 flex-col rounded-xl bg-muted px-3 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active workspace</span>
        <span className="mt-1 truncate text-sm font-semibold text-foreground">
          {activeAgent.name}
        </span>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 flex-col px-4 py-3">
      <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Filter workspace</span>
      <select
        {...register('domain')}
        className="rounded-xl border border-border bg-background px-3 py-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25"
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
