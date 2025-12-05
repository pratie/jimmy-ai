'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Bot, User, Send } from 'lucide-react'

type Role = 'user' | 'assistant'
type Density = 'compact' | 'cozy'

interface ChatMessage {
  role: Role
  content: string
}

interface AnimatedChatHeroProps {
  messages?: ChatMessage[]
  typingMsPerChar?: number
  gapMs?: number
  responsiveHeight?: boolean
  density?: Density
  className?: string
  title?: string
}

const DEFAULT_SCRIPT: ChatMessage[] = [
  { role: 'assistant', content: 'Hi! 👋 How can I help you today?' },
  { role: 'user', content: "I have a question about my order." },
  { role: 'assistant', content: 'Of course! Let me check that for you... Your order #1234 shipped yesterday. ETA: Tomorrow by 5 PM.' },
  { role: 'user', content: 'Wow, that was fast! Thanks!' },
  { role: 'assistant', content: 'Anytime! Is there anything else I can help with? 😊' },
]

export default function AnimatedChatHero({
  messages,
  typingMsPerChar = 24,
  gapMs = 700,
  responsiveHeight = true,
  density = 'compact',
  className,
  title = 'ChatDock AI Assistant',
}: AnimatedChatHeroProps) {
  const script = messages && messages.length ? messages : DEFAULT_SCRIPT
  const [displayed, setDisplayed] = useState<ChatMessage[]>([])
  const [cursorText, setCursorText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const typingTimerRef = useRef<number | null>(null)
  const playingRef = useRef(true)

  const clearTimers = () => {
    if (typingTimerRef.current) window.clearInterval(typingTimerRef.current)
    typingTimerRef.current = null
  }

  // Pause when off-screen to save CPU
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting
        playingRef.current = !!visible
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    clearTimers()
    setDisplayed([])
    setCursorText('')
    setIsTyping(false)

    let cancelled = false

    const run = async () => {
      // helper wait that respects visibility
      const wait = (ms: number) =>
        new Promise<void>((resolve) => {
          let elapsed = 0
          const step = 50
          const tick = (): void => {
            if (cancelled) return resolve()
            if (!playingRef.current) {
              // pause without adding elapsed
              setTimeout(tick, step)
              return
            }
            elapsed += step
            if (elapsed >= ms) return resolve()
            setTimeout(tick, step)
          }
          setTimeout(tick, step)
        })

      for (let i = 0; i < script.length; i++) {
        if (cancelled) break
        await wait(i === 0 ? 350 : gapMs)
        const m = script[i]
        if (m.role === 'assistant') {
          setIsTyping(true)
          setCursorText('')
          await typeText(m.content, typingMsPerChar, setCursorText, typingTimerRef, () => cancelled || !playingRef.current)
          setDisplayed((prev) => [...prev, m])
          setCursorText('')
          setIsTyping(false)
        } else {
          setDisplayed((prev) => [...prev, m])
        }
      }

      // After finishing once, keep transcript visible
    }

    run()
    return () => {
      cancelled = true
      clearTimers()
    }
  }, [script, typingMsPerChar, gapMs])

  const heightClass = responsiveHeight ? 'h-[400px] md:h-[450px] lg:h-[520px]' : 'h-[500px]'
  const densityBubble = density === 'compact' ? 'text-[13px] px-3 py-2' : 'text-[15px] px-4 py-3'

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.5)] transition-shadow duration-300',
        heightClass,
        className
      )}
      style={{
        animation: 'fadeInUp 0.6s ease-out',
      }}
    >
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-950 dark:to-black rounded-t-2xl border-b border-gray-700/50">
        <div className="h-[60px] w-full flex items-center gap-3 px-5">
          <div className="h-10 w-10 rounded-full bg-main/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-main/40 overflow-hidden">
            <Image src="/images/logo.svg" alt="ChatDock AI" width={24} height={24} className="opacity-95" />
          </div>
          <div>
            <div className="text-white font-semibold text-[15px] leading-tight">{title}</div>
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.5)] animate-pulse" />
              <span>Online now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col h-[calc(100%-3.75rem)] bg-gray-50 dark:bg-gray-900">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 pr-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <Thread messages={displayed} densityBubble={densityBubble} />
          {isTyping && cursorText && (
            <div className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Avatar who="assistant" />
              <Bubble role="assistant" densityClass={densityBubble}>
                <span>{cursorText}</span>
                <span className="inline-block w-[2px] h-4 align-[-1px] bg-gray-400 ml-0.5 animate-pulse" />
              </Bubble>
            </div>
          )}
        </div>

        {/* Fake input bar */}
        <div className="p-5 pt-2">
          <div className="flex items-center gap-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 shadow-sm">
            <input
              aria-hidden
              readOnly
              placeholder="Type a reply..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <button aria-hidden className="h-8 w-8 rounded-full bg-black dark:bg-white flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
              <svg
                className="w-4 h-4 text-white dark:text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

function Avatar({ who }: { who: Role }) {
  if (who === 'assistant') {
    return (
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-main/10 shadow-sm grid place-items-center ring-1 ring-main/30 overflow-hidden">
        <Image
          src="/images/logo.svg"
          alt="ChatDock AI"
          width={20}
          height={20}
          className="opacity-90"
        />
      </div>
    )
  }
  return null // User messages don't show avatar in VanChat style
}

function Bubble({ role, children, densityClass }: { role: Role; children: React.ReactNode; densityClass?: string }) {
  const base = cn('max-w-[85%] rounded-2xl leading-relaxed', densityClass || 'text-[15px] px-4 py-3')
  if (role === 'user') {
    return (
      <div className={cn(base, 'ml-auto bg-gray-900 dark:bg-gray-800 text-white rounded-2xl shadow-sm')}>
        {children}
      </div>
    )
  }
  return (
    <div className={cn(base, 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl')}>
      {children}
    </div>
  )
}

function Thread({ messages, densityBubble }: { messages: ChatMessage[]; densityBubble?: string }) {
  return (
    <div className="space-y-3.5">
      {messages.map((m, i) => (
        <div
          key={i}
          className={cn('flex gap-2.5', m.role === 'user' ? 'justify-end' : 'justify-start items-start')}
          style={{
            animation: `fadeIn 0.4s ease-out ${i * 0.1}s both`,
          }}
        >
          {m.role === 'assistant' && <Avatar who="assistant" />}
          <Bubble role={m.role} densityClass={densityBubble}>
            {m.content}
          </Bubble>
        </div>
      ))}
    </div>
  )
}

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ')
}

function typeText(
  text: string,
  msPerChar: number,
  setText: (s: string) => void,
  timerRef: React.MutableRefObject<number | null>,
  shouldPause?: () => boolean
) {
  return new Promise<void>((resolve) => {
    let i = 0
    timerRef.current = window.setInterval(() => {
      if (shouldPause && shouldPause()) return // pause typing without advancing
      i++
      setText(text.slice(0, i))
      if (i >= text.length) {
        if (timerRef.current) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
        }
        resolve()
      }
    }, Math.max(6, msPerChar))
  })
}
