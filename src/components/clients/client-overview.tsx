import Link from 'next/link'
import {
  AlertTriangle,
  CalendarCheck2,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react'

import PublishToggle from '@/components/clients/publish-toggle'

type Overview = Extract<
  Awaited<ReturnType<typeof import('@/actions/clients').onGetClientOverview>>,
  { status: 200 }
>

/**
 * One client's overview.
 *
 * Every figure here is real, computed from that client's own rows over the last
 * 30 days. Where a number is an approximation the label says so — the
 * "outside 9–5" count is a UTC-hours heuristic because the client's actual
 * opening hours are not modelled yet, and calling it "after hours" would be a
 * precision we have not earned.
 */
export default function ClientOverview({ data }: { data: Overview }) {
  const { workspace, metrics, topQuestions, contentGaps, canManage, canPublish } = data
  const assistant = workspace.assistants[0]
  const isLive = assistant?.status === 'published'
  const hasKnowledge = workspace._count.knowledgeChunks > 0

  const tiles = [
    { icon: MessagesSquare, value: metrics.conversations, label: 'Conversations' },
    { icon: UserRoundCheck, value: metrics.leads, label: 'Qualified leads' },
    { icon: CalendarCheck2, value: metrics.bookings, label: 'Appointment requests' },
    { icon: Clock, value: metrics.outsideNineToFive, label: 'Outside 9–5 (UTC)' },
    { icon: ShieldCheck, value: `${metrics.resolutionRate}%`, label: 'Resolved by assistant' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-black text-white"
          style={{ backgroundColor: workspace.primaryColor ?? '#5b5ce2' }}
        >
          {(workspace.businessName || workspace.name).slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black tracking-tight text-slate-900">
            {workspace.businessName || workspace.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-slate-500">
            {workspace.websiteUrl && (
              <a
                href={workspace.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-slate-900"
              >
                <Globe className="h-3 w-3" />
                {workspace.websiteUrl.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
            {workspace.industry && <span className="capitalize">{workspace.industry}</span>}
            {assistant?.publishedAt && isLive && (
              <span>
                Live since{' '}
                {new Date(assistant.publishedAt).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {assistant && (
            <PublishToggle
              workspaceId={workspace.id}
              status={(assistant.status ?? 'draft') as 'published' | 'paused' | 'draft'}
              canPublish={canPublish}
            />
          )}
          {canManage && assistant && (
            <>
              {/* Testing is the thing an agency does most often on this screen —
                  before a call, after a content change, when a client asks
                  "what does it say if…". It should not be three clicks deep in
                  a settings tab. */}
              <Link
                href={`/settings/${workspace.id}?tab=appearance`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-900 hover:bg-slate-50"
              >
                <MessagesSquare className="h-3.5 w-3.5" />
                Test &amp; customise
              </Link>
              <Link
                href={`/settings/${workspace.id}`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-900 hover:bg-slate-50"
              >
                Configure
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Draft is the default an assistant is created in, and nothing about a
          finished-looking dashboard says the widget is returning 403. Say it. */}
      {assistant && !isLive && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-[13px] leading-6 text-amber-900">
            <strong className="font-bold">
              {assistant.status === 'paused' ? 'This assistant is paused.' : 'This assistant is not live yet.'}
            </strong>{' '}
            The installed widget will not answer visitors until you publish it
            {canPublish ? ' — use “Go live” above.' : '. Ask an agency manager to publish it.'}
          </p>
        </div>
      )}

      {/* States that need doing something about, before any numbers */}
      {!hasKnowledge && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-[13px] leading-6 text-amber-900">
            <strong className="font-bold">No content indexed yet.</strong> The assistant has nothing
            to answer from, so it will decline every question.{' '}
            {canManage && (
              <Link href={`/settings/${workspace.id}`} className="font-bold underline">
                Add the client’s website
              </Link>
            )}
          </p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <t.icon className="h-4 w-4 text-slate-400" />
            <p className="mt-2.5 text-2xl font-black tabular-nums tracking-tight text-slate-900">
              {t.value}
            </p>
            <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>
      <p className="-mt-2 text-[11px] text-slate-400">Last 30 days · this client only</p>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* What visitors asked */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[13px] font-black text-slate-900">What visitors asked most</h2>
          {topQuestions.length === 0 ? (
            <p className="mt-3 text-[13px] text-slate-500">No conversations in the last 30 days.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topQuestions.map((q) => (
                <li key={q.question} className="flex items-start justify-between gap-3">
                  <span className="line-clamp-2 text-[12.5px] text-slate-700">{q.question}</span>
                  <span className="shrink-0 text-[11.5px] font-bold tabular-nums text-slate-500">
                    {q.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Where the knowledge base fell short */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[13px] font-black text-slate-900">Content gaps</h2>
          <p className="mt-1 text-[11.5px] leading-5 text-slate-500">
            Questions the assistant answered without citing any approved source — the closest signal
            we have that the knowledge base did not cover it.
          </p>
          {contentGaps.length === 0 ? (
            <p className="mt-3 text-[13px] text-slate-500">
              Nothing flagged. Every answer cited a source.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {contentGaps.map((q) => (
                <li
                  key={q.question}
                  className="flex items-start gap-2 rounded-lg bg-amber-50 px-2.5 py-2"
                >
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-700" />
                  <span className="line-clamp-2 flex-1 text-[12px] text-slate-800">{q.question}</span>
                  <span className="shrink-0 text-[11px] font-bold text-amber-800">×{q.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Setup */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-[13px] font-black text-slate-900">
            <Sparkles className="h-3.5 w-3.5 text-slate-400" /> Assistants
          </h2>
          <ul className="mt-3 space-y-2">
            {workspace.assistants.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-slate-800">
                  {a.name}
                </span>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {a._count.deployments} deployment{a._count.deployments === 1 ? '' : 's'}
                </span>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    a.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {a.status}
                </span>
              </li>
            ))}
            {workspace.assistants.length === 0 && (
              <li className="text-[13px] text-slate-500">No assistant yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-[13px] font-black text-slate-900">
            <FileText className="h-3.5 w-3.5 text-slate-400" /> Knowledge
          </h2>
          <p className="mt-1 text-[11.5px] text-slate-500">
            {workspace._count.knowledgeDocuments} documents ·{' '}
            {workspace._count.knowledgeChunks} indexed passages
          </p>
          <ul className="mt-3 space-y-2">
            {workspace.knowledgeSources.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-slate-800">{s.name}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-400">
                  {s.sourceType.replace('_', ' ')}
                </span>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    s.syncStatus === 'synced'
                      ? 'bg-emerald-50 text-emerald-700'
                      : s.syncStatus === 'failed'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {s.syncStatus.replace('_', ' ')}
                </span>
              </li>
            ))}
            {workspace.knowledgeSources.length === 0 && (
              <li className="text-[13px] text-slate-500">No sources yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
