'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Mail, Phone, SearchX, UsersRound } from 'lucide-react'

type Lead = {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  status: string
  createdAt: Date
  Domain: { id: string; name: string; businessName: string | null } | null
}

const STATUS_TONE: Record<string, string> = {
  new: 'bg-primary/10 text-primary',
  contacted: 'bg-amber-50 text-amber-700',
  qualified: 'bg-emerald-50 text-emerald-700',
  converted: 'bg-emerald-50 text-emerald-700',
  unqualified: 'bg-muted text-muted-foreground',
  closed: 'bg-muted text-muted-foreground',
  spam: 'bg-rose-50 text-rose-700',
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return leads
    return leads.filter((lead) =>
      [lead.name, lead.email, lead.phone, lead.Domain?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    )
  }, [leads, query])

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <UsersRound className="mx-auto h-8 w-8 text-muted-foreground/70" />
        <h2 className="mt-4 text-base font-semibold text-foreground">No leads yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          When an assistant captures a name, email or phone number, the lead appears here.
        </p>
        {/* The one thing worth checking when nothing has come in: whether the
            assistants are actually live. */}
        <Link
          href="/clients"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground hover:bg-muted"
        >
          Check your clients
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* No page title here: InfoBar already titles this screen "Leads", and
            two stacked headings read as a layout bug. */}
        <p className="text-sm text-muted-foreground">
          {leads.length} captured across your clients
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, phone or client…"
          className="h-10 w-full max-w-xs rounded-lg border border-border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring sm:w-72"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Captured</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">
                  {lead.name ?? 'Unnamed visitor'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="flex flex-col gap-0.5">
                    {lead.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground/70" />
                        {lead.email}
                      </span>
                    )}
                    {/* Phone-only leads are first-class: the previous data model
                        could not store one at all. */}
                    {lead.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground/70" />
                        {lead.phone}
                      </span>
                    )}
                    {!lead.email && !lead.phone && (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {lead.Domain?.businessName ?? lead.Domain?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                      STATUS_TONE[lead.status] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                {/* Fixed format rather than toLocaleDateString(): the latter
                    resolves against the server locale during SSR and the
                    browser's on hydration, which mismatches. */}
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(lead.createdAt), 'd MMM yyyy')}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <SearchX className="mx-auto h-6 w-6 text-muted-foreground/70" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    No leads match “{query}”
                  </p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Try a name, email, phone number or client name.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
