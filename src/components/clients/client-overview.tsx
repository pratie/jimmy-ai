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
import DeleteClientDialog from '@/components/clients/delete-client-dialog'
import { cd } from '@/lib/design-tokens'

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
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: workspace.primaryColor ?? cd.accent }}
        >
          {(workspace.businessName || workspace.name).slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
            {workspace.businessName || workspace.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
            {workspace.websiteUrl && (
              <a
                href={workspace.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
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
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-[13px] font-bold text-foreground hover:bg-muted"
              >
                <MessagesSquare className="h-3.5 w-3.5" />
                Test &amp; customise
              </Link>
              <Link
                href={`/settings/${workspace.id}`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-[13px] font-bold text-foreground hover:bg-muted"
              >
                Configure
              </Link>
              {/* Reachable in one click, but gated behind typing the client's
                  name. It used to sit at the foot of a settings tab, which made
                  it both hard to find and easy to hit by accident. */}
              <DeleteClientDialog
                workspaceId={workspace.id}
                clientName={workspace.businessName || workspace.name}
                counts={{
                  conversations: workspace._count.conversations,
                  leads: workspace._count.leads,
                  bookings: workspace._count.bookingRequests,
                  passages: workspace._count.knowledgeChunks,
                }}
              />
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

      {/* The step nothing in the product used to name.
          Trained and published is not the finish line — the widget still has to
          go on the client's website, and the snippet for that is behind a tab
          ("Domain & embed") that a new user has no reason to open. With zero
          conversations recorded, saying so is more useful than five zeros. */}
      {isLive && hasKnowledge && metrics.conversations === 0 && canManage && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <p className="min-w-0 flex-1 text-[13px] leading-6 text-foreground">
            <strong className="font-bold">This assistant is live and trained.</strong> Add the embed
            snippet to {workspace.businessName || workspace.name}’s website and it starts answering
            visitors.
          </p>
          <Link
            href={`/settings/${workspace.id}?tab=domain`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-bold text-primary-foreground hover:bg-primary/90"
          >
            Get the embed code
          </Link>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-border bg-card p-4">
            <t.icon className="h-4 w-4 text-muted-foreground/70" />
            <p className="mt-2.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {t.value}
            </p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>
      <p className="-mt-2 text-[11px] text-muted-foreground/70">Last 30 days · this client only</p>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* What visitors asked */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-[13px] font-semibold text-foreground">What visitors asked most</h2>
          {topQuestions.length === 0 ? (
            <p className="mt-3 text-[13px] text-muted-foreground">No conversations in the last 30 days.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topQuestions.map((q) => (
                <li key={q.question} className="flex items-start justify-between gap-3">
                  <span className="line-clamp-2 text-[12.5px] text-foreground">{q.question}</span>
                  <span className="shrink-0 text-[11.5px] font-bold tabular-nums text-muted-foreground">
                    {q.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Where the knowledge base fell short */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-[13px] font-semibold text-foreground">Content gaps</h2>
          <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground">
            Questions the assistant answered without citing any approved source — the closest signal
            we have that the knowledge base did not cover it.
          </p>
          {contentGaps.length === 0 ? (
            <p className="mt-3 text-[13px] text-muted-foreground">
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
                  <span className="line-clamp-2 flex-1 text-[12px] text-foreground">{q.question}</span>
                  <span className="shrink-0 text-[11px] font-bold text-amber-800">×{q.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Setup */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground/70" /> Assistants
          </h2>
          <ul className="mt-3 space-y-2">
            {workspace.assistants.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-foreground">
                  {a.name}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground/70">
                  {a._count.deployments} deployment{a._count.deployments === 1 ? '' : 's'}
                </span>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    a.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {a.status}
                </span>
              </li>
            ))}
            {workspace.assistants.length === 0 && (
              <li className="text-[13px] text-muted-foreground">No assistant yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <FileText className="h-3.5 w-3.5 text-muted-foreground/70" /> Knowledge
          </h2>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {workspace._count.knowledgeDocuments} documents ·{' '}
            {workspace._count.knowledgeChunks} indexed passages
          </p>
          <ul className="mt-3 space-y-2">
            {workspace.knowledgeSources.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">{s.name}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                  {s.sourceType.replace('_', ' ')}
                </span>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    s.syncStatus === 'synced'
                      ? 'bg-emerald-50 text-emerald-700'
                      : s.syncStatus === 'failed'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s.syncStatus.replace('_', ' ')}
                </span>
              </li>
            ))}
            {workspace.knowledgeSources.length === 0 && (
              <li className="text-[13px] text-muted-foreground">No sources yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
