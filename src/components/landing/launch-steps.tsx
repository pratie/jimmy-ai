'use client'

import * as React from 'react'
import { Check, FileText, Globe, MessageSquareText, Paintbrush, Play, Upload } from 'lucide-react'

/**
 * Section 5 — how it works, in four steps.
 *
 * Each step carries a reproduction of the actual screen the agency uses, so
 * the section teaches the workflow rather than describing it. Everything shown
 * here exists in the product today (add domain → review sources → appearance
 * & lead questions → embed snippet + dashboard).
 *
 * Desktop: a tab rail with one shared panel.
 * Mobile: the same steps stacked vertically, each with its own panel — no
 * horizontal scrolling and no hover-dependent content.
 */

type StepId = 0 | 1 | 2 | 3

const STEPS: {
  title: string
  copy: string
  time: string
  icon: React.ElementType
}[] = [
  {
    title: 'Add the client',
    copy: 'Paste the website and upload any approved documents, FAQs or service information.',
    time: '~2 min',
    icon: Globe,
  },
  {
    title: 'Review what it learned',
    copy: 'Check the pages and sources it picked up, then test common customer questions privately before anything goes live.',
    time: '~10 min',
    icon: FileText,
  },
  {
    title: 'Brand and configure',
    copy: 'Add the client’s logo, colours, greeting, the questions that qualify a lead, and where a booking should go.',
    time: '~10 min',
    icon: Paintbrush,
  },
  {
    title: 'Install and measure',
    copy: 'Drop in one embed snippet. Conversations, leads and appointments land in your agency dashboard.',
    time: '~5 min',
    icon: Upload,
  },
]

/* ── Panel chrome shared by all four reproductions ── */
function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white">
      <div className="flex items-center gap-1.5 border-b border-[#E4E7EC] bg-[#F7F8FA] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#E4E7EC]" />
        <span className="h-2 w-2 rounded-full bg-[#E4E7EC]" />
        <span className="h-2 w-2 rounded-full bg-[#E4E7EC]" />
        <span className="ml-2 text-[11px] font-medium text-[#667085]">{label}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-[#344054]">{label}</span>
      <span
        className={`mt-1.5 flex h-9 items-center rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] px-3 text-[12.5px] text-[#475467] ${
          mono ? 'font-mono text-[11px]' : ''
        }`}
      >
        {value}
      </span>
    </label>
  )
}

function StepPanel({ step }: { step: StepId }) {
  if (step === 0) {
    return (
      <Panel label="New client workspace">
        <div className="space-y-3">
          <Field label="Client website" value="brightsmiledental.com" />
          <div>
            <span className="text-[11px] font-semibold text-[#344054]">Approved documents</span>
            <div className="mt-1.5 space-y-1.5">
              {['service-menu-2026.pdf', 'new-patient-faq.docx', 'insurance-accepted.pdf'].map((file) => (
                <div
                  key={file}
                  className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-white px-3 py-2"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[#667085]" />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-[#475467]">{file}</span>
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#16A67A]" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-9 items-center justify-center rounded-lg bg-[#5B5CE2] text-[12.5px] font-semibold text-white">
            Create workspace
          </div>
        </div>
      </Panel>
    )
  }

  if (step === 1) {
    return (
      <Panel label="Knowledge sources · Bright Smile Dental">
        <div className="space-y-1.5">
          {[
            ['/services', 'Website page', '1,840 words'],
            ['/pricing', 'Website page', '620 words'],
            ['/hours-location', 'Website page', '310 words'],
            ['service-menu-2026.pdf', 'Document', '4 pages'],
          ].map(([name, type, size]) => (
            <div key={name} className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] px-3 py-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A67A]" />
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#344054]">{name}</span>
              <span className="hidden shrink-0 text-[11px] text-[#667085] sm:inline">{type}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-[#667085]">{size}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#344054]">
            <Play className="h-3 w-3 text-[#5B5CE2]" /> Private test — not visible to visitors
          </p>
          <div className="mt-2.5 space-y-2">
            <p className="ml-auto w-fit max-w-[80%] rounded-lg rounded-br-sm bg-[#5B5CE2] px-2.5 py-1.5 text-[11.5px] text-white">
              Do you take Delta Dental?
            </p>
            <p className="w-fit max-w-[85%] rounded-lg rounded-bl-sm border border-[#E4E7EC] bg-white px-2.5 py-1.5 text-[11.5px] text-[#475467]">
              Yes — Delta Dental PPO is accepted. Coverage varies by plan, so the front desk confirms
              your specific benefits before your visit.
            </p>
          </div>
        </div>
      </Panel>
    )
  }

  if (step === 2) {
    return (
      <Panel label="Appearance & lead questions">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <Field label="Assistant name" value="Bright Smile Assistant" />
            <div>
              <span className="text-[11px] font-semibold text-[#344054]">Brand colour</span>
              <div className="mt-1.5 flex items-center gap-2">
                {['#5B5CE2', '#16A67A', '#0E1726', '#D9488C'].map((color, i) => (
                  <span
                    key={color}
                    className="h-7 w-7 rounded-lg ring-offset-2"
                    style={{
                      backgroundColor: color,
                      boxShadow: i === 0 ? '0 0 0 2px #fff, 0 0 0 4px #5B5CE2' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#344054]">Qualifying questions</span>
              <div className="mt-1.5 space-y-1.5">
                {['Are you a new patient?', 'Which treatment?', 'Best number to reach you?'].map((q) => (
                  <div
                    key={q}
                    className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] px-2.5 py-1.5 text-[11.5px] text-[#475467]"
                  >
                    <Check className="h-3 w-3 shrink-0 text-[#16A67A]" />
                    {q}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live preview of the widget the visitor sees */}
          <div className="overflow-hidden rounded-lg border border-[#E4E7EC]">
            <div className="flex items-center gap-2 bg-[#0E1726] px-3 py-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#5B5CE2] text-[9px] font-bold text-white">
                BS
              </span>
              <span className="text-[11.5px] font-semibold text-white">Bright Smile Dental</span>
            </div>
            <div className="space-y-2 bg-white p-3">
              <p className="w-fit max-w-[92%] rounded-lg rounded-bl-sm border border-[#E4E7EC] bg-[#F7F8FA] px-2.5 py-1.5 text-[11.5px] text-[#475467]">
                Hi! I can help with treatments, pricing and booking. What brings you in?
              </p>
              <div className="flex h-8 items-center justify-between rounded-lg bg-[#F7F8FA] px-2.5 text-[11px] text-[#667085]">
                Write a message…
                <span className="text-[#5B5CE2]">↑</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <Panel label="Install & dashboard">
      <Field
        label="Embed snippet — paste once, before </body>"
        value='<script src="https://chatdock.io/embed.min.js" …>'
        mono
      />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ['Conversations', '428'],
          ['Qualified leads', '72'],
          ['Appointments', '31'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] px-3 py-2.5">
            <p className="font-heading text-lg font-bold tabular-nums text-[#101828]">{value}</p>
            <p className="mt-0.5 text-[10.5px] leading-tight text-[#667085]">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5 space-y-1.5">
        {[
          ['Sarah M.', 'Saturday whitening — booked', '#16A67A'],
          ['James K.', 'Asked about implant pricing', '#5B5CE2'],
        ].map(([name, note, tone]) => (
          <div key={name} className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] px-3 py-2">
            <MessageSquareText className="h-3.5 w-3.5 shrink-0" style={{ color: tone }} />
            <span className="shrink-0 text-[11.5px] font-semibold text-[#101828]">{name}</span>
            <span className="min-w-0 flex-1 truncate text-[11.5px] text-[#667085]">{note}</span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[10.5px] text-[#667085]">Demo workspace · illustrative data</p>
    </Panel>
  )
}

export default function LaunchSteps() {
  const [active, setActive] = React.useState<StepId>(0)

  return (
    <div className="mx-auto max-w-6xl">
      {/* ── Desktop: tab rail + shared panel ── */}
      <div className="hidden gap-8 lg:grid lg:grid-cols-[380px_1fr]">
        <div role="tablist" aria-label="Launch steps" className="flex flex-col gap-2">
          {STEPS.map((step, index) => {
            const selected = active === index
            return (
              <button
                key={step.title}
                role="tab"
                type="button"
                id={`launch-tab-${index}`}
                aria-selected={selected}
                aria-controls="launch-panel"
                onClick={() => setActive(index as StepId)}
                className={`rounded-xl border p-4 text-left transition-all duration-300 ease-out-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2 ${
                  selected
                    ? 'border-[#5B5CE2]/35 bg-white shadow-[0_4px_20px_-8px_rgba(16,24,40,0.16)]'
                    : 'border-[#E4E7EC] bg-transparent hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold transition-colors duration-300 ${
                      selected ? 'bg-[#5B5CE2] text-white' : 'bg-[#F7F8FA] text-[#667085] ring-1 ring-[#E4E7EC]'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 font-heading text-[15px] font-bold tracking-tight text-[#101828]">
                    {step.title}
                  </span>
                  <span className="shrink-0 text-[11px] font-medium tabular-nums text-[#667085]">{step.time}</span>
                </span>
                <span
                  className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out-strong"
                  style={{ gridTemplateRows: selected ? '1fr' : '0fr' }}
                >
                  <span className="overflow-hidden">
                    <span className="mt-2.5 block pl-11 text-[13.5px] leading-6 text-[#667085]">{step.copy}</span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div role="tabpanel" id="launch-panel" aria-labelledby={`launch-tab-${active}`}>
          <StepPanel step={active} />
        </div>
      </div>

      {/* ── Mobile: vertical steps, each with its own panel ── */}
      <div className="flex flex-col gap-4 lg:hidden">
        {STEPS.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-[#E4E7EC] bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#5B5CE2] text-[13px] font-bold text-white">
                {index + 1}
              </span>
              <h3 className="flex-1 font-heading text-[15px] font-bold tracking-tight text-[#101828]">
                {step.title}
              </h3>
              <span className="shrink-0 text-[11px] font-medium tabular-nums text-[#667085]">{step.time}</span>
            </div>
            <p className="mt-2.5 text-[14px] leading-6 text-[#667085]">{step.copy}</p>
            <div className="mt-3.5">
              <StepPanel step={index as StepId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
