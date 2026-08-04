'use client'

import * as React from 'react'
import { Mail, Phone, UsersRound } from 'lucide-react'

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
  new: 'bg-indigo-50 text-indigo-700',
  contacted: 'bg-amber-50 text-amber-700',
  qualified: 'bg-emerald-50 text-emerald-700',
  converted: 'bg-emerald-50 text-emerald-700',
  unqualified: 'bg-slate-100 text-slate-600',
  closed: 'bg-slate-100 text-slate-600',
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
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <UsersRound className="mx-auto h-8 w-8 text-slate-300" />
        <h2 className="mt-4 text-base font-bold text-slate-900">No leads yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          When an assistant captures a name, email or phone number, the lead appears here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            {leads.length} captured across your clients
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, phone or client…"
          className="h-10 w-full max-w-xs rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 sm:w-72"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
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
              <tr key={lead.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {lead.name ?? 'Unnamed visitor'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="flex flex-col gap-0.5">
                    {lead.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {lead.email}
                      </span>
                    )}
                    {/* Phone-only leads are first-class: the previous data model
                        could not store one at all. */}
                    {lead.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {lead.phone}
                      </span>
                    )}
                    {!lead.email && !lead.phone && <span className="text-slate-400">—</span>}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {lead.Domain?.businessName ?? lead.Domain?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                      STATUS_TONE[lead.status] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
