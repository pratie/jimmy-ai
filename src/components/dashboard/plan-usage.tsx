import React from 'react'
import { ProgressBar } from '../progress'
import { getPlanLimits } from '@/lib/plans'

type PlanUsageProps = {
  plan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'
  messageCredits: number
  messagesUsed: number
  domains: number
  clients: number
}

export const PlanUsage = ({
  plan,
  messageCredits,
  messagesUsed,
  domains,
  clients,
}: PlanUsageProps) => {
  const limits = getPlanLimits(plan)
  const messagesRemaining = messageCredits - messagesUsed

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProgressBar
        end={messageCredits}
        label="Messages"
        credits={messagesRemaining}
      />
      <ProgressBar
        end={limits.domains === Infinity ? domains + 10 : limits.domains}
        label="Domains"
        credits={domains}
      />
      <ProgressBar
        end={clients + 10}
        label="Contacts"
        credits={clients}
      />
    </div>
  )
}
