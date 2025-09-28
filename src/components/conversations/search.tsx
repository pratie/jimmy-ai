import React, { useEffect } from 'react'
import { FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'

type Props = {
  register: UseFormRegister<FieldValues>
  setValue: UseFormSetValue<FieldValues>
  onAutoSelect: (domainId: string) => void
  domains?:
    | {
        name: string
        id: string
        icon: string
      }[]
    | undefined
}

const ConversationSearch = ({ register, setValue, onAutoSelect, domains }: Props) => {
  // Auto-select first domain when domains are loaded
  useEffect(() => {
    if (domains && domains.length > 0) {
      // Auto-select the first domain and trigger the manual load
      setValue('domain', domains[0].id)
      onAutoSelect(domains[0].id)
    }
  }, [domains, setValue, onAutoSelect])

  return (
    <div className="flex flex-col py-3">
      <select
        {...register('domain')}
        className="px-3 py-4 text-sm border-[1px] rounded-lg mr-5"
      >
        <option
          disabled
          value=""
        >
          Domain name
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
