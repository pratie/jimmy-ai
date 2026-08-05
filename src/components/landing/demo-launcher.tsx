'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ConciergeBell, Globe, Loader2 } from 'lucide-react'

import { LANDING_EVENTS, track } from '@/lib/analytics'

/**
 * Section 3 — the launcher.
 *
 * The demo itself moved to /demo, where it has room to be used. What stays
 * here is the thing that gets someone to go there, wrapped in the screen they
 * would actually live in: the agency roster.
 *
 * That framing is deliberate and is not the same story as the monthly client
 * report further down the page. This one answers "what does my agency see
 * across every client", the report answers "what did one client get this
 * month". Same product, two different jobs, no duplicated panel.
 *
 * Every figure below is fixed sample data, labelled as such in the chrome and
 * again in the footnote. No customer logos, no invented usage.
 */

const SUGGESTED_SITES = [
  { url: 'aspendental.com', label: 'Dental' },
  { url: 'rotorooter.com', label: 'Plumbing' },
  { url: 'morganandmorgan.com', label: 'Legal' },
]

const ROSTER = [
  {
    initials: 'BS',
    name: 'Bright Smile Dental',
    domain: 'brightsmile.example',
    tone: '#5B5CE2',
    status: 'live' as const,
    conversations: 428,
    leads: 72,
    trend: [8, 11, 9, 14, 13, 18, 17, 22, 26],
  },
  {
    initials: 'NC',
    name: 'Northgate Cooling',
    domain: 'northgatehvac.example',
    tone: '#0B6E51',
    status: 'live' as const,
    conversations: 311,
    leads: 54,
    trend: [14, 12, 15, 13, 17, 16, 19, 18, 23],
  },
  {
    initials: 'HL',
    name: 'Hartwell Law',
    domain: 'hartwelllaw.example',
    tone: '#B54708',
    status: 'attention' as const,
    conversations: 96,
    leads: 11,
    trend: [9, 10, 8, 7, 9, 6, 7, 5, 6],
  },
  {
    initials: 'PV',
    name: 'Parkview Veterinary',
    domain: 'parkviewvet.example',
    tone: '#175CD3',
    status: 'draft' as const,
    conversations: 0,
    leads: 0,
    trend: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
]

const STATUS_STYLES = {
  live: { label: 'Live', dot: '#16A67A', bg: '#ECFDF3', text: '#0B6E51' },
  attention: { label: 'Needs content', dot: '#DC6803', bg: '#FFFAEB', text: '#B54708' },
  draft: { label: 'Not published', dot: '#98A2B3', bg: '#F2F4F7', text: '#475467' },
}

/** Nine-point sparkline. Pure SVG — no chart library on the landing page. */
function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  const max = Math.max(...points, 1)
  const w = 64
  const h = 20
  const path = points
    .map((value, i) => `${((i / (points.length - 1)) * w).toFixed(1)},${(h - (value / max) * (h - 2) - 1).toFixed(1)}`)
    .join(' ')

  if (max === 1 && points.every((p) => p === 0)) {
    return <span className="block h-[20px] w-16 rounded-full border-b border-dashed border-[#D0D5DD]" />
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[20px] w-16 overflow-visible" aria-hidden="true">
      <polyline
        fill="none"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        points={path}
      />
    </svg>
  )
}

export default function DemoLauncher() {
  const router = useRouter()
  const [url, setUrl] = React.useState('')
  const [pending, setPending] = React.useState(false)

  const go = (value: string, source: 'input' | 'example') => {
    const target = value.trim()
    if (!target) return
    setPending(true)
    // Deliberately not `demoUrlSubmitted` — /demo fires that on arrival, and
    // firing it here too would double every entry in the funnel's first step.
    track(LANDING_EVENTS.demoLauncherClicked, { source })
    router.push(`/demo?url=${encodeURIComponent(target)}`)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E7EC] bg-[#F7F8FA] shadow-[0_20px_60px_-32px_rgba(16,24,40,0.35)]">
      {/* Window chrome — this is a product screen, so it is framed as one. */}
      <div className="flex items-center gap-3 border-b border-[#E4E7EC] bg-[#0E1726] px-4 py-3 sm:px-5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.08] text-white ring-1 ring-inset ring-white/10">
          <ConciergeBell className="h-[15px] w-[15px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-white">Your agency workspace</p>
          <p className="text-[11px] text-white/45">4 clients · March</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
          Sample data
        </span>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        {/* The action. Sits at the top of the workspace because adding a client
            is the only thing a visitor with zero clients can actually do. */}
        <div className="rounded-xl border border-[#5B5CE2]/25 bg-white p-4 sm:p-5">
          <h3 className="font-heading text-[15px] font-bold tracking-tight text-[#101828]">
            Add a client: try it on a real website
          </h3>
          <p className="mt-1 text-[13px] leading-5 text-[#667085]">
            Paste any URL. ChatDock reads the public pages and opens a working assistant you can talk
            to. No signup, no card.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              go(url, 'input')
            }}
            className="mt-4 flex flex-col gap-2.5 sm:flex-row"
          >
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                aria-label="Website address to build an assistant from"
                placeholder="yourclient.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E4E7EC] bg-[#F7F8FA] pl-11 pr-4 text-[14px] text-[#101828] placeholder:text-[#98A2B3] transition-shadow focus:border-[#5B5CE2]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5B5CE2]/15"
              />
            </div>
            <button
              type="submit"
              disabled={!url.trim() || pending}
              className="press inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5B5CE2] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#4A4BD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2 disabled:opacity-30"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Opening…
                </>
              ) : (
                <>
                  Build the assistant <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11.5px] text-[#667085]">Or try one of these:</span>
            {SUGGESTED_SITES.map((site) => (
              <button
                key={site.url}
                type="button"
                onClick={() => go(site.url, 'example')}
                className="press rounded-full border border-[#E4E7EC] bg-white px-2.5 py-1 text-[11.5px] transition-colors hover:border-[#5B5CE2]/40"
              >
                <span className="font-semibold text-[#344054]">{site.label}</span>
                <span className="ml-1.5 text-[#8A94A6]">{site.url}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The roster. What the workspace looks like once the agency has a few. */}
        <div className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white">
          <div className="flex items-baseline justify-between gap-3 border-b border-[#E4E7EC] px-4 py-3">
            <h3 className="text-[12.5px] font-bold text-[#101828]">Clients</h3>
            <span className="text-[11px] text-[#667085]">Conversations · leads · 30-day trend</span>
          </div>

          <ul className="divide-y divide-[#F0F1F4]">
            {ROSTER.map((client) => {
              const status = STATUS_STYLES[client.status]
              return (
                <li
                  key={client.name}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#FAFBFC]"
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
                    style={{ backgroundColor: client.tone }}
                  >
                    {client.initials}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#101828]">{client.name}</p>
                    <p className="truncate text-[11.5px] text-[#667085]">{client.domain}</p>
                  </div>

                  <span
                    className="hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:flex"
                    style={{ backgroundColor: status.bg, color: status.text }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                    {status.label}
                  </span>

                  <span className="hidden w-16 shrink-0 text-right text-[12.5px] font-semibold tabular-nums text-[#101828] sm:block">
                    {client.conversations || '—'}
                  </span>
                  <span className="w-12 shrink-0 text-right text-[12.5px] font-semibold tabular-nums text-[#101828]">
                    {client.leads || '—'}
                  </span>

                  <span className="hidden shrink-0 md:block">
                    <Sparkline points={client.trend} tone={client.tone} />
                  </span>
                </li>
              )
            })}
          </ul>

          <p className="border-t border-[#E4E7EC] bg-[#FAFBFC] px-4 py-2.5 text-[11px] text-[#667085]">
            Sample data, not real customers. The demo you open above runs on a
            real website of your choosing.
          </p>
        </div>
      </div>
    </div>
  )
}
