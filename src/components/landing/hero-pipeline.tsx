'use client'

import * as React from 'react'
import {
  ArrowUp,
  CalendarCheck2,
  Check,
  FileText,
  Globe,
  Loader2,
  Phone,
  UserRound,
} from 'lucide-react'

/**
 * Hero product story.
 *
 * Teaches the whole product without narration, in one loop:
 *   URL entered → pages discovered → knowledge learned → branded assistant →
 *   visitor question → grounded answer → contact captured → appointment booked →
 *   agency dashboard ticks up.
 *
 * Implementation notes:
 * - Pure CSS transitions (compositor-only: opacity/transform) rather than a
 *   JS animation library, so the hero costs almost nothing on mobile.
 * - The stage is a fixed height at every breakpoint: the scenes cross-fade
 *   inside it, so the loop can never shift layout or push the CTAs around.
 * - prefers-reduced-motion jumps straight to the final frame and stops.
 */

/** Beat index → what the stage is showing. */
const BEAT = {
  URL: 0,
  CRAWLING: 1,
  LEARNED: 2,
  ASSISTANT: 3,
  QUESTION: 4,
  ANSWER: 5,
  CONTACT: 6,
  BOOKED: 7,
  DASHBOARD: 8,
} as const

type Beat = (typeof BEAT)[keyof typeof BEAT]

/** ms to hold each beat before advancing. Mobile shortens these (see below). */
const BEAT_MS: Record<Beat, number> = {
  [BEAT.URL]: 1900,
  [BEAT.CRAWLING]: 2100,
  [BEAT.LEARNED]: 1800,
  [BEAT.ASSISTANT]: 1200,
  [BEAT.QUESTION]: 1900,
  [BEAT.ANSWER]: 3400,
  [BEAT.CONTACT]: 2600,
  [BEAT.BOOKED]: 2200,
  [BEAT.DASHBOARD]: 4200,
}

const DEMO_URL = 'brightsmiledental.com'

const PAGES = [
  { path: '/services', label: 'Services' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/hours-location', label: 'Hours & location' },
  { path: '/new-patients', label: 'New patient FAQs' },
]

const KNOWLEDGE = ['Services', 'Hours', 'Pricing', 'FAQs', 'Insurance']

function useBeat() {
  const [beat, setBeat] = React.useState<Beat>(BEAT.URL)
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setReduced(true)
      setBeat(BEAT.DASHBOARD)
      return
    }

    // Mobile runs the same story ~30% faster so it resolves within a glance.
    const scale = window.matchMedia('(max-width: 640px)').matches ? 0.7 : 1
    let timer: ReturnType<typeof setTimeout>

    const advance = (current: Beat) => {
      timer = setTimeout(() => {
        const next = ((current + 1) % (BEAT.DASHBOARD + 1)) as Beat
        setBeat(next)
        advance(next)
      }, BEAT_MS[current] * scale)
    }

    advance(BEAT.URL)
    return () => clearTimeout(timer)
  }, [])

  return { beat, reduced }
}

/** Typed-in URL. Reveals characters proportionally to the beat's progress. */
function TypedUrl({ active, done }: { active: boolean; done: boolean }) {
  const [shown, setShown] = React.useState(0)

  React.useEffect(() => {
    if (done) {
      setShown(DEMO_URL.length)
      return
    }
    if (!active) {
      setShown(0)
      return
    }
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(i)
      if (i >= DEMO_URL.length) clearInterval(id)
    }, 55)
    return () => clearInterval(id)
  }, [active, done])

  return (
    <span className="font-medium text-[#101828]">
      {DEMO_URL.slice(0, shown)}
      {!done && shown < DEMO_URL.length && (
        <span className="ml-px inline-block h-[1.1em] w-px translate-y-[2px] animate-pulse bg-[#5B5CE2]" />
      )}
    </span>
  )
}

/** Scene 1 — the agency adds a client website and watches it get read. */
function IngestScene({ beat }: { beat: Beat }) {
  const crawling = beat >= BEAT.CRAWLING
  const learned = beat >= BEAT.LEARNED

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
        Add a client website
      </p>

      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-[#E4E7EC] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <Globe className="h-4 w-4 shrink-0 text-[#667085]" />
        <span className="min-w-0 flex-1 truncate text-sm">
          <TypedUrl active={beat === BEAT.URL} done={crawling} />
        </span>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white transition-colors duration-300 ${
            crawling ? 'bg-[#16A67A]' : 'bg-[#5B5CE2]'
          }`}
        >
          {crawling ? <Check className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 text-[11px] font-medium text-[#667085]">
        {learned ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#16A67A]" />4 pages read · 5 knowledge sources
          </>
        ) : (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5B5CE2]" />
            Reading public pages…
          </>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        {PAGES.map((page, i) => {
          const revealed = crawling
          return (
            <div
              key={page.path}
              className="flex items-center gap-2.5 rounded-lg border border-[#E4E7EC] bg-white px-3 py-2 transition-[opacity,transform] duration-300 ease-out-strong"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? 'none' : 'translateY(6px)',
                transitionDelay: `${i * 70}ms`,
              }}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-[#667085]" />
              <span className="min-w-0 flex-1 truncate text-[12px] text-[#344054]">{page.path}</span>
              <span className="hidden text-[11px] text-[#667085] sm:inline">{page.label}</span>
              <Check
                className="h-3.5 w-3.5 shrink-0 text-[#16A67A] transition-opacity duration-300"
                style={{ opacity: revealed ? 1 : 0, transitionDelay: `${i * 70 + 220}ms` }}
              />
            </div>
          )
        })}
      </div>

      {/* Not mt-auto. Pinning these to the bottom of a fixed-height stage while
          they are still invisible punches a hole through the middle of the card
          for the whole crawl. Flowing them under the page list keeps the empty
          space in one block at the bottom, which reads as "more is coming"
          rather than as something failing to load. */}
      <div className="flex flex-wrap gap-1.5 pt-4">
        {KNOWLEDGE.map((item, i) => (
          <span
            key={item}
            className="rounded-md border border-[#E4E7EC] bg-[#F7F8FA] px-2.5 py-1 text-[11px] font-medium text-[#344054] transition-[opacity,transform] duration-300 ease-out-strong"
            style={{
              opacity: learned ? 1 : 0,
              transform: learned ? 'none' : 'scale(0.94)',
              transitionDelay: `${i * 55}ms`,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * One chat row.
 *
 * Rendered only once its beat arrives. It used to stay mounted at `opacity: 0`
 * from the start, which meant four invisible rows held 285px of the 400px
 * stage open — so the first bubble was pinned near the top with a white void
 * underneath it for two seconds. Mounting on arrival lets the column grow
 * upward off `justify-end`, the way a real chat does.
 */
function Bubble({
  side,
  children,
}: {
  side: 'left' | 'right'
  children: React.ReactNode
}) {
  return (
    <div
      className={`hero-row max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
        side === 'right'
          ? 'self-end rounded-br-md bg-[#5B5CE2] text-white'
          : 'self-start rounded-bl-md border border-[#E4E7EC] bg-white text-[#344054]'
      }`}
      style={{ transformOrigin: side === 'right' ? 'bottom right' : 'bottom left' }}
    >
      {children}
    </div>
  )
}

/** Fills the beat between the visitor's question and the answer, so the pause
 *  reads as the assistant thinking rather than as nothing happening. */
function Typing() {
  return (
    <div className="hero-row flex w-fit items-center gap-1.5 self-start rounded-2xl rounded-bl-md border border-[#E4E7EC] bg-white px-3.5 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="hero-dot h-1.5 w-1.5 rounded-full bg-[#98A2B3]"
          style={{ animationDelay: `${i * 140}ms` }}
        />
      ))}
    </div>
  )
}

/** Scene 2 — the branded assistant works a real visitor to a booking. */
function AssistantScene({ beat }: { beat: Beat }) {
  return (
    <div className="flex h-full flex-col">
      {/* Client-branded header — the point is that it is *their* brand, not ours */}
      <div className="flex items-center gap-2.5 border-b border-[#E4E7EC] bg-[#0E1726] px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#5B5CE2] text-[11px] font-bold text-white">
          BS
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-white">Bright Smile Dental</p>
          <p className="flex items-center gap-1.5 text-[10px] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A67A]" />
            Answers 24/7
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden p-4">
        {/* The greeting lands with the scene, not with the first question.
            Without it this card sits completely blank for the whole ASSISTANT
            beat — a 400px white box as the most prominent thing on the page.
            A real widget opens with its welcome message, so showing one here is
            both truthful and the thing that fills the space. */}
        <Bubble side="left">Hi! I can help with treatments, pricing and booking.</Bubble>

        {beat >= BEAT.QUESTION && (
          <Bubble side="right">Do you offer teeth whitening on Saturdays?</Bubble>
        )}

        {beat === BEAT.QUESTION && <Typing />}

        {beat >= BEAT.ANSWER && (
          <Bubble side="left">
            Yes — in-office whitening is $199 and takes about 45 minutes. Saturday hours are 9:00 AM to
            2:00 PM.
            <span className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-[#667085]">
              <FileText className="h-3 w-3" />
              From /services · /hours-location
            </span>
          </Bubble>
        )}

        {beat >= BEAT.CONTACT && (
          <Bubble side="left">
            Happy to get you booked. What&apos;s your name and the best number to reach you?
          </Bubble>
        )}

        {beat >= BEAT.BOOKED && <Bubble side="right">Sarah Mitchell — (555) 014-2288</Bubble>}

        {beat >= BEAT.BOOKED && (
          <div
            className="hero-row flex items-center gap-2.5 rounded-xl border border-[#16A67A]/25 bg-[#ECFDF3] px-3 py-2.5"
            style={{ animationDelay: '220ms' }}
          >
            <CalendarCheck2 className="h-4 w-4 shrink-0 text-[#16A67A]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-semibold text-[#101828]">Appointment requested</span>
              <span className="block text-[11px] text-[#667085]">Saturday · 10:30 AM · Whitening</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/** The agency-side payoff: three counters that tick as the conversation lands. */
function DashboardStrip({ beat }: { beat: Beat }) {
  const rows: { icon: React.ElementType; label: string; at: Beat; tone: string }[] = [
    { icon: UserRound, label: 'New conversation', at: BEAT.QUESTION, tone: '#5B5CE2' },
    { icon: Phone, label: 'Qualified lead', at: BEAT.CONTACT, tone: '#5B5CE2' },
    { icon: CalendarCheck2, label: 'Appointment booked', at: BEAT.BOOKED, tone: '#16A67A' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#E4E7EC] bg-white p-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      {rows.map((row) => {
        const on = beat >= row.at
        return (
          <div
            key={row.label}
            className="flex flex-col gap-1.5 rounded-xl px-2.5 py-2.5 transition-colors duration-200"
            style={{ backgroundColor: on ? '#F7F8FA' : 'transparent' }}
          >
            <span className="flex items-center gap-1.5">
              <row.icon
                className="h-3.5 w-3.5 shrink-0 transition-colors duration-200"
                style={{ color: on ? row.tone : '#98A2B3' }}
              />
              <span
                className="text-[15px] font-bold tabular-nums transition-colors duration-200 sm:text-base"
                style={{ color: on ? '#101828' : '#667085' }}
              >
                {on ? '+1' : '—'}
              </span>
            </span>
            <span className="text-[10px] font-medium leading-tight text-[#667085]">{row.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function HeroPipeline() {
  const { beat, reduced } = useBeat()
  const showAssistant = beat >= BEAT.ASSISTANT

  const stages = ['Website read', 'Knowledge built', 'Assistant live', 'Lead captured']
  const stageIndex =
    beat >= BEAT.CONTACT ? 3 : beat >= BEAT.ASSISTANT ? 2 : beat >= BEAT.LEARNED ? 1 : 0

  return (
    <div className="w-full">
      {/* Progress rail — names each phase so the loop reads as a process, not decoration */}
      <div className="mb-3 flex items-center gap-1.5" aria-hidden="true">
        {stages.map((stage, i) => (
          <div key={stage} className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="h-[3px] overflow-hidden rounded-full bg-[#E4E7EC]">
              {/* scaleX, not width: width relayouts every frame, transform
                  stays on the compositor. */}
              <span
                className="block h-full w-full origin-left rounded-full bg-[#5B5CE2] transition-transform duration-500 ease-out-strong"
                style={{ transform: `scaleX(${i <= stageIndex ? 1 : 0})` }}
              />
            </span>
            <span
              className="truncate text-[9.5px] font-medium transition-colors duration-200 sm:text-[10px]"
              style={{ color: i <= stageIndex ? '#344054' : '#667085' }}
            >
              {stage}
            </span>
          </div>
        ))}
      </div>

      {/* Fixed-height stage: scenes cross-fade inside, so nothing below ever moves */}
      <div className="relative h-[386px] overflow-hidden rounded-2xl border border-[#E4E7EC] bg-[#F7F8FA] shadow-[0_8px_28px_-12px_rgba(16,24,40,0.16)] sm:h-[400px]">
        {/* The outgoing scene clears well before the incoming one arrives —
            a symmetrical cross-fade leaves both legible at once and reads as a
            rendering fault rather than a transition. */}
        {/* A true cross-fade: same window, no delay, both scenes blurring
            through the handover.

            The previous version sequenced them — outgoing cleared first, then
            the incoming started — to avoid two legible layouts stacked on each
            other. But ease-out-strong is ~87% done at its midpoint, so the
            outgoing scene was at 0.13 opacity while the incoming one was still
            waiting out its delay, and the card went visibly blank. Overlapping
            them keeps combined alpha near 1 the whole way across, and the blur
            is what buys permission to overlap: two sharp layouts on top of
            each other read as a rendering fault, two blurred ones read as one
            thing becoming another. */}
        <div
          className="absolute inset-0 transition-[opacity,filter] ease-out-strong"
          style={{
            opacity: showAssistant ? 0 : 1,
            filter: showAssistant ? 'blur(5px)' : 'blur(0px)',
            transitionDuration: '240ms',
            pointerEvents: showAssistant ? 'none' : 'auto',
          }}
        >
          <IngestScene beat={beat} />
        </div>
        <div
          className="absolute inset-0 bg-white transition-[opacity,filter] ease-out-strong"
          style={{
            opacity: showAssistant ? 1 : 0,
            filter: showAssistant ? 'blur(0px)' : 'blur(5px)',
            transitionDuration: '240ms',
            pointerEvents: showAssistant ? 'auto' : 'none',
          }}
        >
          <AssistantScene beat={beat} />
        </div>
      </div>

      <div className="mt-3">
        <DashboardStrip beat={beat} />
      </div>

      <p className="mt-2.5 text-center text-[11px] text-[#667085]">
        {reduced
          ? 'Product walkthrough · sample data'
          : 'What happens after you paste a client website · sample data'}
      </p>
    </div>
  )
}
