import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarCheck2,
  Inbox,
  MessagesSquare,
  UserRoundCheck,
  Zap,
} from 'lucide-react'

import type { ActivityItem, ClientRow } from '@/actions/clients'
import { cd, deriveClientStatus } from '@/lib/design-tokens'
import MetricCard from './ui/metric-card'
import StatusBadge from './ui/status-badge'
import EmptyState from './ui/empty-state'

/**
 * The agency command center — shown once the organization has at least one
 * client. The onboarding wizard no longer replaces this screen; it lives at
 * /clients?new=1 and on the zero-client state only.
 */

type Props = {
  organizationName: string
  clients: ClientRow[]
  activity: ActivityItem[]
  totals: { clients: number; assistants: number; conversations: number; leads: number; bookings: number }
  usage: { messagesUsed: number; messagesLimit: number | null } | null
  canCreate: boolean
}

const relative = (date: Date) => {
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

const ACTIVITY_ICON = {
  lead: UserRoundCheck,
  booking: CalendarCheck2,
  handoff: Inbox,
  published: Zap,
  knowledge: Building2,
} as const

/** The single next action a client row is asking for, or nothing. */
function nextAction(client: ClientRow): { label: string; href: string } | null {
  const status = deriveClientStatus({
    assistantStatus: client.assistantStatus,
    knowledgeChunks: client.knowledgeChunks,
  })
  if (status === 'attention') return { label: 'Add knowledge', href: `/settings/${client.id}` }
  if (status === 'draft') return { label: 'Set up', href: `/settings/${client.id}` }
  if (status === 'ready_to_install') return { label: 'Install widget', href: `/settings/${client.id}` }
  return null
}

export default function AgencyOverview({
  organizationName,
  clients,
  activity,
  totals,
  usage,
  canCreate,
}: Props) {
  const live = clients.filter(
    (c) =>
      deriveClientStatus({
        assistantStatus: c.assistantStatus,
        knowledgeChunks: c.knowledgeChunks,
      }) === 'live'
  ).length

  const attention = clients.filter(
    (c) =>
      deriveClientStatus({
        assistantStatus: c.assistantStatus,
        knowledgeChunks: c.knowledgeChunks,
      }) === 'attention'
  )

  const usagePct =
    usage?.messagesLimit && usage.messagesLimit > 0
      ? Math.min(100, Math.round((usage.messagesUsed / usage.messagesLimit) * 100))
      : 0

  return (
    <div className="space-y-4">
      {/* Context header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium" style={{ color: cd.faint }}>
            {organizationName} · all clients
          </p>
          <h1
            className="mt-0.5 text-[26px] font-semibold leading-tight tracking-[-0.02em]"
            style={{ color: cd.ink }}
          >
            Overview
          </h1>
        </div>
        {canCreate && (
          <Link
            href="/clients?new=1"
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] px-4 text-[13.5px] font-semibold text-white"
            style={{ backgroundColor: cd.accent }}
          >
            Add a client
          </Link>
        )}
      </div>

      {/* Metrics — every one states its window; no invented deltas */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard label="Active clients" value={totals.clients} timeframe="Now" href="/clients" hint={`${live} live`} />
        <MetricCard label="Live assistants" value={live} timeframe="Now" href="/clients" hint="Published and answering" />
        <MetricCard label="Conversations" value={totals.conversations} timeframe="Last 30 days" href="/conversation" />
        <MetricCard label="Qualified leads" value={totals.leads} timeframe="Last 30 days" href="/leads" />
        <MetricCard label="Booking requests" value={totals.bookings} timeframe="Last 30 days" href="/appointment" />
      </div>

      {/* Attention — rendered only when something is actually wrong */}
      {attention.length > 0 && (
        <section
          className="rounded-[12px] border p-4"
          style={{ borderColor: cd.warningSoft, backgroundColor: cd.warningSoft }}
        >
          <h2
            className="flex items-center gap-1.5 text-[13px] font-semibold"
            style={{ color: cd.warning }}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {attention.length} client{attention.length === 1 ? '' : 's'} need attention
          </h2>
          <ul className="mt-2.5 space-y-1.5">
            {attention.slice(0, 4).map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-[12.5px]">
                <span className="min-w-0 flex-1 truncate" style={{ color: cd.ink }}>
                  <strong className="font-semibold">{c.businessName ?? c.name}</strong> — published
                  but has no indexed content, so it declines every question
                </span>
                <Link
                  href={`/settings/${c.id}`}
                  className="shrink-0 font-semibold underline"
                  style={{ color: cd.warning }}
                >
                  Fix
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Client health */}
        <section
          className="overflow-hidden rounded-[12px] border"
          style={{ borderColor: cd.line, backgroundColor: cd.surface }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: cd.line }}
          >
            <h2 className="text-[13.5px] font-semibold" style={{ color: cd.ink }}>
              Client health
            </h2>
            <Link
              href="/clients"
              className="inline-flex items-center gap-1 text-[12px] font-semibold"
              style={{ color: cd.accent }}
            >
              All clients <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: cd.line }}>
                  {['Client', 'Status', 'Chats', 'Leads', 'Bookings', ''].map((h, i) => (
                    <th
                      key={h || i}
                      className={`px-4 py-2 text-[11px] font-semibold ${i > 1 && i < 5 ? 'text-right' : ''}`}
                      style={{ color: cd.faint }}
                      scope="col"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 8).map((c) => {
                  const status = deriveClientStatus({
                    assistantStatus: c.assistantStatus,
                    knowledgeChunks: c.knowledgeChunks,
                  })
                  const action = nextAction(c)
                  return (
                    <tr
                      key={c.id}
                      className="border-b last:border-0 transition-colors hover:bg-[#F6F7F9]"
                      style={{ borderColor: cd.line }}
                    >
                      <td className="px-4 py-2.5">
                        <Link href={`/clients/${c.id}`} className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] text-[10px] font-bold text-white"
                            style={{ backgroundColor: c.primaryColor ?? cd.accent }}
                          >
                            {(c.businessName || c.name).slice(0, 2).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span
                              className="block truncate text-[13px] font-medium"
                              style={{ color: cd.ink }}
                            >
                              {c.businessName || c.name}
                            </span>
                            <span className="block truncate text-[11px]" style={{ color: cd.faint }}>
                              {c.websiteUrl?.replace(/^https?:\/\//, '') ?? '—'}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={status} size="sm" />
                      </td>
                      <td
                        className="px-4 py-2.5 text-right text-[13px] tabular-nums"
                        style={{ color: cd.body }}
                      >
                        {c.conversations30d}
                      </td>
                      <td
                        className="px-4 py-2.5 text-right text-[13px] tabular-nums"
                        style={{ color: cd.body }}
                      >
                        {c.leads30d}
                      </td>
                      <td
                        className="px-4 py-2.5 text-right text-[13px] tabular-nums"
                        style={{ color: cd.body }}
                      >
                        {c.bookings30d}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {action && (
                          <Link
                            href={action.href}
                            className="text-[12px] font-semibold"
                            style={{ color: cd.accent }}
                          >
                            {action.label}
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-2 text-[11px]" style={{ color: cd.faint }}>
            Counts cover the last 30 days
          </p>
        </section>

        <div className="space-y-4">
          {/* Usage — messages, not provider tokens */}
          <section
            className="rounded-[12px] border p-4"
            style={{ borderColor: cd.line, backgroundColor: cd.surface }}
          >
            <h2 className="text-[13.5px] font-semibold" style={{ color: cd.ink }}>
              Usage this period
            </h2>
            {usage?.messagesLimit === null ? (
              <p className="mt-2 text-[13px]" style={{ color: cd.muted }}>
                Unlimited messages on this plan.
              </p>
            ) : (
              <>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span
                    className="text-[22px] font-semibold tabular-nums"
                    style={{ color: cd.ink }}
                  >
                    {(usage?.messagesUsed ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[12.5px]" style={{ color: cd.faint }}>
                    / {(usage?.messagesLimit ?? 0).toLocaleString()} messages
                  </span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={usagePct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Messages used this billing period"
                  style={{ backgroundColor: cd.sunken }}
                >
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${usagePct}%`,
                      backgroundColor: usagePct >= 90 ? cd.warning : cd.accent,
                    }}
                  />
                </div>
                <p className="mt-2 text-[11.5px]" style={{ color: cd.faint }}>
                  Pooled across every client workspace
                </p>
              </>
            )}
          </section>

          {/* Activity */}
          <section
            className="overflow-hidden rounded-[12px] border"
            style={{ borderColor: cd.line, backgroundColor: cd.surface }}
          >
            <div className="border-b px-4 py-3" style={{ borderColor: cd.line }}>
              <h2 className="text-[13.5px] font-semibold" style={{ color: cd.ink }}>
                Recent activity
              </h2>
            </div>
            {activity.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Nothing yet"
                body="Leads, booking requests and handoffs will appear here as your assistants work."
              />
            ) : (
              <ul>
                {activity.slice(0, 8).map((item) => {
                  const Icon = ACTIVITY_ICON[item.kind]
                  return (
                    <li key={item.id} className="border-b last:border-0" style={{ borderColor: cd.line }}>
                      <Link href={`/clients/${item.clientId}`} className="flex gap-2.5 px-4 py-2.5">
                        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: cd.faint }} />
                        <span className="min-w-0 flex-1">
                          <span
                            className="block truncate text-[12.5px] font-medium"
                            style={{ color: cd.ink }}
                          >
                            {item.title}
                          </span>
                          <span className="block truncate text-[11px]" style={{ color: cd.faint }}>
                            {item.clientName} · {relative(item.at)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
