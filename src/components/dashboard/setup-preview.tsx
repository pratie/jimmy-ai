'use client'

import * as React from 'react'
import { AlertTriangle, ArrowRight, Check, FileText, Loader2 } from 'lucide-react'

import { cd } from '@/lib/design-tokens'

/**
 * The right rail of the zero-client screen.
 *
 * Two states, deliberately different:
 *
 * - idle — a five-stage flow of what will happen, plus one concrete outcome so
 *   the product is understandable without reading every line. Nothing is shown
 *   as running, because nothing is.
 * - active — the same five stages carrying real progress, with a recovery
 *   action on failure.
 *
 * Progress never advances past the stage actually reached. A bar that glides to
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

const STAGES: { phase: SetupPhase; idle: string; active: string }[] = [
  { phase: 'connecting', idle: 'Website connected', active: 'Connecting to website' },
  { phase: 'discovering', idle: 'Pages discovered', active: 'Discovering pages' },
  { phase: 'reading', idle: 'Business information read', active: 'Extracting business information' },
  { phase: 'indexing', idle: 'Knowledge prepared', active: 'Creating knowledge' },
  { phase: 'drafting', idle: 'Assistant ready to test', active: 'Preparing assistant preview' },
]

const ORDER: SetupPhase[] = ['connecting', 'discovering', 'reading', 'indexing', 'drafting', 'ready']

/** The citation chip. One of the few components meant to be recognisably ours. */
export function SourceCitation({ label }: { label: string }) {
  return (
    <span
      className="mt-1.5 inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-0.5 text-[10px] font-medium"
      style={{ borderColor: cd.accentLine, backgroundColor: cd.accentSoft, color: cd.accent }}
    >
      <FileText className="h-2.5 w-2.5" />
      {label}
    </span>
  )
}

function StageRow({
  index,
  total,
  label,
  state,
}: {
  index: number
  total: number
  label: string
  state: 'pending' | 'active' | 'done'
}) {
  return (
    <li className="relative flex gap-2.5 pb-3.5 last:pb-0">
      {index < total - 1 && (
        <span
          className="absolute left-[10px] top-6 h-[calc(100%-14px)] w-px transition-colors"
          style={{ backgroundColor: state === 'done' ? cd.accent : cd.line }}
          aria-hidden="true"
        />
      )}
      <span
        className="relative z-10 mt-0.5 grid h-[21px] w-[21px] shrink-0 place-items-center rounded-full border transition-colors"
        style={{
          borderColor: state === 'pending' ? cd.line : cd.accent,
          backgroundColor: state === 'done' ? cd.accent : cd.surface,
          color: state === 'done' ? '#fff' : cd.accent,
        }}
      >
        {state === 'done' ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : state === 'active' ? (
          <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cd.line }} />
        )}
      </span>
      <span
        className="pt-0.5 text-[12.5px] transition-colors"
        style={{
          // Upcoming stages stay readable. cd.faint measured as disabled-looking
          // against the panel tint, which implied they were unavailable rather
          // than simply not started yet.
          color: state === 'pending' ? cd.muted : cd.ink,
          fontWeight: state === 'active' ? 600 : 400,
        }}
      >
        {label}
      </span>
    </li>
  )
}

export default function SetupPreview({
  phase,
  domain,
  pagesFound,
  error,
  onRetry,
  onTest,
}: {
  phase: SetupPhase
  domain?: string
  pagesFound?: number
  error?: string | null
  onRetry?: () => void
  onTest?: () => void
}) {
  const activeIndex = ORDER.indexOf(phase)

  if (phase === 'failed') {
    return (
      <div className="flex h-full flex-col justify-center">
        <span
          className="grid h-8 w-8 place-items-center rounded-full"
          style={{ backgroundColor: cd.dangerSoft, color: cd.danger }}
        >
          <AlertTriangle className="h-4 w-4" />
        </span>
        <p className="mt-3 text-[13.5px] font-semibold" style={{ color: cd.ink }}>
          Could not read that website
        </p>
        <p className="mt-1.5 text-[12.5px] leading-5" style={{ color: cd.muted }}>
          {error ?? 'We could not reach enough public content at that address.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex h-8 w-fit items-center gap-1.5 rounded-[8px] border px-3 text-[12.5px] font-semibold"
            style={{ borderColor: cd.lineStrong, color: cd.ink }}
          >
            Try another website
          </button>
        )}
      </div>
    )
  }

  const running = phase !== 'idle'

  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: cd.faint }}>
        {running ? `Setting up ${domain ?? 'your client'}` : 'How it works'}
      </p>

      <ol className="mt-3.5">
        {STAGES.map((stage, i) => (
          <StageRow
            key={stage.phase}
            index={i}
            total={STAGES.length}
            label={running ? stage.active : stage.idle}
            state={
              !running ? 'pending' : activeIndex > i ? 'done' : activeIndex === i ? 'active' : 'pending'
            }
          />
        ))}
      </ol>

      {/* Setup complete — a compact summary and the one action that follows.
          The conversation example that used to live here duplicated the
          assistant preview on the left and the outcome cards below. */}
      {phase === 'ready' && (
        <div className="mt-4 border-t pt-4" style={{ borderColor: cd.line }}>
          <dl className="space-y-2">
            {[
              // chunksCreated counts indexed passages, not pages. Calling them
              // pages would be a number the operator could check and find wrong.
              ['Passages indexed', pagesFound !== undefined ? `${pagesFound}` : '—'],
              ['Knowledge', pagesFound ? 'Ready' : 'Needs sources'],
              ['Assistant', 'Draft created'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <dt className="text-[12px]" style={{ color: cd.muted }}>
                  {label}
                </dt>
                <dd className="text-[12px] font-semibold" style={{ color: cd.ink }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          {onTest && (
            <button
              type="button"
              onClick={onTest}
              className="mt-3.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[9px] text-[13px] font-semibold text-white"
              style={{ backgroundColor: cd.accent }}
            >
              Test assistant
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {running && (
        <p className="mt-auto pt-4 text-[11.5px] leading-5" style={{ color: cd.faint }}>
          Most websites are ready to preview within a few minutes. Larger sites keep indexing in the
          background.
        </p>
      )}
    </div>
  )
}
