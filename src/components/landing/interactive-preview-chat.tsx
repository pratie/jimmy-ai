'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react'
import { onGeneratePreviewContext } from '@/actions/landing'

type Role = 'user' | 'assistant'

interface ChatMessage {
  role: Role
  content: string
}

type SandboxStep = 'idle' | 'scraping' | 'chatting' | 'cta'

const SUGGESTED_SITES = ['stripe.com', 'notion.so', 'airbnb.com']

const SUGGESTED_QUESTIONS = ['What do you offer?', 'How much does it cost?', 'How do I get in touch?']

const CRAWL_STAGES = [
  'Connecting to the website',
  'Reading pages, services & pricing',
  'Organizing what it found',
  'Teaching the assistant',
  'Ready — say hello',
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

export default function InteractivePreviewChat() {
  const [step, setStep] = useState<SandboxStep>('idle')
  const [urlInput, setUrlInput] = useState('')
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
      { prg: 18, stage: 0 },
      { prg: 34, stage: 1 },
      { prg: 52, stage: 1 },
      { prg: 68, stage: 2 },
      { prg: 84, stage: 3 },
      { prg: 94, stage: 3 },
      { prg: 100, stage: 4 },
    ]
    let idx = 0
    setCrawlProgress(0)
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
    }, 750)
    return () => clearInterval(timer)
  }

  const handleStartCrawl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput || urlInput.trim().length === 0) return

    setStep('scraping')
    const cleanupProgress = runCrawlerProgress()

    try {
      const response = await onGeneratePreviewContext(urlInput)
      await new Promise((r) => setTimeout(r, 1400))

      if (response.status === 200 && response.data) {
        setSiteData(response.data)
        setMessages([
          {
            role: 'assistant',
            content: `Hi! 👋 I just read ${response.data.title} and I'm ready to answer questions about it — services, pricing, hours, anything a visitor would ask.`,
          },
        ])
        setStep('chatting')
      } else {
        setErrorMessage(response.message || 'We could not read that website. Try another one?')
        setStep('idle')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while reading the site.')
      setStep('idle')
    } finally {
      cleanupProgress()
    }
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const userMessage: ChatMessage = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]
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
    setErrorMessage('')
  }

  const headerTitle =
    step === 'idle'
      ? 'Your future assistant'
      : step === 'scraping'
        ? 'Building the assistant…'
        : siteData?.title || 'Assistant'

  const headerAvatar = step === 'chatting' || step === 'cta' ? (siteData?.title?.[0] || 'A').toUpperCase() : null

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Soft glow, same language as the hero widget */}
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-emerald-400/15 blur-2xl" />

      <div className="relative overflow-hidden rounded-[1.6rem] border border-black/[0.07] bg-white shadow-[0_40px_100px_-30px_rgba(23,29,59,0.4)]">
        {/* Header — matches the hero demo widget */}
        <div className="flex items-center gap-3 border-b border-black/[0.05] bg-[#171d3b] px-5 py-4">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#7677f4] text-sm font-bold text-white">
            {step === 'scraping' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : headerAvatar ? (
              headerAvatar
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#171d3b] ${
                step === 'scraping' ? 'animate-pulse bg-amber-400' : 'bg-emerald-400'
              }`}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{headerTitle}</p>
            <p className="text-[11px] text-white/50">
              {step === 'idle' && 'Live demo · no signup needed'}
              {step === 'scraping' && 'Reading the website…'}
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
          {/* ── Idle: invite ── */}
          {step === 'idle' && (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef0ff] text-[#5f60d8]">
                <Globe className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold tracking-tight text-[#171d3b] sm:text-2xl">
                Type a website. Watch it become an assistant.
              </h3>
              <p className="mx-auto mt-2.5 max-w-sm text-sm leading-6 text-[#5a6072]">
                Yours, a client&apos;s, anyone&apos;s. In about 30 seconds you&apos;ll be talking to an assistant that
                learned it — the exact thing your clients&apos; visitors get.
              </p>

              <form onSubmit={handleStartCrawl} className="mt-7 flex w-full max-w-md gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa0b5]" />
                  <input
                    type="text"
                    placeholder="yourclient.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#fafafc] pl-11 pr-4 text-sm text-[#171d3b] placeholder:text-[#b3b8c9] transition-shadow focus:border-[#7677f4] focus:outline-none focus:ring-4 focus:ring-[#7677f4]/15"
                  />
                </div>
                <button
                  type="submit"
                  className="press inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#7677f4] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(118,119,244,0.7)] transition-colors hover:bg-[#696ae6]"
                >
                  Build it <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {errorMessage && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-500">
                  <AlertCircle className="h-3.5 w-3.5" /> {errorMessage}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-[#9aa0b5]">Try:</span>
                {SUGGESTED_SITES.map((site) => (
                  <button
                    key={site}
                    type="button"
                    onClick={() => setUrlInput(site)}
                    className="press rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#5a6072] transition-colors hover:border-[#7677f4]/40 hover:text-[#5f60d8]"
                  >
                    {site}
                  </button>
                ))}
              </div>

              <p className="mt-6 text-[11px] text-[#b3b8c9]">Free · No signup · Takes about 30 seconds</p>
            </div>
          )}

          {/* ── Scraping: friendly progress ── */}
          {step === 'scraping' && (
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <div className="w-full max-w-sm">
                <p className="text-center text-sm font-semibold text-[#171d3b]">
                  Reading <span className="text-[#5f60d8]">{urlInput.replace(/^https?:\/\//, '')}</span>
                </p>
                <div className="mt-7 space-y-3.5">
                  {CRAWL_STAGES.map((label, index) => {
                    const done = index < activeStage
                    const active = index === activeStage
                    return (
                      <div
                        key={label}
                        className={`flex items-center gap-3 transition-opacity duration-300 ${
                          done || active ? 'opacity-100' : 'opacity-35'
                        }`}
                      >
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                            done
                              ? 'bg-emerald-100 text-emerald-600'
                              : active
                                ? 'bg-[#eef0ff] text-[#5f60d8]'
                                : 'bg-black/[0.04] text-[#b3b8c9]'
                          }`}
                        >
                          {done ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : active ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          )}
                        </span>
                        <span className={`text-sm ${done || active ? 'font-medium text-[#171d3b]' : 'text-[#9aa0b5]'}`}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
                  <div
                    className="h-full rounded-full bg-[#7677f4] transition-all duration-700 ease-out-strong"
                    style={{ width: `${crawlProgress}%` }}
                  />
                </div>
              </div>
            </div>
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
                          ? 'rounded-br-md bg-[#7677f4] text-white'
                          : 'rounded-bl-md border border-black/[0.06] bg-[#f4f5fa] text-[#2b3046]'
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
                        onClick={() => sendMessage(q)}
                        className="press rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#5a6072] shadow-sm transition-colors hover:border-[#7677f4]/40 hover:text-[#5f60d8]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {isTyping && displayedText && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-black/[0.06] bg-[#f4f5fa] px-4 py-2.5 text-[13px] leading-relaxed text-[#2b3046]">
                      {renderSandboxContent(displayedText)}
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-[#7677f4] align-middle" />
                    </div>
                  </div>
                )}

                {isTyping && !displayedText && (
                  <div className="sandbox-msg flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-black/[0.06] bg-[#f4f5fa] px-4 py-3">
                      <span className="sandbox-dot h-1.5 w-1.5 rounded-full bg-[#9aa0b5]" />
                      <span className="sandbox-dot h-1.5 w-1.5 rounded-full bg-[#9aa0b5]" style={{ animationDelay: '150ms' }} />
                      <span className="sandbox-dot h-1.5 w-1.5 rounded-full bg-[#9aa0b5]" style={{ animationDelay: '300ms' }} />
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
                    className="h-11 flex-1 rounded-xl bg-[#f2f3f8] px-4 text-sm text-[#171d3b] placeholder:text-[#9aa0b5] transition-shadow focus:outline-none focus:ring-4 focus:ring-[#7677f4]/15 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !inputVal.trim()}
                    aria-label="Send"
                    className="press grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#7677f4] text-white transition-colors hover:bg-[#696ae6] disabled:opacity-30"
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
              <h3 className="mt-5 font-heading text-xl font-bold tracking-tight text-[#171d3b] sm:text-2xl">
                Now imagine this on a client&apos;s website
              </h3>
              <p className="mx-auto mt-2.5 max-w-sm text-sm leading-6 text-[#5a6072]">
                Everything it just said came from <strong>{siteData?.title}</strong>&apos;s real content. Launch the
                same assistant — branded, qualifying leads, booking appointments — in an afternoon.
              </p>
              <div className="mt-7 flex w-full max-w-sm flex-col justify-center gap-2.5 sm:flex-row">
                <a
                  href="/auth/sign-up"
                  className="press inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7677f4] text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(118,119,244,0.7)] transition-colors hover:bg-[#696ae6]"
                >
                  Start free <Sparkles className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://cal.com/prathap-reddy-caxwn4/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-black/[0.1] bg-white text-sm font-semibold text-[#171d3b] transition-colors hover:bg-black/[0.03]"
                >
                  Book a demo
                </a>
              </div>
              <button
                type="button"
                onClick={() => setStep('chatting')}
                className="mt-5 text-xs font-semibold text-[#9aa0b5] transition-colors hover:text-[#5a6072]"
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
