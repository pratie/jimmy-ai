'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarPlus,
  Check,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Sparkles,
  Trash2,
  UserRoundCheck,
} from 'lucide-react'

import {
  onConvertProspectDemo,
  onCreateProspectDemo,
  onExtendProspectDemo,
  onRevokeProspectDemo,
  type ProspectDemoRow,
} from '@/actions/demos'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * Prospect demos — the agency's sales weapon.
 *
 * The whole screen is built around one loop: create a demo from a prospect's
 * URL, copy the link, send it, see whether they opened it, convert. So the
 * share link is never more than one click away and engagement is the loudest
 * thing on a card — a demo nobody opened is the agency's cue to follow up, and
 * that has to read at a glance rather than after arithmetic.
 *
 * Creation is the hard part of the UX. `onCreateProspectDemo` crawls and embeds
 * inline, which takes tens of seconds; a silent spinner for that long reads as
 * a hung page, so the button narrates what is actually happening. The stages
 * are timed rather than reported — the action returns once, not as a stream —
 * so the copy stays honest by describing the work in progress ("Reading the
 * site…") and never claims a step has finished.
 */

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

const shareLinkFor = (token: string) => `${APP_URL}/d/${token}`

/** What the server is doing while the create action is in flight, roughly. */
const CREATE_STAGES = [
  { after: 0, label: 'Reading the prospect’s website…' },
  { after: 8_000, label: 'Indexing the pages we found…' },
  { after: 22_000, label: 'Building the assistant…' },
  { after: 40_000, label: 'Almost there — finishing the knowledge base…' },
] as const

const PILL = 'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1'
const TONE = {
  good: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warn: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
} as const

const BTN_PRIMARY =
  'inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#5b5ce2] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#4c4dd6] disabled:opacity-60'
const BTN_SECONDARY =
  'inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-60'

function daysUntil(date: Date, now: number) {
  return Math.ceil((new Date(date).getTime() - now) / 86_400_000)
}

/** Copy button that confirms in place as well as by toast — at the moment the
 *  agency copies a link they are looking at the button, not the corner. */
function CopyLink({ url, label = 'Copy link' }: { url: string; label?: string }) {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1_800)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast({ title: 'Link copied', description: 'Send it to the prospect — it opens on any device.' })
      }}
      className={BTN_SECONDARY}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  )
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-black tabular-nums text-slate-900">{value}</p>
    </div>
  )
}

export default function DemosWorkspace({ demos }: { demos: ProspectDemoRow[] }) {
  const router = useRouter()
  const { toast } = useToast()

  const [url, setUrl] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [stage, setStage] = React.useState<string>(CREATE_STAGES[0].label)
  const [upgrade, setUpgrade] = React.useState<string | null>(null)
  const [fresh, setFresh] = React.useState<{ shareToken: string; name: string } | null>(null)

  /** `${workspaceId}:${action}` while a per-demo mutation is in flight. */
  const [busy, setBusy] = React.useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = React.useState<ProspectDemoRow | null>(null)

  // Relative expiry is computed after mount only: the server and the browser
  // render this component at different instants, and a day boundary between
  // them would be a hydration mismatch on text nobody needs before paint.
  const [now, setNow] = React.useState<number | null>(null)
  React.useEffect(() => setNow(Date.now()), [])

  React.useEffect(() => {
    if (!creating) return
    const timers = CREATE_STAGES.filter((s) => s.after > 0).map((s) =>
      window.setTimeout(() => setStage(s.label), s.after)
    )
    return () => timers.forEach(window.clearTimeout)
  }, [creating])

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    if (creating || !url.trim()) return

    setCreating(true)
    setStage(CREATE_STAGES[0].label)
    setUpgrade(null)
    setFresh(null)

    const res = await onCreateProspectDemo(url.trim())

    if (res.status === 200) {
      if (res.shareToken) setFresh({ shareToken: res.shareToken, name: url.trim() })
      // The crawl reports its own chunk count, but the upstream scrape action
      // does not promise one — so it is only mentioned when it is a real number.
      const chunks = res.chunksCreated ?? 0
      toast({
        title: res.message,
        description:
          chunks > 0
            ? `Indexed ${chunks} passage${chunks === 1 ? '' : 's'} from their site.`
            : undefined,
      })
      setUrl('')
      router.refresh()
    } else if (res.status === 402) {
      // A plan limit is not a failure — it has a fix, and a red toast would
      // bury it.
      setUpgrade(res.message)
    } else {
      toast({
        title: 'Could not build that demo',
        description: 'message' in res ? res.message : undefined,
        variant: 'destructive',
      })
    }

    setCreating(false)
  }

  const extend = async (demo: ProspectDemoRow) => {
    setBusy(`${demo.workspaceId}:extend`)
    const res = await onExtendProspectDemo(demo.workspaceId)
    if (res.status === 200) {
      toast({ title: res.message, description: 'The share link works for another 14 days.' })
      router.refresh()
    } else {
      toast({
        title: 'Could not extend that demo',
        description: 'message' in res ? res.message : undefined,
        variant: 'destructive',
      })
    }
    setBusy(null)
  }

  const revoke = async (demo: ProspectDemoRow) => {
    setBusy(`${demo.workspaceId}:revoke`)
    setConfirmRevoke(null)
    const res = await onRevokeProspectDemo(demo.workspaceId)
    if (res.status === 200) {
      toast({ title: res.message, description: 'The link stops working immediately.' })
      router.refresh()
    } else {
      toast({
        title: 'Could not revoke that link',
        description: 'message' in res ? res.message : undefined,
        variant: 'destructive',
      })
    }
    setBusy(null)
  }

  const convert = async (demo: ProspectDemoRow) => {
    setBusy(`${demo.workspaceId}:convert`)
    const res = await onConvertProspectDemo(demo.workspaceId)
    if (res.status === 200) {
      toast({ title: res.message })
      router.refresh()
      router.push(`/clients/${res.workspaceId}`)
    } else {
      toast({
        title: 'Could not convert that demo',
        description: 'message' in res ? res.message : undefined,
        variant: 'destructive',
      })
      setBusy(null)
    }
  }

  const notOpened = demos.filter((d) => d.opened === 0 && !d.convertedAt).length

  const createForm = (
    <form onSubmit={create} className="rounded-2xl border border-slate-200 bg-white p-5">
      <label htmlFor="prospect-url" className="text-sm font-black text-slate-900">
        Build a demo from a prospect’s website
      </label>
      <p className="mt-1 text-sm text-slate-500">
        We read their public pages and put a working assistant on top of them. You get a link to
        send.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          id="prospect-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={creating}
          placeholder="acme.com"
          inputMode="url"
          autoComplete="off"
          className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50 sm:max-w-sm"
        />
        <button type="submit" disabled={creating || !url.trim()} className={BTN_PRIMARY}>
          {creating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {creating ? 'Building…' : 'Build demo'}
        </button>
      </div>

      {creating && (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-slate-500" aria-live="polite">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#5b5ce2]" />
          {stage} This takes up to a minute — leave this tab open.
        </p>
      )}

      {upgrade && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-black text-amber-900">You’ve hit your plan’s demo limit</p>
          <p className="mt-1 text-sm text-amber-800">{upgrade}</p>
          <Link
            href="/settings?tab=billing"
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#5b5ce2] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#4c4dd6]"
          >
            See plans <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {fresh && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-black text-emerald-900">
            {fresh.name} is ready — send them this link
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[12px] text-slate-700">
              {shareLinkFor(fresh.shareToken)}
            </code>
            <CopyLink url={shareLinkFor(fresh.shareToken)} />
          </div>
        </div>
      )}
    </form>
  )

  if (demos.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">Prospect demos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Show a prospect their own assistant before they’ve signed anything.
          </p>
        </div>

        {createForm}

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Link2 className="mx-auto h-8 w-8 text-slate-300" />
          <h2 className="mt-4 text-base font-black text-slate-900">No demos yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            A prospect demo is their website, read and indexed, with a working assistant on top —
            reachable from one link. Instead of describing what you’d build for them, you send it.
            You’ll see here when they open it, and one click turns a demo that landed into a client.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">Prospect demos</h1>
          <p className="mt-1 text-sm text-slate-500">
            {demos.length} total
            {notOpened > 0 && ` · ${notOpened} not opened yet`}
          </p>
        </div>
      </div>

      {createForm}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {demos.map((demo) => {
          const link = demo.shareToken ? shareLinkFor(demo.shareToken) : null
          const left = demo.expiresAt && now !== null ? daysUntil(demo.expiresAt, now) : null
          const converted = Boolean(demo.convertedAt)
          const rowBusy = busy?.startsWith(`${demo.workspaceId}:`) ?? false

          const status = converted
            ? { label: 'Client', tone: TONE.good }
            : demo.isExpired
              ? { label: 'Expired', tone: TONE.neutral }
              : demo.opened > 0
                ? { label: 'Opened', tone: TONE.good }
                : { label: 'Not opened yet', tone: TONE.warn }

          return (
            <div key={demo.workspaceId} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#5b5ce2] text-[11px] font-black text-white">
                  {demo.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-900">{demo.name}</p>
                  {demo.websiteUrl ? (
                    <a
                      href={demo.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1 truncate text-[11px] text-slate-400 hover:text-slate-900"
                    >
                      <span className="truncate">{demo.websiteUrl.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  ) : (
                    <p className="truncate text-[11px] text-slate-400">{demo.name}</p>
                  )}
                </div>
                <span className={`${PILL} ${status.tone}`}>{status.label}</span>
              </div>

              {/* The share link is the product of this screen, so it sits above
                  the numbers rather than behind a menu. */}
              {link ? (
                <div className="mt-4 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
                    {link.replace(/^https?:\/\//, '')}
                  </code>
                  <CopyLink url={link} label="Copy" />
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-500">
                  This demo has no share link — it was revoked or never issued one.
                </p>
              )}

              <p className="mt-2 text-[11px] text-slate-400">
                {converted
                  ? 'Converted — no longer expires'
                  : demo.isExpired
                    ? 'Expired — extend it to make the link work again'
                    : left !== null
                      ? `Expires in ${left} day${left === 1 ? '' : 's'}`
                      : 'No expiry set'}
              </p>

              <div className="mt-4 flex gap-3 border-t border-slate-100 pt-3">
                <Metric value={demo.opened} label="Opened" />
                <Metric value={demo.started} label="Conversations" />
                <Metric value={demo.leads} label="Leads" />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {demo.opened === 0
                  ? 'Not opened yet — worth a nudge'
                  : `Opened ${demo.opened}× · ${demo.started} conversation${demo.started === 1 ? '' : 's'}`}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                {!converted && (
                  <button
                    type="button"
                    disabled={rowBusy}
                    onClick={() => convert(demo)}
                    className={BTN_PRIMARY}
                    title="Keeps the knowledge base, conversations and leads. Turns this into a real client."
                  >
                    {busy === `${demo.workspaceId}:convert` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserRoundCheck className="h-3.5 w-3.5" />
                    )}
                    Convert to client
                  </button>
                )}

                <button
                  type="button"
                  disabled={rowBusy}
                  onClick={() => extend(demo)}
                  className={BTN_SECONDARY}
                >
                  {busy === `${demo.workspaceId}:extend` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CalendarPlus className="h-3.5 w-3.5" />
                  )}
                  Extend
                </button>

                {!converted && link && (
                  <button
                    type="button"
                    disabled={rowBusy}
                    onClick={() => setConfirmRevoke(demo)}
                    className={`${BTN_SECONDARY} text-red-600 hover:bg-red-50`}
                  >
                    {busy === `${demo.workspaceId}:revoke` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Revoke
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={confirmRevoke !== null} onOpenChange={(open) => !open && setConfirmRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this share link?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRevoke
                ? `The link you sent for ${confirmRevoke.name} stops working straight away. The conversations the prospect already had are kept, and you can build a new demo for the same site later.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it live</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => confirmRevoke && revoke(confirmRevoke)}
            >
              Revoke link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
