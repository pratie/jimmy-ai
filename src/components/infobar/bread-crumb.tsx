'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const routeDetails: Record<string, { title: string; eyebrow: string }> = {
  dashboard: { title: 'Agency overview', eyebrow: 'Command center' },
  clients: { title: 'Clients', eyebrow: 'Roster' },
  demos: { title: 'Prospect demos', eyebrow: 'Pipeline' },
  conversation: { title: 'Conversation inbox', eyebrow: 'Customer activity' },
  appointment: { title: 'Bookings', eyebrow: 'Pipeline' },
  leads: { title: 'Leads', eyebrow: 'Audience' },
  integration: { title: 'Integrations', eyebrow: 'Connections' },
  settings: { title: 'Agency settings', eyebrow: 'Workspace' },
  advanced: { title: 'Advanced', eyebrow: 'Agent workspace' },
}

/** Route ids are opaque. `/settings/<uuid>` must not put a UUID in the h1. */
const OPAQUE_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^c[a-z0-9]{20,}$/i

const BreadCrumb = () => {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Walk back past any id segment, so a client or agent route is titled by the
  // section it belongs to rather than by its primary key.
  const named = [...segments].reverse().find((s) => !OPAQUE_SEGMENT.test(s))
  const isAgentRoute = segments.some((s) => OPAQUE_SEGMENT.test(s))

  const segment = named ?? 'dashboard'
  const details =
    isAgentRoute && segments[0] === 'settings'
      ? {
          title: segment === 'advanced' ? 'Advanced settings' : 'Agent settings',
          eyebrow: 'Agent workspace',
        }
      : routeDetails[segment] ?? {
          title: segment.replace(/[-_]/g, ' '),
          eyebrow: 'ChatDock',
        }

  return (
    <div className="flex w-full items-center justify-between gap-5">
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">{details.eyebrow}</p>
        <h1 className="mt-1 truncate text-xl font-semibold capitalize tracking-[-0.025em] text-foreground md:text-[22px]">{details.title}</h1>
      </div>
      <Link href="/" target="_blank" className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground shadow-sm transition hover:text-foreground sm:flex">View website <ExternalLink className="h-3.5 w-3.5" /></Link>
    </div>
  )
}

export default BreadCrumb
