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
        <Card className="border-dashed bg-cream border-brand-base-300 w-full cursor-pointer h-[270px] flex justify-center items-center">
          <CardContent className="flex gap-2 items-center">
            <div className="rounded-full border-2 p-1 border-brand-base-300">
              <Plus className="text-brand-primary/60" />
            </div>
            <CardDescription className="font-semibold">Upgrade Plan</CardDescription>
          </CardContent>
        </Card>
      }
    >
      <SubscriptionForm plan={currentPlan} />
    </Modal>
  )
}

