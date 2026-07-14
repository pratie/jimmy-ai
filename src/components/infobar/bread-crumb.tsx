'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const routeDetails: Record<string, { title: string; eyebrow: string }> = {
  dashboard: { title: 'Agency overview', eyebrow: 'Command center' },
  conversation: { title: 'Conversation inbox', eyebrow: 'Customer activity' },
  appointment: { title: 'Bookings', eyebrow: 'Pipeline' },
  'email-marketing': { title: 'Leads', eyebrow: 'Audience' },
  integration: { title: 'Integrations', eyebrow: 'Connections' },
  settings: { title: 'Agency settings', eyebrow: 'Workspace' },
  experiments: { title: 'Labs', eyebrow: 'Experiments' },
}

const BreadCrumb = () => {
  const pathname = usePathname()
  const segment = pathname.split('/').filter(Boolean).pop() || 'dashboard'
  const details = routeDetails[segment] || {
    title: segment.replace(/[-_]/g, ' '),
    eyebrow: pathname.includes('/settings/') ? 'Agent workspace' : 'ChatDock',
  }

  return (
    <div className="flex w-full items-center justify-between gap-5">
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#6667db]">{details.eyebrow}</p>
        <h1 className="mt-1 truncate text-xl font-semibold capitalize tracking-[-0.025em] text-slate-950 md:text-[22px]">{details.title}</h1>
      </div>
      <Link href="/" target="_blank" className="hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900 sm:flex">View website <ExternalLink className="h-3.5 w-3.5" /></Link>
    </div>
  )
}

export default BreadCrumb
