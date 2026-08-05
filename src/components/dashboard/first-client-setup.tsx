'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Globe, Loader2 } from 'lucide-react'

import { onIntegrateDomain } from '@/actions/settings'
import { cd } from '@/lib/design-tokens'
import SetupPreview, { SourceCitation, type SetupPhase } from './setup-preview'

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
    title: 'Answer questions',
    body: 'Answers from the client’s own pages and cites the source.',
    fragment: (
      <>
        <p
          className="ml-auto w-fit max-w-[85%] rounded-[8px] rounded-br-[3px] px-2.5 py-1.5 text-[11px] text-white"
          style={{ backgroundColor: cd.accent }}
        >
          How much is a cleaning?
        </p>
        <div className="mt-1.5">
          <p
            className="w-fit max-w-[92%] rounded-[8px] rounded-bl-[3px] border px-2.5 py-1.5 text-[11px]"
            style={{ borderColor: cd.line, color: cd.body }}
          >
            $120 for returning patients, $89 for new ones.
          </p>
          <SourceCitation label="Services" />
        </div>
      </>
    ),
  },
  {
    title: 'Capture leads',
    body: 'Collects contact details and the answers needed to qualify each lead.',
    fragment: (
      <div className="rounded-[8px] border px-2.5 py-2" style={{ borderColor: cd.line }}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11.5px] font-semibold" style={{ color: cd.ink }}>
            Sarah Mitchell
          </p>
          <span
            className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
            style={{ backgroundColor: cd.successSoft, color: cd.success }}
          >
            Qualified
          </span>
        </div>
        <p className="mt-0.5 text-[10.5px]" style={{ color: cd.muted }}>
          (555) 014-2288
        </p>
        <p className="mt-1.5 border-t pt-1.5 text-[10px]" style={{ borderColor: cd.line, color: cd.faint }}>
          New patient · Whitening
        </p>
      </div>
    ),
  },
  {
    title: 'Request bookings',
    body: 'Collects the visitor’s preferred time and sends it to the client for confirmation.',
    fragment: (
      <div className="rounded-[8px] border px-2.5 py-2" style={{ borderColor: cd.line }}>
        <p className="text-[11.5px] font-semibold" style={{ color: cd.ink }}>
          Saturday 14 March
        </p>
        <p className="mt-0.5 text-[10.5px]" style={{ color: cd.muted }}>
          10:30 AM · Whitening
        </p>
        <span
          className="mt-1.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold"
          style={{ backgroundColor: cd.warningSoft, color: cd.warning }}
        >
          Pending confirmation
        </span>
      </div>
    ),
  },
]

/** The five things an agency actually does to get a client live. */
const CHECKLIST = [
  'Add client website',
  'Review imported knowledge',
  'Customize assistant',
  'Test responses',
  'Install widget',
]

/** The primary button's label for each real phase — never a generic spinner. */
const CTA_LABEL: Record<string, string> = {
  idle: 'Create client assistant',
  connecting: 'Connecting…',
  discovering: 'Discovering pages…',
  reading: 'Reading business info…',
  indexing: 'Preparing knowledge…',
  drafting: 'Preparing assistant…',
  ready: 'Test assistant',
  failed: 'Try again',
}

export default function FirstClientSetup({ organizationName }: { organizationName: string }) {
  const router = useRouter()
  const [value, setValue] = React.useState('')
  const [phase, setPhase] = React.useState<SetupPhase>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const [createdId, setCreatedId] = React.useState<string | null>(null)

  /** Only the first step can complete on this screen; the rest live elsewhere. */
  const completedSteps = phase === 'ready' ? 1 : 0
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
    if (phase === 'ready' && createdId) {
      router.push(`/clients/${createdId}`)
      return
    }
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
      // Deliberately no auto-redirect. Yanking the operator to another screen
      // the instant a background job finishes loses the summary they just
      // waited for; "Test assistant" hands the choice back to them.
      setCreatedId(result.id)
      return
    }

    setPhase('failed')
    setError(result?.message ?? 'Could not add that client. Try another address.')
  }

  return (
    <div className="space-y-4">
      <p className="text-[12px] font-medium" style={{ color: cd.faint }}>
        {organizationName} · getting started
      </p>
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
            Launch your first client assistant
          </h1>
          <p className="mt-2.5 max-w-md text-[14px] leading-6" style={{ color: cd.muted }}>
            Start with a client website. ChatDock will prepare the knowledge, branding and assistant
            experience for you to review.
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
                {busy && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
                {CTA_LABEL[phase] ?? CTA_LABEL.idle}
                {!busy && <ArrowRight className="h-4 w-4" />}
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

          {/* The assistant as it will appear. Favicon-led, so the client is
              identifiable at a glance, and every claim in it is either the
              typed domain or clearly-labelled sample content. */}
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: cd.faint }}
              >
                What your client’s visitors will see
              </p>
              {!parsedDomain && (
                <span
                  className="rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: cd.sunken, color: cd.muted }}
                >
                  Sample preview
                </span>
              )}
            </div>

            <div className="mt-2 overflow-hidden rounded-[12px]" style={{ backgroundColor: cd.canvas }}>
              <div
                className="flex items-center gap-2.5 px-3 py-2.5"
                style={{ backgroundColor: cd.navy }}
              >
                {parsedDomain ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${parsedDomain}&sz=64`}
                    alt=""
                    width={26}
                    height={26}
                    className="h-[26px] w-[26px] shrink-0 rounded-[6px] bg-white object-contain p-0.5"
                  />
                ) : (
                  <span
                    className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[6px] text-[10px] font-bold text-white"
                    style={{ backgroundColor: cd.accent }}
                  >
                    AD
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-white">
                    {parsedDomain ?? 'Acme Dental'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-white/50">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: busy ? cd.warning : cd.success }}
                    />
                    {busy ? 'Preparing…' : 'Online'}
                    <span className="text-white/25">·</span>
                    <span className="truncate">{parsedDomain ?? 'acmedental.com'}</span>
                  </span>
                </span>
              </div>

              <div className="p-3" style={{ backgroundColor: cd.surface }}>
                <p
                  className="ml-auto w-fit max-w-[80%] rounded-[9px] rounded-br-[3px] px-2.5 py-1.5 text-[12px] text-white"
                  style={{ backgroundColor: cd.accent }}
                >
                  Do you take new patients?
                </p>
                <div className="mt-1.5">
                  {busy ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-[9px] rounded-bl-[3px] border px-2.5 py-2"
                      style={{ borderColor: cd.line }}
                      aria-label="Assistant is preparing"
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 animate-pulse rounded-full motion-reduce:animate-none"
                          style={{ backgroundColor: cd.faint, animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </span>
                  ) : (
                    <>
                      <p
                        className="w-fit max-w-[90%] rounded-[9px] rounded-bl-[3px] border px-2.5 py-1.5 text-[12px] leading-[1.45]"
                        style={{ borderColor: cd.line, color: cd.body }}
                      >
                        Yes — we’re accepting new patients this month.
                      </p>
                      <SourceCitation label="New patients" />
                    </>
                  )}
                </div>

                <div
                  className="mt-2.5 flex items-center justify-between gap-2 rounded-[8px] px-2.5 py-2"
                  style={{ backgroundColor: cd.canvas }}
                >
                  <span className="text-[11px]" style={{ color: cd.muted }}>
                    Can I take your name and number?
                  </span>
                  <span
                    className="shrink-0 rounded-[6px] px-2 py-1 text-[10.5px] font-semibold text-white"
                    style={{ backgroundColor: cd.accent }}
                  >
                    Share details
                  </span>
                </div>
              </div>
            </div>
          </div>
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
            pagesFound={undefined}
            onRetry={() => {
              setPhase('idle')
              setError(null)
            }}
            onTest={() => createdId && router.push(`/clients/${createdId}`)}
          />
        </div>
      </div>

      {/* Getting a client live, as five real tasks. The right rail describes
          what ChatDock does; this is what the operator does. */}
      <ol
        className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-[12px] px-4 py-3"
        style={{ backgroundColor: cd.surface }}
      >
        {CHECKLIST.map((item, i) => {
          // Step one completes when the client exists; everything after it
          // stays unreachable until then, so the list never invites a click
          // that would land nowhere.
          const done = i < completedSteps
          const active = i === completedSteps
          return (
          <li key={item} className="flex items-center gap-1">
            <span
              className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: done ? cd.successSoft : active ? cd.accent : cd.sunken,
                color: done ? cd.success : active ? '#fff' : cd.faint,
              }}
            >
              {done ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className="text-[12px]"
              style={{
                color: done ? cd.success : active ? cd.ink : cd.muted,
                fontWeight: active || done ? 600 : 400,
              }}
            >
              {item}
            </span>
            {i < CHECKLIST.length - 1 && (
              <span className="mx-1.5 text-[11px]" style={{ color: cd.line }} aria-hidden="true">
                ›
              </span>
            )}
          </li>
          )
        })}
      </ol>

      {/* Outcome cards — real interface fragments, no illustrations */}
      <p className="pt-1 text-[11.5px]" style={{ color: cd.faint }}>
        Example outcomes using demonstration data
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {OUTCOME_CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-[12px] p-4"
            style={{ backgroundColor: cd.surface }}
          >
            <h2 className="text-[13.5px] font-semibold" style={{ color: cd.ink }}>
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
