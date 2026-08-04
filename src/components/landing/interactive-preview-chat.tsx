'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  AlertCircle,
  ArrowUp,
  Check,
  CheckCircle2,
  Globe,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react'
import { onGeneratePreviewContext } from '@/actions/landing'
import { LANDING_EVENTS, track } from '@/lib/analytics'

type Role = 'user' | 'assistant'

interface ChatMessage {
  role: Role
  content: string
}

type SandboxStep = 'idle' | 'scraping' | 'chatting' | 'cta'

/**
 * Examples deliberately match the ICP's client roster — a dental group, a home-
 * services company and a law firm — rather than Stripe/Notion/Airbnb, which
 * demo well and sell nothing to an agency running local-business websites.
 */
const SUGGESTED_SITES: { url: string; label: string }[] = [
  { url: 'aspendental.com', label: 'Dental clinic' },
  { url: 'arsrescuerooter.com', label: 'HVAC company' },
  { url: 'morganandmorgan.com', label: 'Law firm' },
]

const SUGGESTED_QUESTIONS = [
  'What services do you offer?',
  'How much does it cost?',
  'Can I book an appointment?',
]

const CRAWL_STAGES = [
  'Reading pages, services & pricing',
  'Organizing what I found',
  'Learning how to answer',
]

// Minimal markdown: **bold** and [label](url) → real elements, rest is text.
function renderSandboxContent(raw: string): React.ReactNode[] {
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  const nodes: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(raw)) !== null) {
    if (match.index > last) nodes.push(raw.slice(last, match.index))
    if (match[1]) {
      nodes.push(<strong key={match.index}>{match[1]}</strong>)
    } else {
      nodes.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2 hover:opacity-80"
        >
          {match[2]}
        </a>
      )
    }
    last = pattern.lastIndex
  }
  if (last < raw.length) nodes.push(raw.slice(last))
  return nodes
}

/** Faded skeleton bubbles — reads as earlier conversations, fills the frame
 *  with the product's own shape instead of empty whitespace. */
function GhostConversation() {
  const rows: { side: 'left' | 'right'; widths: number[] }[] = [
    { side: 'left', widths: [150, 190] },
    { side: 'right', widths: [110] },
    { side: 'left', widths: [200, 140, 90] },
    { side: 'right', widths: [150, 80] },
  ]
  return (
    <div aria-hidden="true" className="space-y-3 [mask-image:linear-gradient(to_bottom,transparent,black_80%)]">
      {rows.map((row, index) => (
        <div key={index} className={`flex ${row.side === 'right' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`space-y-2 rounded-2xl px-4 py-3 ${
              row.side === 'right' ? 'rounded-br-md bg-[#5B5CE2]/10' : 'rounded-bl-md bg-[#F7F8FA]'
            }`}
          >
            {row.widths.map((width, i) => (
              <div
                key={i}
                className={`h-2 rounded-full ${row.side === 'right' ? 'bg-[#5B5CE2]/25' : 'bg-[#0E1726]/10'}`}
                style={{ width }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function InteractivePreviewChat() {
  const [step, setStep] = useState<SandboxStep>('idle')
  const [urlInput, setUrlInput] = useState('')
  const [crawlUrl, setCrawlUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Crawl progress
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [activeStage, setActiveStage] = useState(0)

  // Scraped site data
  const [siteData, setSiteData] = useState<{
    url: string
    title: string
    description: string
    context: string
    isFallback: boolean
  } | null>(null)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, displayedText, isTyping])

  const runCrawlerProgress = () => {
    const ticks = [
      { prg: 22, stage: 0 },
      { prg: 42, stage: 0 },
      { prg: 58, stage: 1 },
      { prg: 74, stage: 1 },
      { prg: 88, stage: 2 },
      { prg: 100, stage: 2 },
    ]
    let idx = 0
    setCrawlProgress(8)
    setActiveStage(0)
    setErrorMessage('')
    const timer = setInterval(() => {
      if (idx < ticks.length) {
        setCrawlProgress(ticks[idx].prg)
        setActiveStage(ticks[idx].stage)
        idx++
      } else {
        clearInterval(timer)
      }
    }, 800)
    return () => clearInterval(timer)
  }

  /**
   * A failure here has to say what went wrong and what to do next — an
   * indefinite spinner or a bare "something went wrong" is the fastest way to
   * lose a visitor who was one click from understanding the product.
   */
  const FALLBACK_ERROR =
    'We could not read enough public content from this website. Try another URL, or create an account to upload documents the assistant can learn from.'

  const startCrawl = async (rawUrl: string, source: 'input' | 'example' = 'input') => {
    const target = rawUrl.trim()
    if (!target || step === 'scraping') return

    setErrorMessage('')
    setCrawlUrl(target.replace(/^https?:\/\//, ''))
    setStep('scraping')
    track(LANDING_EVENTS.demoUrlSubmitted, { source })
    const cleanupProgress = runCrawlerProgress()

    try {
      const response = await onGeneratePreviewContext(target)
      await new Promise((r) => setTimeout(r, 1600))

      if (response.status === 200 && response.data) {
        setSiteData(response.data)
        setMessages([
          {
            role: 'assistant',
            content: `Done! I just read ${response.data.title} and I'm ready to answer like its receptionist would — services, pricing, hours, anything a visitor asks.`,
          },
        ])
        setStep('chatting')
        track(LANDING_EVENTS.demoGenerated, { grounded: !response.data.isFallback })
      } else {
        setErrorMessage(response.message || FALLBACK_ERROR)
        setStep('idle')
        track(LANDING_EVENTS.demoFailed, { reason: 'no_content' })
      }
    } catch (err: any) {
      setErrorMessage(FALLBACK_ERROR)
      setStep('idle')
      track(LANDING_EVENTS.demoFailed, { reason: err?.message ? 'exception' : 'unknown' })
    } finally {
      cleanupProgress()
    }
  }

  const handleStartCrawl = (e: React.FormEvent) => {
    e.preventDefault()
    startCrawl(urlInput)
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const userMessage: ChatMessage = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]
    // messages[0] is the assistant's greeting, so length 1 means this is the
    // visitor's very first turn.
    if (messages.length === 1) track(LANDING_EVENTS.demoConversationStarted)
    setMessages(updatedMessages)
    setInputVal('')
    setIsTyping(true)
    setDisplayedText('')

    try {
      const response = await fetch('/api/bot/preview/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          chat: messages,
          context: siteData?.context || '',
          title: siteData?.title || 'your website',
        }),
      })

      if (!response.ok) throw new Error('Failed to generate response stream')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('ReadableStream not supported')

      let accumulated = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n\n')) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            if (dataStr === '[DONE]') continue
            try {
              const parsed = JSON.parse(dataStr)
              if (parsed.content) {
                accumulated += parsed.content
                setDisplayedText(accumulated)
              }
            } catch (_) {}
          }
        }
      }

      const finalMessages = [...updatedMessages, { role: 'assistant' as Role, content: accumulated }]
      setMessages(finalMessages)
      setDisplayedText('')
      setIsTyping(false)

      if (finalMessages.length >= 6) {
        await new Promise((r) => setTimeout(r, 1500))
        setStep('cta')
      }
    } catch (err) {
      console.error('[Sandbox Chat] Error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry — I hit a snag answering that. Please try again.' },
      ])
      setIsTyping(false)
    }
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputVal)
  }

  const reset = () => {
    setStep('idle')
    setMessages([])
    setSiteData(null)
    setUrlInput('')
    setCrawlUrl('')
    setErrorMessage('')
  }

  const headerTitle =
    step === 'idle'
      ? 'Your future assistant'
      : step === 'scraping'
        ? crawlUrl
        : siteData?.title || 'Assistant'

  const headerAvatar = step === 'chatting' || step === 'cta' ? (siteData?.title?.[0] || 'A').toUpperCase() : null

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_16px_48px_-24px_rgba(16,24,40,0.28)]">
        {/* Header — matches the hero demo widget */}
        <div className="flex items-center gap-3 border-b border-black/[0.05] bg-[#0E1726] px-5 py-4">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#5B5CE2] text-sm font-bold text-white">
            {step === 'scraping' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : headerAvatar ? (
              headerAvatar
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0E1726] ${
                step === 'scraping' ? 'animate-pulse bg-amber-400' : 'bg-emerald-400'
              }`}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{headerTitle}</p>
            <p className="text-[11px] text-white/50">
              {step === 'idle' && 'Waiting for a website · no signup needed'}
              {step === 'scraping' && 'Learning the website…'}
              {(step === 'chatting' || step === 'cta') && 'Live · trained seconds ago'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {(step === 'chatting' || step === 'cta') && (
              <button
                type="button"
                onClick={reset}
                className="press inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" /> Try another site
              </button>
            )}
            <span className="hidden rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60 sm:block">
              Live demo
            </span>
          </div>
        </div>

        {/* Stage area */}
        <div className="flex h-[460px] flex-col sm:h-[480px]">
          {/* ── Idle & scraping: the widget itself invites you ── */}
          {(step === 'idle' || step === 'scraping') && (
            <>
              <div className="flex flex-1 flex-col justify-end overflow-hidden px-4 pb-4 pt-5">
                <GhostConversation />

                {step === 'idle' && (
                  <div className="sandbox-msg mt-4 flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-black/[0.06] bg-[#F7F8FA] px-4 py-3 text-[13px] leading-relaxed text-[#2b3046]">
                      Hi! Give me any website — yours or a client&apos;s — and in about 30 seconds I&apos;ll answer
                      questions the way its receptionist would. <span className="font-semibold">Type it below.</span>
                    </div>
                  </div>
                )}

                {step === 'scraping' && (
                  <div className="sandbox-msg mt-4 flex justify-start">
                    <div className="w-[85%] max-w-[320px] rounded-2xl rounded-bl-md border border-black/[0.06] bg-[#F7F8FA] px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-[#0E1726]">
                        Reading <span className="text-[#5B5CE2]">{crawlUrl}</span>…
                      </p>
                      <div className="mt-3 space-y-2">
                        {CRAWL_STAGES.map((label, index) => {
                          const done = index < activeStage
                          const active = index === activeStage
                          return (
                            <div
                              key={label}
                              className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${
                                done || active ? 'text-[#3c4257] opacity-100' : 'text-[#667085] opacity-50'
                              }`}
                            >
                              {done ? (
                                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                              ) : active ? (
                                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#5B5CE2]" />
                              ) : (
                                <span className="grid h-3.5 w-3.5 shrink-0 place-items-center">
                                  <span className="h-1 w-1 rounded-full bg-current" />
                                </span>
                              )}
                              {label}
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-black/[0.06]">
                        <div
                          className="h-full rounded-full bg-[#5B5CE2] transition-all duration-700 ease-out-strong"
                          style={{ width: `${crawlProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 'idle' && (
                  <div className="sandbox-msg mt-3 flex flex-wrap items-center gap-2 pl-1">
                    <span className="text-[11px] text-[#667085]">Or try one of these:</span>
                    {SUGGESTED_SITES.map((site) => (
                      <button
                        key={site.url}
                        type="button"
                        onClick={() => startCrawl(site.url, 'example')}
                        className="press rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#667085] shadow-sm transition-colors hover:border-[#5B5CE2]/40 hover:text-[#5B5CE2]"
                      >
                        {site.label}
                        <span className="ml-1.5 text-[#667085]">{site.url}</span>
                      </button>
                    ))}
                  </div>
                )}

                {errorMessage && step === 'idle' && (
                  <p className="mt-3 flex items-center gap-1.5 pl-1 text-xs font-medium text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errorMessage}
                  </p>
                )}
              </div>

              {/* The chat input doubles as the URL bar */}
              <div className="border-t border-black/[0.05] px-4 py-3">
                <form onSubmit={handleStartCrawl} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                    <input
                      type="text"
                      disabled={step === 'scraping'}
                      placeholder={step === 'scraping' ? `Reading ${crawlUrl}…` : 'Type a website — e.g. yourclient.com'}
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="h-11 w-full rounded-xl bg-[#F7F8FA] pl-11 pr-4 text-sm text-[#0E1726] placeholder:text-[#667085] transition-shadow focus:outline-none focus:ring-4 focus:ring-[#5B5CE2]/15 disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={step === 'scraping' || !urlInput.trim()}
                    className="press inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#5B5CE2] px-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#4A4BD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2 disabled:opacity-30 sm:px-4"
                  >
                    {step === 'scraping' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Reading…</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Create the assistant</span>
                        <ArrowUp className="h-4 w-4 sm:hidden" />
                      </>
                    )}
                  </button>
                </form>
                <p className="mt-2 text-center text-[10.5px] text-[#667085]">
                  No signup · no card · this is the exact widget your clients&apos; visitors get
                </p>
              </div>
            </>
          )}

          {/* ── Chatting ── */}
          {(step === 'chatting' || step === 'cta') && (
            <>
              {siteData?.isFallback && (
                <div className="flex items-center gap-1.5 border-b border-amber-100 bg-amber-50 px-4 py-2 text-[11px] font-medium text-amber-700">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  We could only partially read this site, so answers may be lighter than usual.
                </div>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-3 pt-5">
                {messages.map((msg, index) => (
                  <div key={index} className={`sandbox-msg flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'rounded-br-md bg-[#5B5CE2] text-white'
                          : 'rounded-bl-md border border-black/[0.06] bg-[#F7F8FA] text-[#2b3046]'
                      }`}
                    >
                      {renderSandboxContent(msg.content)}
                    </div>
                  </div>
                ))}

                {messages.length === 1 && !isTyping && (
                  <div className="sandbox-msg flex flex-wrap gap-2 pt-1">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          track(LANDING_EVENTS.demoSuggestedQuestionClicked, { question: q })
                          sendMessage(q)
                        }}
                        className="press rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#667085] shadow-sm transition-colors hover:border-[#5B5CE2]/40 hover:text-[#5B5CE2]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {isTyping && displayedText && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-black/[0.06] bg-[#F7F8FA] px-4 py-2.5 text-[13px] leading-relaxed text-[#2b3046]">
                      {renderSandboxContent(displayedText)}
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-[#5B5CE2] align-middle" />
                    </div>
                  </div>
                )}

                {isTyping && !displayedText && (
                  <div className="sandbox-msg flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-black/[0.06] bg-[#F7F8FA] px-4 py-3">
                      <span className="sandbox-dot h-1.5 w-1.5 rounded-full bg-[#98A2B3]" />
                      <span className="sandbox-dot h-1.5 w-1.5 rounded-full bg-[#98A2B3]" style={{ animationDelay: '150ms' }} />
                      <span className="sandbox-dot h-1.5 w-1.5 rounded-full bg-[#98A2B3]" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-black/[0.05] px-4 py-3">
                <form onSubmit={handleSendChat} className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={isTyping}
                    placeholder="Ask anything about this website…"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="h-11 flex-1 rounded-xl bg-[#F7F8FA] px-4 text-sm text-[#0E1726] placeholder:text-[#667085] transition-shadow focus:outline-none focus:ring-4 focus:ring-[#5B5CE2]/15 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !inputVal.trim()}
                    aria-label="Send"
                    className="press grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#5B5CE2] text-white transition-colors hover:bg-[#696ae6] disabled:opacity-30"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-2 text-center text-[10px] text-[#b3b8c9]">
                  Live AI — answers come from {siteData?.title || 'the website'}&apos;s actual content
                </p>
              </div>
            </>
          )}

          {/* ── CTA overlay ── */}
          {step === 'cta' && (
            <div className="sandbox-msg absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 px-8 text-center backdrop-blur-md">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold tracking-tight text-[#0E1726] sm:text-2xl">
                Now imagine this on a client&apos;s website
              </h3>
              <p className="mx-auto mt-2.5 max-w-sm text-sm leading-6 text-[#667085]">
                Everything it just said came from <strong>{siteData?.title}</strong>&apos;s real content. Launch the
                same assistant — branded, qualifying leads, booking appointments — in an afternoon.
              </p>
              <div className="mt-7 flex w-full max-w-sm flex-col justify-center gap-2.5 sm:flex-row">
                <a
                  href="/auth/sign-up"
                  className="press inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#5B5CE2] text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(118,119,244,0.7)] transition-colors hover:bg-[#696ae6]"
                >
                  Start free <Sparkles className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://cal.com/prathap-reddy-caxwn4/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-black/[0.1] bg-white text-sm font-semibold text-[#0E1726] transition-colors hover:bg-black/[0.03]"
                >
                  Book a demo
                </a>
              </div>
              <button
                type="button"
                onClick={() => setStep('chatting')}
                className="mt-5 text-xs font-semibold text-[#667085] transition-colors hover:text-[#667085]"
              >
                Keep chatting instead
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sandbox-msg {
          animation: sandbox-in 420ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        @keyframes sandbox-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .sandbox-dot {
          animation: sandbox-bounce 1.2s infinite ease-in-out;
        }
        @keyframes sandbox-bounce {
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
          .sandbox-msg,
          .sandbox-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
