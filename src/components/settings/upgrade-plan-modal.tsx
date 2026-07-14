'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Modal from '../mondal'
import { Card, CardContent, CardDescription } from '../ui/card'
import { Plus } from 'lucide-react'
import SubscriptionForm from '../forms/settings/subscription-form'
import { useSearchParams } from 'next/navigation'

type Plan = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'

type Props = {
  currentPlan: Plan
}

export default function UpgradePlanModal({ currentPlan }: Props) {
  const params = useSearchParams()
  const [open, setOpen] = useState(false)

  // Determine if a paid plan was requested in URL
  const requestedPlan: Plan | null = useMemo(() => {
    const raw = (params.get('plan') || '').toUpperCase()
    if (raw === 'STARTER' || raw === 'PRO' || raw === 'BUSINESS') return raw
    return null
  }, [params])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (currentPlan !== 'FREE') return // Only auto-open for free users
    if (!requestedPlan) return

    const FLAG = 'chatdock_upgrade_modal_opened'
    const already = sessionStorage.getItem(FLAG)
    if (!already) {
      setOpen(true)
      sessionStorage.setItem(FLAG, '1')
      // Optional: strip params so refresh doesn't reopen
      try {
        const url = new URL(window.location.href)
        url.searchParams.delete('plan')
        // keep billing param for form preselect; it won't re-open without plan
        window.history.replaceState({}, '', url.toString())
      } catch {}
    }
  }, [requestedPlan, currentPlan])

  return (
    <Modal
      title="Choose A Plan"
      description="Upgrade your plan to unlock more messages, domains, and features."
      contentClassName="max-w-5xl w-[calc(100vw-2rem)]"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Card className="w-full cursor-pointer rounded-xl border-slate-200 bg-[#111827] text-white shadow-sm transition hover:bg-[#252d3d]">
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-left"><p className="text-sm font-semibold">Explore paid plans</p><CardDescription className="mt-1 text-xs text-white/50">Add more clients and message capacity</CardDescription></div>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10"><Plus className="h-4 w-4 text-white" /></div>
          </CardContent>
        </Card>
      }
    >
      <SubscriptionForm plan={currentPlan} />
    </Modal>
  )
}
