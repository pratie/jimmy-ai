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
  paused: { label: 'Paused', tone: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  archived: { label: 'Archived', tone: 'bg-slate-100 text-slate-500 ring-slate-500/20' },
} as const

function Metric({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="flex-1">
      <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-0.5 text-lg font-black tabular-nums text-slate-900">{value}</p>
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
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <Building2 className="mx-auto h-8 w-8 text-slate-300" />
        <h2 className="mt-4 text-base font-black text-slate-900">No clients yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Add the first client website and ChatDock will read it, build an assistant, and start
          capturing leads.
        </p>
        {canCreate && (
          <Link
            href="/clients?new=1"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#5b5ce2] px-5 text-sm font-bold text-white"
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
          <h1 className="text-xl font-black tracking-tight text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            {clients.length} total · {live} live
            {demos > 0 && ` · ${demos} prospect demo${demos === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              aria-label="Search clients"
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400 sm:w-64"
            />
          </div>
          {canCreate && (
            <Link
              href="/clients?new=1"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#5b5ce2] px-4 text-sm font-bold text-white"
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
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[11px] font-black text-white"
                  style={{ backgroundColor: c.primaryColor ?? '#5b5ce2' }}
                >
                  {(c.businessName || c.name).slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-900">
                    {c.businessName || c.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {c.websiteUrl?.replace(/^https?:\/\//, '') ?? c.name}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${status.tone}`}
                >
                  {c.workspaceType === 'prospect_demo' ? 'Demo' : status.label}
                </span>
              </div>

              {starved && (
                <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-800">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  Live but has no content to answer from
                </p>
              )}

              <div className="mt-4 flex gap-3 border-t border-slate-100 pt-3">
                <Metric icon={MessagesSquare} value={c.conversations30d} label="Chats" />
                <Metric icon={UserRoundCheck} value={c.leads30d} label="Leads" />
                <Metric icon={CalendarCheck2} value={c.bookings30d} label="Bookings" />
              </div>
              <p className="mt-2 text-[10px] text-slate-400">Last 30 days</p>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">No client matches “{query}”.</p>
      )}
    </div>
  )
}
