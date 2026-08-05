'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CalendarCheck2, Globe, Loader2, MessagesSquare, UserRoundCheck } from 'lucide-react'

import { onIntegrateDomain } from '@/actions/settings'
import { cd } from '@/lib/design-tokens'
import SetupPreview, { type SetupPhase } from './setup-preview'

/**
 * The zero-client dashboard.
 *
 * Replaces the previous full-page wizard, which took over the entire "Agency
 * Overview" whenever the roster was empty. This is a purposeful first-run
 * screen: the input on the left, what will actually be built on the right, and
 * three outcome cards below so the page reads as complete without inventing
 * analytics for a workspace that has none.
 */

/** Accepts what people actually paste, rejects what cannot be a domain. */
function normaliseDomain(raw: string): { ok: true; domain: string } | { ok: false; reason: string } {
  const trimmed = raw.trim().toLowerCase()
  if (!trimmed) return { ok: false, reason: 'Enter the client’s website address.' }

  const stripped = trimmed
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/\s+/g, '')

  if (stripped.includes('@')) {
    return { ok: false, reason: 'That looks like an email address — enter the website instead.' }
  }
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(stripped)) {
    return { ok: false, reason: 'That does not look like a domain. Try something like acmedental.com' }
  }
  return { ok: true, domain: stripped }
}

const OUTCOME_CARDS = [
  {
    icon: MessagesSquare,
    title: 'Answer customer questions',
    body: 'The assistant replies from the client’s approved pages and cites where the answer came from.',
    fragment: (
      <div className="space-y-1.5">
        <p
          className="ml-auto w-fit max-w-[85%] rounded-[8px] rounded-br-[3px] px-2.5 py-1.5 text-[11px] text-white"
          style={{ backgroundColor: cd.accent }}
        >
          Do you open on Saturdays?
        </p>
        <p
          className="w-fit max-w-[92%] rounded-[8px] rounded-bl-[3px] border px-2.5 py-1.5 text-[11px]"
          style={{ borderColor: cd.line, color: cd.body }}
        >
          Yes — 9:00 AM to 2:00 PM.
          <span className="mt-1 block text-[9.5px]" style={{ color: cd.faint }}>
            From /hours-location
          </span>
        </p>
      </div>
    ),
  },
  {
    icon: UserRoundCheck,
    title: 'Capture qualified leads',
    body: 'It asks the questions that qualify a lead for that business, then saves the contact details.',
    fragment: (
      <div className="rounded-[8px] border px-2.5 py-2" style={{ borderColor: cd.line }}>
        <p className="text-[11px] font-semibold" style={{ color: cd.ink }}>
          Sarah Mitchell
        </p>
        <p className="text-[10px]" style={{ color: cd.muted }}>
          (555) 014-2288
        </p>
        <span
          className="mt-1.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold"
          style={{ backgroundColor: cd.successSoft, color: cd.success }}
        >
          Qualified
        </span>
      </div>
    ),
  },
  {
    icon: CalendarCheck2,
    title: 'Prove value to clients',
    body: 'Every conversation, lead and booking request is logged per client, ready for the review call.',
    fragment: (
      <div className="space-y-1.5">
        {[
          ['Conversations', '—'],
          ['Qualified leads', '—'],
          ['Booking requests', '—'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[10.5px]" style={{ color: cd.muted }}>
              {label}
            </span>
            <span className="text-[11px] font-semibold tabular-nums" style={{ color: cd.faint }}>
              {value}
            </span>
          </div>
        ))}
        <p className="pt-0.5 text-[9.5px]" style={{ color: cd.faint }}>
          Fills in once the assistant is live
        </p>
      </div>
    ),
  },
]

export default function FirstClientSetup() {
  const router = useRouter()
  const [value, setValue] = React.useState('')
  const [phase, setPhase] = React.useState<SetupPhase>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const inputId = React.useId()
  const errorId = React.useId()

  const busy = phase !== 'idle' && phase !== 'failed' && phase !== 'ready'

  // The normalised domain, for the progress panel's heading.
  const parsedDomain = React.useMemo(() => {
    const parsed = normaliseDomain(value)
    return parsed.ok ? parsed.domain : null
  }, [value])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const parsed = normaliseDomain(value)
    if (!parsed.ok) {
      setError(parsed.reason)
      setPhase('idle')
      return
    }

    // Phases advance only as far as the work actually reaches. The request is a
    // single server action, so the intermediate labels are paced rather than
    // reported — but none of them claim completion, and the run stops where the
    // work stops.
    setPhase('connecting')
    const pace = (next: SetupPhase, ms: number) =>
      new Promise<void>((r) => setTimeout(() => { setPhase(next); r() }, ms))

    const work = onIntegrateDomain(parsed.domain, '')
    await pace('discovering', 500)
    await pace('reading', 900)
    await pace('indexing', 900)

    const result = await work

    if (result?.status === 200 && result.id) {
      setPhase('drafting')
      await pace('ready', 500)
      router.push(`/clients/${result.id}`)
      return
    }

    setPhase('failed')
    setError(result?.message ?? 'Could not add that client. Try another address.')
  }

  return (
    <div className="space-y-4">
      <div
        className="grid overflow-hidden rounded-[14px] border lg:grid-cols-[minmax(0,1fr)_340px]"
        style={{ borderColor: cd.line, backgroundColor: cd.surface }}
      >
        {/* Left — the action */}
        <div className="p-6 sm:p-8">
          <h1
            className="text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]"
            style={{ color: cd.ink }}
          >
            Create your first client assistant
          </h1>
          <p className="mt-2.5 max-w-md text-[14px] leading-6" style={{ color: cd.muted }}>
            Enter a client website. ChatDock collects its public business information and prepares a
            branded AI receptionist you can review before installing it.
          </p>

          <form onSubmit={submit} className="mt-6 max-w-md" noValidate>
            <label
              htmlFor={inputId}
              className="block text-[12.5px] font-semibold"
              style={{ color: cd.body }}
            >
              Client website
            </label>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Globe
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: cd.faint }}
                  aria-hidden="true"
                />
                <input
                  id={inputId}
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  disabled={busy}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value)
                    if (error) setError(null)
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  placeholder="acmedental.com"
                  className="h-11 w-full rounded-[10px] border pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/12 disabled:opacity-60"
                  style={{ borderColor: error ? cd.danger : cd.lineStrong, color: cd.ink }}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] px-5 text-[13.5px] font-semibold text-white transition-colors disabled:opacity-70"
                style={{ backgroundColor: cd.accent }}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                    Setting up…
                  </>
                ) : (
                  <>
                    Create client assistant
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Reserved height, so validation never shifts the layout. */}
            <p
              id={errorId}
              role={error ? 'alert' : undefined}
              className="mt-2 min-h-[18px] text-[12px]"
              style={{ color: error ? cd.danger : cd.faint }}
            >
              {error ?? 'Use the main public domain. No sitemap or technical access needed.'}
            </p>
          </form>
        </div>

        {/* Right — what gets built, or live progress */}
        <div
          className="border-t p-6 lg:border-l lg:border-t-0"
          style={{ borderColor: cd.line, backgroundColor: cd.canvas }}
        >
          <SetupPreview
            phase={phase}
            domain={parsedDomain ?? undefined}
            error={error}
          />
        </div>
      </div>

      {/* Outcome cards — real interface fragments, no illustrations */}
      <div className="grid gap-3 md:grid-cols-3">
        {OUTCOME_CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-[12px] border p-4"
            style={{ borderColor: cd.line, backgroundColor: cd.surface }}
          >
            <card.icon className="h-4 w-4" style={{ color: cd.accent }} />
            <h2 className="mt-3 text-[13.5px] font-semibold" style={{ color: cd.ink }}>
              {card.title}
            </h2>
            <p className="mt-1 text-[12.5px] leading-5" style={{ color: cd.muted }}>
              {card.body}
            </p>
            <div
              className="mt-3 rounded-[10px] p-2.5"
              style={{ backgroundColor: cd.canvas }}
              aria-hidden="true"
            >
              {card.fragment}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
