'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarCheck2,
  MessagesSquare,
  Search,
  UserRoundCheck,
} from 'lucide-react'

import type { ClientRow } from '@/actions/clients'
import { cd } from '@/lib/design-tokens'

/**
 * The agency roster.
 *
 * Each card answers the question an agency owner actually has when they open
 * this screen: is this client's assistant working, and did it produce anything
 * this month. Configuration lives one level deeper.
 */

const STATUS = {
  published: { label: 'Live', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  draft: { label: 'Draft', tone: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  paused: { label: 'Paused', tone: 'bg-muted text-muted-foreground ring-border' },
  archived: { label: 'Archived', tone: 'bg-muted text-muted-foreground/70 ring-border' },
} as const

function Metric({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="flex-1">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

export default function ClientsGrid({
  clients,
  canCreate,
}: {
  clients: ClientRow[]
  canCreate: boolean
}) {
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((c) =>
      `${c.businessName ?? ''} ${c.name} ${c.industry ?? ''}`.toLowerCase().includes(q)
    )
  }, [clients, query])

  const live = clients.filter((c) => c.assistantStatus === 'published').length
  const demos = clients.filter((c) => c.workspaceType === 'prospect_demo').length

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Building2 className="mx-auto h-8 w-8 text-muted-foreground/70" />
        <h2 className="mt-4 text-base font-semibold text-foreground">No clients yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Add the first client website and ChatDock will read it, build an assistant, and start
          capturing leads.
        </p>
        {canCreate && (
          <Link
            href="/clients?new=1"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >
            Add a client <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length} total · {live} live
            {demos > 0 && ` · ${demos} prospect demo${demos === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              aria-label="Search clients"
              className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring sm:w-64"
            />
          </div>
          {canCreate && (
            <Link
              href="/clients?new=1"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              Add client
            </Link>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const status = STATUS[(c.assistantStatus ?? 'draft') as keyof typeof STATUS] ?? STATUS.draft
          // A published assistant with no indexed content will answer nothing —
          // worth flagging on the card rather than letting it look healthy.
          const starved = c.assistantStatus === 'published' && c.knowledgeChunks === 0

          return (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
                  style={{ backgroundColor: c.primaryColor ?? cd.accent }}
                >
                  {(c.businessName || c.name).slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.businessName || c.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground/70">
                    {c.websiteUrl?.replace(/^https?:\/\//, '') ?? c.name}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${status.tone}`}
                >
                  {c.workspaceType === 'prospect_demo' ? 'Demo' : status.label}
                </span>
              </div>

              {/* The inverse of `starved`: content indexed, but nothing served,
                  because the assistant was never published. Read-only here —
                  publishing lives on the client page, and a button nested in a
                  card-wide link is a trap. */}
              {c.assistantStatus !== 'published' && c.workspaceType !== 'prospect_demo' && (
                <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-800">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  Not published — the installed widget will not answer
                </p>
              )}

              {starved && (
                <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-800">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  Live but has no content to answer from
                </p>
              )}

              <div className="mt-4 flex gap-3 border-t border-border pt-3">
                <Metric icon={MessagesSquare} value={c.conversations30d} label="Chats" />
                <Metric icon={UserRoundCheck} value={c.leads30d} label="Leads" />
                <Metric icon={CalendarCheck2} value={c.bookings30d} label="Bookings" />
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground/70">Last 30 days</p>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">No client matches “{query}”.</p>
      )}
    </div>
  )
}
