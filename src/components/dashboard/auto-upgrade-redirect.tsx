'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Plan = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'

export default function AutoUpgradeRedirect({ currentPlan }: { currentPlan: Plan | undefined }) {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!currentPlan || currentPlan !== 'FREE') return
    const rawPlan = (params.get('plan') || '').toUpperCase()
    if (!rawPlan || rawPlan === 'FREE') return

    const FLAG = 'chatdock_upgrade_redirected'
    if (sessionStorage.getItem(FLAG)) return

    const billing = params.get('billing') || ''
    const qs = new URLSearchParams()
    qs.set('plan', rawPlan)
    if (billing) qs.set('billing', billing)
    sessionStorage.setItem(FLAG, '1')
    router.push(`/dashboard/settings?${qs.toString()}`)
  }, [params, router, currentPlan])

  return null
}

