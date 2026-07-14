'use client'

import { Bell, Search } from 'lucide-react'
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
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5b5ce2]">{details.eyebrow}</p>
        <h1 className="mt-1 truncate text-xl font-black capitalize tracking-tight text-slate-950 md:text-2xl">{details.title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900 sm:flex">
          <Search className="h-4 w-4" />
          Search
          <kbd className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">⌘ K</kbd>
        </button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-900" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ff6b5f] ring-2 ring-white" />
        </button>
      </div>
    </div>
  )
}

export default BreadCrumb
