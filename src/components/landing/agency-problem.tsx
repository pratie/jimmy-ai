import type * as React from 'react'
import { ArrowRight, CalendarCheck2, MessageSquareOff, MessageSquareText, PhoneOff, UserRoundCheck, UserRoundX, Wrench } from 'lucide-react'

import { Reveal } from '@/components/landing/reveal'

/**
 * Section 4 — the agency-level problem.
 *
 * Server component on purpose: this is SEO-relevant copy and needs no state.
 * Motion comes from the shared CSS reveal system.
 */

const PROBLEMS = [
  {
    icon: MessageSquareOff,
    title: 'Websites stop working when the office closes.',
    copy: 'Visitors with buying intent leave when they cannot quickly find an answer or reach someone. The traffic you already earned for the client goes unclaimed.',
  },
  {
    icon: Wrench,
    title: 'Custom AI builds destroy your margins.',
    copy: 'Crawlers, prompts, widgets, inboxes, integrations and spreadsheets have to be rebuilt and maintained for every client. The second account is as much work as the first.',
  },
  {
    icon: MessageSquareText,
    title: '“The bot is live” does not renew retainers.',
    copy: 'Clients keep paying when you can show conversations, leads and appointments. Message volume is not a result they recognise.',
  },
  {
    icon: PhoneOff,
    title: 'Somebody answers the same five questions all day.',
    copy: 'Hours, pricing, insurance, parking, whether they take new patients. Every one of those is a call or an email a person has to stop and handle, and none of them needs a person. This is usually the first thing the client notices, because they feel it in week one.',
  },
]

const BEFORE = [
  { icon: MessageSquareOff, label: 'Missed question' },
  { icon: UserRoundX, label: 'Abandoned visitor' },
]

const AFTER = [
  { icon: MessageSquareText, label: 'Instant answer' },
  { icon: UserRoundCheck, label: 'Qualified lead' },
  { icon: CalendarCheck2, label: 'Booked appointment' },
]

export default function AgencyProblem() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-4 sm:grid-cols-2">
        {PROBLEMS.map((problem, index) => (
          <Reveal key={problem.title} delay={index * 110}>
            <article className="h-full rounded-2xl border border-[#E4E7EC] bg-white p-6 sm:p-7">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F7F8FA] text-[#667085] ring-1 ring-[#E4E7EC]">
                <problem.icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-5 font-heading text-[17px] font-bold leading-snug tracking-tight text-[#101828]">
                {problem.title}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-7 text-[#667085]">{problem.copy}</p>
            </article>
          </Reveal>
        ))}
      </div>

      {/* The shift, stated as a path rather than a slogan */}
      <Reveal delay={200} className="mt-4">
        <div className="grid items-stretch gap-3 rounded-2xl border border-[#E4E7EC] bg-white p-4 sm:p-5 lg:grid-cols-[auto_1fr] lg:gap-5">
          <div className="rounded-xl bg-[#F7F8FA] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">Today</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {BEFORE.map((node, i) => (
                <span key={node.label} className="flex items-center gap-2">
                  <span className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-white px-3 py-2 text-[12.5px] font-medium text-[#667085]">
                    <node.icon className="h-3.5 w-3.5" />
                    {node.label}
                  </span>
                  {i < BEFORE.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#C6CBD6]" />}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[#ECFDF3] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B6E51]">With an assistant on the page</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {AFTER.map((node, i) => (
                <span
                  key={node.label}
                  className="stagger-item flex items-center gap-2"
                  style={{ '--stagger-delay': `${300 + i * 140}ms` } as React.CSSProperties}
                >
                  <span className="flex items-center gap-2 rounded-lg border border-[#16A67A]/25 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#101828]">
                    <node.icon className="h-3.5 w-3.5 text-[#16A67A]" />
                    {node.label}
                  </span>
                  {i < AFTER.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#16A67A]/50" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
