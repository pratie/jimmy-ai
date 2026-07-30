'use client'

import * as React from 'react'
import { CalendarCheck2, CheckCheck, Sparkles } from 'lucide-react'

type Step =
  | { kind: 'visitor'; text: string }
  | { kind: 'bot'; text: string }

const SCRIPT: Step[] = [
  { kind: 'visitor', text: 'How much is teeth whitening? Can I come in this week?' },
  {
    kind: 'bot',
    text: 'In-office whitening is $199 and takes about 45 minutes. We have Thursday openings at 10:00 AM or 2:30 PM — want me to hold one for you?',
  },
  { kind: 'visitor', text: '2:30 works! I’m Sarah — (555) 014-2288' },
  {
    kind: 'bot',
    text: 'You’re all set, Sarah — Thursday at 2:30 PM for whitening. A confirmation is on its way to your phone. 🎉',
  },
]

const STEP_DELAYS = [900, 1100, 2600, 1500, 2400] // ms before each step (index 0 = first message)
const TYPING_MS = 1000
const HOLD_MS = 4200

export default function HeroDemo() {
  const [step, setStep] = React.useState(0) // number of fully shown messages
  const [typing, setTyping] = React.useState(false)
  const [booked, setBooked] = React.useState(false)
  const [cycle, setCycle] = React.useState(0)
  const reduceMotion = React.useRef(false)

  React.useEffect(() => {
    reduceMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion.current) {
      setStep(SCRIPT.length)
      setBooked(true)
      return
    }

    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)))

    async function run() {
      setStep(0)
      setBooked(false)
      setTyping(false)

      for (let i = 0; i < SCRIPT.length; i++) {
        await wait(STEP_DELAYS[i] ?? 1200)
        if (cancelled) return
        if (SCRIPT[i].kind === 'bot') {
          setTyping(true)
          await wait(TYPING_MS)
          if (cancelled) return
          setTyping(false)
        }
        setStep(i + 1)
      }

      await wait(STEP_DELAYS[SCRIPT.length] ?? 1200)
      if (cancelled) return
      setBooked(true)

      await wait(HOLD_MS)
      if (cancelled) return
      setCycle((c) => c + 1)
    }

    run()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [cycle])

  return (
    <div className="relative mx-auto w-full max-w-[420px]" key={cycle} aria-hidden="true">
      {/* Soft glow behind the widget */}
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-primary/5 to-emerald-400/20 blur-2xl" />

      {/* Chat widget window */}
      <div className="relative overflow-hidden rounded-[1.6rem] border border-black/[0.07] bg-white shadow-[0_24px_70px_-20px_rgba(23,29,59,0.35)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-black/[0.05] bg-[#171d3b] px-5 py-4">
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-white">
            B
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#171d3b] bg-emerald-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Bright Smile Dental</p>
            <p className="text-[11px] text-white/50">Replies instantly · day and night</p>
          </div>
          <Sparkles className="ml-auto h-4 w-4 text-white/30" />
        </div>

        {/* Messages */}
        <div className="flex h-[330px] flex-col gap-3 overflow-hidden px-4 pb-4 pt-5 sm:h-[350px]">
          {SCRIPT.slice(0, step).map((message, index) => (
            <div
              key={index}
              className={`demo-msg max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                message.kind === 'visitor'
                  ? 'demo-msg-right self-end rounded-br-md bg-primary text-white'
                  : 'demo-msg-left self-start rounded-bl-md border border-black/[0.06] bg-[#f4f5fa] text-[#2b3046]'
              }`}
            >
              {message.text}
            </div>
          ))}

          {typing && (
            <div className="demo-msg demo-msg-left flex items-center gap-1.5 self-start rounded-2xl rounded-bl-md border border-black/[0.06] bg-[#f4f5fa] px-4 py-3">
              <span className="demo-dot h-1.5 w-1.5 rounded-full bg-[#9aa0b5]" />
              <span className="demo-dot h-1.5 w-1.5 rounded-full bg-[#9aa0b5]" style={{ animationDelay: '150ms' }} />
              <span className="demo-dot h-1.5 w-1.5 rounded-full bg-[#9aa0b5]" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Input mock */}
        <div className="border-t border-black/[0.05] px-4 py-3">
          <div className="flex h-10 items-center justify-between rounded-xl bg-[#f2f3f8] px-4 text-xs text-[#9aa0b5]">
            Write a message…
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 text-primary">↑</span>
          </div>
        </div>
      </div>

      {/* Floating "booked" card */}
      <div
        className={`absolute -bottom-6 right-2 w-56 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_18px_50px_-12px_rgba(23,29,59,0.3)] transition-all duration-500 ease-out-strong sm:-right-8 ${
          booked ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.96] opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CalendarCheck2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-[#171d3b]">Appointment booked</p>
            <p className="text-[11px] text-[#8a8fa5]">Thu · 2:30 PM · Whitening</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f6f7fb] px-3 py-2">
          <div>
            <p className="text-[11px] font-semibold text-[#2b3046]">Sarah M.</p>
            <p className="text-[10px] text-[#9aa0b5]">(555) 014-2288</p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <CheckCheck className="h-3.5 w-3.5" /> Lead saved
          </span>
        </div>
      </div>

      <style jsx>{`
        .demo-msg {
          animation: demo-in 480ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .demo-msg-left {
          transform-origin: bottom left;
        }
        .demo-msg-right {
          transform-origin: bottom right;
        }
        @keyframes demo-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .demo-dot {
          animation: demo-bounce 1.2s infinite ease-in-out;
        }
        @keyframes demo-bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .demo-msg {
            animation: none;
          }
          .demo-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
