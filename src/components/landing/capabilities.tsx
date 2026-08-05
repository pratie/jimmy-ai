import type * as React from 'react'
import { Check, FileText, Globe, Play, Rocket, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'

import { Reveal } from '@/components/landing/reveal'

/**
 * Section 10 — capabilities, grouped by the outcome the agency is buying
 * rather than by technical category. Four cards, each with its own interface
 * fragment, deliberately not a grid of identical icon tiles.
 *
 * Every line here is verified against the shipped product. Branding removal is
 * plan-gated (Pro & Business — see components/settings/white-label-form.tsx)
 * and is labelled as such.
 */

function Group({
  icon: Icon,
  eyebrow,
  title,
  items,
  visual,
  className = '',
}: {
  icon: React.ElementType
  eyebrow: string
  title: string
  items: string[]
  visual: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex h-full flex-col rounded-2xl border border-[#E4E7EC] bg-white p-5 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F7F8FA] text-[#5B5CE2] ring-1 ring-[#E4E7EC]">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">{eyebrow}</span>
      </div>
      <h3 className="mt-4 font-heading text-[19px] font-bold tracking-tight text-[#101828]">{title}</h3>

      <div className="mt-5">{visual}</div>

      <ul className="mt-5 grid gap-2 border-t border-[#E4E7EC] pt-5 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] leading-5 text-[#475467]">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A67A]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Capabilities() {
  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">
      <Reveal>
        <Group
          icon={Rocket}
          eyebrow="Launch quickly"
          title="From a URL to a tested assistant, without a developer."
          items={[
            'Website ingestion',
            'Document uploads',
            'Private testing before launch',
            'One-line embed snippet',
            'No-code configuration',
          ]}
          visual={
            <div className="rounded-xl border border-[#E4E7EC] bg-[#F7F8FA] p-3.5">
              <div className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-white px-3 py-2">
                <Globe className="h-3.5 w-3.5 shrink-0 text-[#667085]" />
                <span className="min-w-0 flex-1 truncate text-[12px] text-[#344054]">brightsmiledental.com</span>
                <Check className="h-3.5 w-3.5 shrink-0 text-[#16A67A]" />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['12 pages', '3 documents', 'Tested privately'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md border border-[#E4E7EC] bg-white px-2 py-1 text-[11px] font-medium text-[#475467]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <p className="mt-2.5 truncate rounded-lg bg-[#0E1726] px-3 py-2 font-mono text-[10.5px] text-white/70">
                &lt;script src=&quot;https://chatdock.io/embed.min.js&quot; …&gt;
              </p>
            </div>
          }
        />
      </Reveal>

      <Reveal delay={100}>
        <Group
          icon={ShieldCheck}
          eyebrow="Protect the client’s brand"
          title="It looks like part of their team, not a tool you resold."
          items={[
            'Client logo and colours',
            'Custom greeting and tone',
            'Separate knowledge per client',
            'Remove ChatDock branding (Pro & Business)',
          ]}
          visual={
            <div className="space-y-2 rounded-xl border border-[#E4E7EC] bg-[#F7F8FA] p-3.5">
              {[
                { name: 'Bright Smile Dental', initials: 'BS', color: '#5B5CE2' },
                { name: 'Cardinal Heating & Air', initials: 'CH', color: '#16A67A' },
                { name: 'Vance & Reed Law', initials: 'VR', color: '#0E1726' },
              ].map((client) => (
                <div
                  key={client.name}
                  className="flex items-center gap-2.5 overflow-hidden rounded-lg bg-white ring-1 ring-[#E4E7EC]"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: client.color }}
                  >
                    {client.initials}
                  </span>
                  <span className="min-w-0 flex-1 truncate py-2 text-[12px] font-semibold text-[#101828]">
                    {client.name}
                  </span>
                  <span className="mr-3 shrink-0 text-[10px] font-medium text-[#667085]">own workspace</span>
                </div>
              ))}
            </div>
          }
        />
      </Reveal>

      <Reveal delay={150}>
        <Group
          icon={Sparkles}
          eyebrow="Generate opportunities"
          title="Answers become names, numbers and booked times."
          items={[
            'Lead capture in conversation',
            'Custom qualifying questions',
            'Appointment guidance',
            'One conversation inbox',
            'Step in and reply as a human',
          ]}
          visual={
            <div className="rounded-xl border border-[#E4E7EC] bg-[#F7F8FA] p-3.5">
              <div className="rounded-lg border border-[#E4E7EC] bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#5B5CE2]/10 text-[10px] font-bold text-[#5B5CE2]">
                    SM
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold text-[#101828]">Sarah Mitchell</span>
                    <span className="block truncate text-[11px] text-[#667085]">(555) 014-2288</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10px] font-bold text-[#0B6E51]">
                    Qualified
                  </span>
                </div>
                <dl className="mt-3 space-y-1.5 border-t border-[#E4E7EC] pt-2.5">
                  {[
                    ['New patient?', 'Yes'],
                    ['Treatment', 'Whitening'],
                    ['Preferred time', 'Saturday AM'],
                  ].map(([q, a]) => (
                    <div key={q} className="flex items-baseline justify-between gap-3 text-[11px]">
                      <dt className="truncate text-[#667085]">{q}</dt>
                      <dd className="shrink-0 font-semibold text-[#344054]">{a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          }
        />
      </Reveal>

      <Reveal delay={200}>
        <Group
          icon={TrendingUp}
          eyebrow="Prove the value"
          title="Walk into the review call with the month already written."
          items={[
            'Full conversation history',
            'Qualified lead tracking',
            'Appointment tracking',
            'Client-level reporting',
            'Funnel analytics',
          ]}
          visual={
            <div className="rounded-xl border border-[#E4E7EC] bg-[#F7F8FA] p-3.5">
              <div className="space-y-2.5 rounded-lg border border-[#E4E7EC] bg-white p-3">
                {[
                  ['Conversations', '428', 100, '#5B5CE2'],
                  ['Qualified leads', '72', 46, '#5B5CE2'],
                  ['Appointments', '31', 22, '#16A67A'],
                ].map(([label, value, width, tone], i) => (
                  <div key={label as string} className="grid grid-cols-[92px_1fr_34px] items-center gap-2.5">
                    <span className="truncate text-[11px] text-[#667085]">{label}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]">
                      <span
                        className="grow-bar block h-full rounded-full"
                        style={
                          {
                            '--bar-width': `${width}%`,
                            '--bar-delay': `${300 + i * 120}ms`,
                            backgroundColor: tone as string,
                          } as React.CSSProperties
                        }
                      />
                    </span>
                    <span className="text-right text-[11px] font-bold tabular-nums text-[#101828]">{value}</span>
                  </div>
                ))}
                <p className="flex items-center gap-1.5 border-t border-[#E4E7EC] pt-2.5 text-[10.5px] text-[#667085]">
                  <Play className="h-2.5 w-2.5" />
                  Sample data
                </p>
              </div>
            </div>
          }
        />
      </Reveal>

      <Reveal delay={250} className="lg:col-span-2">
        <p className="flex items-start justify-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-5 py-4 text-center text-[13px] leading-6 text-[#667085]">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#667085]" />
          <span>
            Everything listed above works today. Shareable prospect demo links, client logins and CSV export
            are on the roadmap. You will not find them advertised here until they ship.
          </span>
        </p>
      </Reveal>
    </div>
  )
}
