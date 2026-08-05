import type * as React from 'react'
import { AlertTriangle, CalendarCheck2, Clock, MessagesSquare, TrendingUp, UserRoundCheck } from 'lucide-react'

import { Reveal } from '@/components/landing/reveal'
import { StatCounter } from '@/components/landing/stat-counter'

/**
 * Section 7 — the monthly client summary an agency walks through on a review
 * call. This is the retention argument, so every number answers one of:
 * what did the assistant handle, what did it capture, what should the business
 * fix, and why should the client keep paying.
 *
 * All figures are fixed sample data and the panel says so in two places.
 * Nothing here is a claim about real customers. Token/model usage is
 * deliberately absent — that belongs in the agency's billing screen, not the
 * client's report.
 */

const TILES = [
  { icon: MessagesSquare, value: 428, label: 'Visitor conversations', suffix: '' },
  { icon: UserRoundCheck, value: 72, label: 'Qualified leads', suffix: '' },
  { icon: CalendarCheck2, value: 31, label: 'Appointment requests', suffix: '' },
  { icon: Clock, value: 18, label: 'After-hours opportunities', suffix: '' },
  { icon: TrendingUp, value: 64, label: 'Resolved without staff', suffix: '%' },
]

/** 30-day conversation volume. Fixed series — deterministic across renders. */
const TREND = [
  9, 12, 10, 14, 17, 8, 6, 13, 16, 15, 19, 21, 11, 7, 14, 18, 22, 20, 24, 12, 9, 17, 23, 26, 21, 19,
  25, 28, 14, 11,
]

const FUNNEL = [
  { label: 'Started a conversation', value: 428, pct: 100 },
  { label: 'Asked a buying question', value: 196, pct: 46 },
  { label: 'Left contact details', value: 72, pct: 17 },
  { label: 'Requested an appointment', value: 31, pct: 7 },
]

const TOP_QUESTIONS = [
  { question: 'How much does teeth whitening cost?', count: 61 },
  { question: 'Are you open on Saturdays?', count: 47 },
  { question: 'Do you accept new patients?', count: 38 },
  { question: 'Which insurance do you take?', count: 34 },
  { question: 'How long is an implant consultation?', count: 22 },
]

const GAPS = [
  { question: 'Do you offer payment plans?', count: 14 },
  { question: 'Is parking available on site?', count: 9 },
  { question: 'Do you treat children under 5?', count: 6 },
]

const LEADS_BY_DAY = [
  { day: 'Mon', value: 14 },
  { day: 'Tue', value: 11 },
  { day: 'Wed', value: 9 },
  { day: 'Thu', value: 13 },
  { day: 'Fri', value: 16 },
  { day: 'Sat', value: 6 },
  { day: 'Sun', value: 3 },
]

const OUTCOMES = [
  { label: 'Confirmed by the practice', value: 19, tone: '#16A67A' },
  { label: 'Awaiting callback', value: 8, tone: '#5B5CE2' },
  { label: 'Visitor did not respond', value: 4, tone: '#C6CBD6' },
]

function Card({
  title,
  hint,
  children,
  className = '',
}: {
  title: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-[#E4E7EC] bg-white p-4 sm:p-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="text-[13px] font-bold text-[#101828]">{title}</h4>
        {hint && <span className="shrink-0 text-[11px] text-[#667085]">{hint}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

/** Area chart for the 30-day trend. Pure SVG, no chart library on the landing page. */
function TrendChart() {
  const max = Math.max(...TREND)
  const width = 100
  const height = 34
  const points = TREND.map((value, i) => {
    const x = (i / (TREND.length - 1)) * width
    const y = height - (value / max) * (height - 3) - 1.5
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-[72px] w-full"
        role="img"
        aria-label="Conversation volume trended upward across the last 30 days, from roughly 9 per day to 28 at peak."
      >
        <defs>
          <linearGradient id="cd-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B5CE2" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#5B5CE2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#cd-trend-fill)" points={`0,${height} ${points.join(' ')} ${width},${height}`} />
        <polyline
          fill="none"
          stroke="#5B5CE2"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          points={points.join(' ')}
        />
      </svg>
      <div className="mt-1.5 flex justify-between text-[10.5px] text-[#667085]">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}

export default function ClientReport() {
  const maxLeads = Math.max(...LEADS_BY_DAY.map((d) => d.value))
  const maxQuestion = TOP_QUESTIONS[0].count

  return (
    <Reveal className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-2xl border border-[#E4E7EC] bg-[#F7F8FA]">
        {/* Report header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E4E7EC] bg-white px-4 py-3.5 sm:px-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#5B5CE2] text-[12px] font-bold text-white">
            BS
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-[#101828]">Bright Smile Dental</p>
            <p className="text-[11.5px] text-[#667085]">Monthly assistant summary · March</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#0B6E51]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A67A]" />
            Assistant live
          </span>
          <span className="shrink-0 rounded-full bg-[#FFFAEB] px-2.5 py-1 text-[11px] font-semibold text-[#B54708]">
            Demo workspace · Illustrative data
          </span>
        </div>

        <div className="space-y-3 p-3 sm:p-4">
          {/* Headline tiles */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {TILES.map((tile) => (
              <div key={tile.label} className="rounded-xl border border-[#E4E7EC] bg-white p-3.5">
                <tile.icon className="h-4 w-4 text-[#667085]" />
                <p className="mt-2.5 font-heading text-2xl font-bold tracking-tight text-[#101828]">
                  <StatCounter value={tile.value} suffix={tile.suffix} />
                </p>
                <p className="mt-0.5 text-[11.5px] leading-tight text-[#667085]">{tile.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr]">
            <Card title="Conversation trend" hint="Last 30 days">
              <TrendChart />
            </Card>

            <Card title="Lead funnel" hint="This month">
              <div className="space-y-2.5">
                {FUNNEL.map((row, i) => (
                  <div key={row.label} className="grid grid-cols-[1fr_auto] items-center gap-2">
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[12px] text-[#475467]">{row.label}</span>
                        <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-[#101828]">
                          {row.value}
                        </span>
                      </div>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]">
                        <span
                          className="grow-bar block h-full rounded-full"
                          style={
                            {
                              '--bar-width': `${row.pct}%`,
                              '--bar-delay': `${200 + i * 120}ms`,
                              backgroundColor: i === FUNNEL.length - 1 ? '#16A67A' : '#5B5CE2',
                            } as React.CSSProperties
                          }
                        />
                      </span>
                    </div>
                    <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-[#667085]">
                      {row.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr]">
            <Card title="What visitors asked most" hint="Top 5">
              <ul className="space-y-2">
                {TOP_QUESTIONS.map((row, i) => (
                  <li key={row.question} className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <div className="min-w-0">
                      <span className="block truncate text-[12.5px] text-[#344054]">{row.question}</span>
                      <span className="mt-1 block h-1 overflow-hidden rounded-full bg-[#EEF0F4]">
                        <span
                          className="grow-bar block h-full rounded-full bg-[#5B5CE2]/55"
                          style={
                            {
                              '--bar-width': `${Math.round((row.count / maxQuestion) * 100)}%`,
                              '--bar-delay': `${300 + i * 90}ms`,
                            } as React.CSSProperties
                          }
                        />
                      </span>
                    </div>
                    <span className="text-[11.5px] font-semibold tabular-nums text-[#667085]">{row.count}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Content gaps to fix" hint="Asked, not answered">
              <p className="-mt-1 mb-3 text-[12px] leading-5 text-[#667085]">
                Questions the assistant could not answer from approved content. Add these to the site or
                upload a document and it starts answering them.
              </p>
              <ul className="space-y-1.5">
                {GAPS.map((row) => (
                  <li
                    key={row.question}
                    className="flex items-center gap-2 rounded-lg border border-[#FFFAEB] bg-[#FFFAEB] px-2.5 py-2"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#DC6803]" />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-[#344054]">{row.question}</span>
                    <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[#B54708]">
                      ×{row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr]">
            <Card title="Leads by day" hint="Weekly pattern">
              <div className="flex h-[92px] items-end gap-2">
                {LEADS_BY_DAY.map((row, i) => (
                  <div key={row.day} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[10.5px] font-semibold tabular-nums text-[#667085]">{row.value}</span>
                    <span className="flex w-full flex-1 items-end">
                      <span
                        className="grow-bar-v w-full rounded-t-[3px] bg-[#5B5CE2]/80"
                        style={
                          {
                            '--bar-height': `${Math.round((row.value / maxLeads) * 100)}%`,
                            '--bar-delay': `${250 + i * 70}ms`,
                          } as React.CSSProperties
                        }
                      />
                    </span>
                    <span className="text-[10.5px] text-[#667085]">{row.day}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Appointment outcomes" hint="31 requests">
              <div className="space-y-2.5">
                {OUTCOMES.map((row, i) => (
                  <div key={row.label} className="flex items-center gap-2.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.tone }} />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#475467]">{row.label}</span>
                    <span className="w-24 shrink-0">
                      <span className="block h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]">
                        <span
                          className="grow-bar block h-full rounded-full"
                          style={
                            {
                              '--bar-width': `${Math.round((row.value / 31) * 100)}%`,
                              '--bar-delay': `${300 + i * 110}ms`,
                              backgroundColor: row.tone,
                            } as React.CSSProperties
                          }
                        />
                      </span>
                    </span>
                    <span className="w-5 shrink-0 text-right text-[11.5px] font-semibold tabular-nums text-[#101828]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-[#E4E7EC] pt-3 text-[11.5px] leading-5 text-[#667085]">
                Estimated opportunity value is off by default. Turn it on only once the client tells you
                what an appointment is worth to them.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
