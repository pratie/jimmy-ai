'use client'

import * as React from 'react'
import {
  CalendarCheck2,
  Check,
  FileSearch,
  Globe,
  Loader2,
  MessagesSquare,
  Palette,
  UserRoundCheck,
  X,
} from 'lucide-react'

import { cd } from '@/lib/design-tokens'

/**
 * The right-hand panel of the zero-client screen.
 *
 * Replaces the old "What happens next", which restated the stepper as prose and
 * carried no state. This has two jobs and switches between them:
 *
 * - idle: what ChatDock will build, as a compact event stream of real product
 *   states rather than a marketing animation
 * - running: live setup feedback tied to the actual request
 *
 * Progress never advances past the step actually reached. A bar that glides to
 * 90% and waits is a lie an operator only has to catch once.
 */

export type SetupPhase =
  | 'idle'
  | 'connecting'
  | 'discovering'
  | 'reading'
  | 'indexing'
  | 'drafting'
  | 'ready'
  | 'failed'

const PIPELINE: { phase: SetupPhase; icon: React.ElementType; label: string; detail: string }[] = [
  { phase: 'connecting', icon: Globe, label: 'Connecting to the website', detail: 'Checking the address resolves' },
  { phase: 'discovering', icon: FileSearch, label: 'Discovering public pages', detail: 'Services, pricing, hours, FAQs' },
  { phase: 'reading', icon: FileSearch, label: 'Reading business information', detail: 'Only publicly available content' },
  { phase: 'indexing', icon: Loader2, label: 'Preparing knowledge', detail: 'So answers can cite their source' },
  { phase: 'drafting', icon: Palette, label: 'Creating the draft assistant', detail: 'Branded to the client' },
]

const ORDER: SetupPhase[] = ['connecting', 'discovering', 'reading', 'indexing', 'drafting', 'ready']

/** What the assistant will do once it exists — shown before anything is entered. */
const OUTCOMES = [
  { icon: MessagesSquare, label: 'Answers a visitor question', detail: 'From the client’s own pages, with the source cited' },
  { icon: UserRoundCheck, label: 'Captures a qualified lead', detail: 'Name and number, plus your qualifying questions' },
  { icon: CalendarCheck2, label: 'Creates a booking request', detail: 'Handed to the client to confirm' },
]

export default function SetupPreview({
  phase,
  domain,
  pagesFound,
  error,
}: {
  phase: SetupPhase
  domain?: string
  pagesFound?: number
  error?: string | null
}) {
  const activeIndex = ORDER.indexOf(phase)

  if (phase === 'idle') {
    return (
      <div className="flex h-full flex-col">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: cd.faint }}
        >
          What ChatDock builds
        </p>

        <ol className="mt-4 space-y-0">
          {PIPELINE.map((step, i) => (
            <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
              {i < PIPELINE.length - 1 && (
                <span
                  className="absolute left-[13px] top-7 h-[calc(100%-16px)] w-px"
                  style={{ backgroundColor: cd.line }}
                  aria-hidden="true"
                />
              )}
              <span
                className="relative z-10 grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border"
                style={{ borderColor: cd.line, backgroundColor: cd.surface, color: cd.faint }}
              >
                <step.icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="block text-[13px] font-medium" style={{ color: cd.body }}>
                  {step.label}
                </span>
                <span className="mt-0.5 block text-[11.5px]" style={{ color: cd.faint }}>
                  {step.detail}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-5 border-t pt-4" style={{ borderColor: cd.line }}>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: cd.faint }}
          >
            Then it starts working
          </p>
          <ul className="mt-3 space-y-2.5">
            {OUTCOMES.map((o) => (
              <li key={o.label} className="flex gap-2.5">
                <o.icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: cd.accent }} />
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-medium" style={{ color: cd.body }}>
                    {o.label}
                  </span>
                  <span className="block text-[11.5px]" style={{ color: cd.faint }}>
                    {o.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (phase === 'failed') {
    return (
      <div className="flex h-full flex-col justify-center">
        <span
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ backgroundColor: cd.dangerSoft, color: cd.danger }}
        >
          <X className="h-4 w-4" />
        </span>
        <p className="mt-3 text-[14px] font-semibold" style={{ color: cd.ink }}>
          Could not read that website
        </p>
        <p className="mt-1.5 text-[12.5px] leading-5" style={{ color: cd.muted }}>
          {error ??
            'We could not reach enough public content at that address. Check the domain, or add the client and upload documents instead.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: cd.faint }}>
        Setting up {domain}
      </p>

      <ol className="mt-4 space-y-0">
        {PIPELINE.map((step, i) => {
          const done = activeIndex > i
          const current = activeIndex === i
          return (
            <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
              {i < PIPELINE.length - 1 && (
                <span
                  className="absolute left-[13px] top-7 h-[calc(100%-16px)] w-px transition-colors"
                  style={{ backgroundColor: done ? cd.accent : cd.line }}
                  aria-hidden="true"
                />
              )}
              <span
                className="relative z-10 grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border transition-colors"
                style={{
                  borderColor: done || current ? cd.accent : cd.line,
                  backgroundColor: done ? cd.accent : cd.surface,
                  color: done ? '#fff' : current ? cd.accent : cd.faint,
                }}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : current ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                ) : (
                  <step.icon className="h-3.5 w-3.5" />
                )}
              </span>
              <span className="min-w-0 pt-0.5">
                <span
                  className="block text-[13px] font-medium transition-colors"
                  style={{ color: done || current ? cd.ink : cd.faint }}
                >
                  {step.label}
                </span>
                <span className="mt-0.5 block text-[11.5px]" style={{ color: cd.faint }}>
                  {current && step.phase === 'discovering' && pagesFound
                    ? `${pagesFound} pages found so far`
                    : step.detail}
                </span>
              </span>
            </li>
          )
        })}
      </ol>

      {phase === 'ready' && (
        <div
          className="mt-4 rounded-[10px] border px-3 py-2.5"
          style={{ borderColor: cd.successSoft, backgroundColor: cd.successSoft }}
        >
          <p className="text-[12.5px] font-semibold" style={{ color: cd.success }}>
            Ready to review
          </p>
        </div>
      )}

      <p className="mt-auto pt-4 text-[11.5px] leading-5" style={{ color: cd.faint }}>
        Most websites are ready to preview within a few minutes. Larger sites keep indexing in the
        background — you can start reviewing before it finishes.
      </p>
    </div>
  )
}
