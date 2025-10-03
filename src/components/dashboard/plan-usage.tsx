import React from 'react'
import { ProgressBar } from '../progress'

type PlanUsageProps = {
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  credits: number
  domains: number
  clients: number
}

export const PlanUsage = ({
  plan,
  credits,
  domains,
  clients,
}: PlanUsageProps) => {
  const planLimits = {
    STANDARD: { credits: 10, domains: 1, contacts: 10 },
    PRO: { credits: 50, domains: 2, contacts: 50 },
    ULTIMATE: { credits: 500, domains: 100, contacts: 500 },
  }

  const limits = planLimits[plan] || planLimits.STANDARD

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProgressBar
        end={limits.credits}
        label="Email Credits"
        credits={credits}
      />
      <ProgressBar
        end={limits.domains}
        label="Domains"
        credits={domains}
      />
      <ProgressBar
        end={limits.contacts}
        label="Contacts"
        credits={clients}
      />
    </div>
  )
}
