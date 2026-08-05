'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ConciergeBell,
  FileText,
  Gauge,
  Globe,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
} from 'lucide-react'

import { onGeneratePreviewContext } from '@/actions/landing'
import { LANDING_EVENTS, track } from '@/lib/analytics'

/**
 * The full-page demo.
 *
 * This used to be a card wedged into the homepage, which forced the chat into
 * roughly 460px with no room to show what was actually happening underneath.
 * On its own page there is space for the two things an agency owner needs to
 * see at once: the widget their client's visitors would get, and the workspace
 * readout they themselves would get.
 *
 * The right rail is measured, not decorated. Response time is timed, questions
 * are the ones actually asked, and the content figures come from the crawl
 * response — so nothing on this screen is a number we made up.
 */

type Role = 'user' | 'assistant'
type ChatMessage = { role: Role; content: string }
type Step = 'idle' | 'scraping' | 'ready'

type SiteData = {
  url: string
  title: string
  description: string
  context: string
  isFallback: boolean
}

const SUGGESTED_SITES = [
  { url: 'aspendental.com', label: 'Dental' },
  { url: 'rotorooter.com', label: 'Plumbing' },
  { url: 'morganandmorgan.com', label: 'Legal' },
]

const SUGGESTED_QUESTIONS = [
  'What services do you offer?',
  'How much does it cost?',
  'Can I book an appointment?',
  'What are your hours?',
]

const CRAWL_STAGES = ['Reading pages, services & pricing', 'Organizing what I found', 'Learning how to answer']

const FALLBACK_ERROR =
  'We could not read enough public content from this website. Try another URL, or create an account to upload documents the assistant can learn from.'

// Minimal markdown: **bold** and [label](url) become real elements, rest is text.
function renderContent(raw: string): React.ReactNode[] {
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

/**
 * Page titles are written for search results, not for sentences — "Aspen
 * Dental | Find a Dentist Near You for Dental Care" reads fine in a tab and
 * badly inside "Grounded in ___'s public pages". Cutting at the first
 * separator gets the brand back.
 */
const GENERIC_TITLES = /^(home|homepage|welcome|index|untitled|main|start)$/i

function shortName(title: string, fallback: string) {
  const head = title.split(/\s[|–—·:]\s|\s[|–—·]\s?|\|/)[0].trim()
  // morganandmorgan.com's title is the single word "Homepage", which would put
  // "I just read Homepage" in front of a visitor. A domain is never elegant but
  // it is always right, so anything uselessly generic falls back to it.
  if (GENERIC_TITLES.test(head)) return fallback
  return head.length >= 2 && head.length <= 40 ? head : fallback
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-[#E4E7EC] bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[12.5px] font-bold text-[#101828]">{title}</h2>
        {hint && <span className="shrink-0 text-[11px] text-[#667085]">{hint}</span>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function DemoSandbox({ initialUrl }: { initialUrl?: string }) {
  const router = useRouter()

  const [step, setStep] = useState<Step>('idle')
  const [urlInput, setUrlInput] = useState(initialUrl ?? '')
  const [crawlUrl, setCrawlUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [crawlProgress, setCrawlProgress] = useState(0)
  const [activeStage, setActiveStage] = useState(0)

  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  // Session measurements — every figure in the right rail comes from here.
  const [asked, setAsked] = useState<string[]>([])
  // The most recent time-to-first-token, not a running average: one cold start
  // would drag a mean down for the rest of the session and misrepresent what
  // the visitor is actually experiencing by their third question.
  const [lastLatency, setLastLatency] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, displayedText, isTyping])

  useEffect(() => () => {
    if (progressTimer.current) clearInterval(progressTimer.current)
  }, [])

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
    if (progressTimer.current) clearInterval(progressTimer.current)
    progressTimer.current = setInterval(() => {
      if (idx < ticks.length) {
        setCrawlProgress(ticks[idx].prg)
        setActiveStage(ticks[idx].stage)
        idx++
      } else if (progressTimer.current) {
        clearInterval(progressTimer.current)
      }
    }, 800)
  }

  const startCrawl = useCallback(
    async (rawUrl: string, source: 'input' | 'example' | 'link' = 'input') => {
      const target = rawUrl.trim()
      if (!target) return
      const domain = target.replace(/^https?:\/\//, '').replace(/\/.*$/, '')

      setErrorMessage('')
      setCrawlUrl(domain)
      setStep('scraping')
      setAsked([])
      setLastLatency(null)
      track(LANDING_EVENTS.demoUrlSubmitted, { source })
      runCrawlerProgress()

      try {
        const response = await onGeneratePreviewContext(target)
        await new Promise((r) => setTimeout(r, 1200))

        // `isFallback` means the crawl failed and the server substituted
        // generic placeholder copy — including invented pricing. Answering from
        // that would put fabricated facts about a real business in front of a
        // prospect, which is the one thing this page must never do. Treated as
        // a failure, not a degraded success.
        if (response.status === 200 && response.data && !response.data.isFallback) {
          setSiteData(response.data)
          setMessages([
            {
              role: 'assistant',
              content: `Done — I just read ${shortName(response.data.title, domain)} and I'm ready to answer the way its receptionist would. Ask me about services, pricing, hours, anything a visitor would want to know.`,
            },
          ])
          setStep('ready')
          track(LANDING_EVENTS.demoGenerated, { grounded: true })
        } else if (response.status === 200 && response.data?.isFallback) {
          setErrorMessage(
            `We couldn't read enough public content from ${domain} — some sites block automated readers. Try another URL, or create an account to upload documents the assistant can learn from.`
          )
          setStep('idle')
          track(LANDING_EVENTS.demoFailed, { reason: 'blocked' })
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
        if (progressTimer.current) clearInterval(progressTimer.current)
      }
    },
    []
  )

  // A URL arriving in the query string means the visitor already committed on
  // the homepage, so the crawl starts without making them press submit twice.
  const autoStarted = useRef(false)
  useEffect(() => {
    if (autoStarted.current || !initialUrl) return
    autoStarted.current = true
    startCrawl(initialUrl, 'link')
  }, [initialUrl, startCrawl])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const updated = [...messages, { role: 'user' as Role, content: trimmed }]
    if (messages.length === 1) track(LANDING_EVENTS.demoConversationStarted)
    setMessages(updated)
    setAsked((prev) => [...prev, trimmed])
    setInputVal('')
    setIsTyping(true)
    setDisplayedText('')

    const startedAt = performance.now()

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
      let firstToken = 0
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value, { stream: true }).split('\n\n')) {
          if (!line.startsWith('data: ')) continue
          const dataStr = line.slice(6).trim()
          if (dataStr === '[DONE]') continue
          try {
            const parsed = JSON.parse(dataStr)
            if (parsed.content) {
              if (!firstToken) firstToken = performance.now() - startedAt
              accumulated += parsed.content
              setDisplayedText(accumulated)
            }
          } catch (_) {}
        }
      }

      if (firstToken) setLastLatency(firstToken)
      setMessages([...updated, { role: 'assistant', content: accumulated }])
      setDisplayedText('')
      setIsTyping(false)
    } catch (err) {
      console.error('[Demo] Error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry — I hit a snag answering that. Please try again.' },
      ])
      setIsTyping(false)
    }
  }

  const reset = () => {
    setStep('idle')
    setMessages([])
    setSiteData(null)
    setUrlInput('')
    setCrawlUrl('')
    setErrorMessage('')
    setAsked([])
    setLastLatency(null)
    // The query string named a site that is no longer loaded, so clear it or a
    // refresh would silently re-crawl the old one.
    router.replace('/demo')
  }


  /* ───────────────────────── Entry / loading ───────────────────────── */

  if (step !== 'ready') {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5 py-16">
        <div className="w-full max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E7EC] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">
            <ConciergeBell className="h-3.5 w-3.5 text-[#5B5CE2]" /> Live demo
          </span>
          <h1 className="mt-5 font-heading text-[30px] font-extrabold leading-[1.12] tracking-tight text-[#101828] sm:text-[38px]">
            Point it at a website.
            <br />
            See what its receptionist would say.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[#667085]">
            ChatDock reads the public pages and answers from what it finds. Use your own site or a
            client&apos;s — no signup, no card, nothing to install.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              startCrawl(urlInput)
            }}
            className="mt-7 flex flex-col gap-2.5 sm:flex-row"
          >
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                autoFocus
                disabled={step === 'scraping'}
                aria-label="Website address to build an assistant from"
                placeholder="yourclient.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#E4E7EC] bg-white pl-11 pr-4 text-[15px] text-[#101828] placeholder:text-[#98A2B3] transition-shadow focus:outline-none focus:ring-4 focus:ring-[#5B5CE2]/15 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={step === 'scraping' || !urlInput.trim()}
              className="press inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5B5CE2] px-6 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#4A4BD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2 disabled:opacity-30"
            >
              {step === 'scraping' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Reading…
                </>
              ) : (
                <>
                  Build the assistant <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {step === 'idle' && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[12px] text-[#667085]">Or try one of these:</span>
              {SUGGESTED_SITES.map((site) => (
                <button
                  key={site.url}
                  type="button"
                  onClick={() => {
                    setUrlInput(site.url)
                    startCrawl(site.url, 'example')
                  }}
                  className="press rounded-full border border-[#E4E7EC] bg-white px-3 py-1.5 text-[12px] transition-colors hover:border-[#5B5CE2]/40"
                >
                  <span className="font-semibold text-[#344054]">{site.label}</span>
                  <span className="ml-1.5 text-[#8A94A6]">{site.url}</span>
                </button>
              ))}
            </div>
          )}

          {errorMessage && step === 'idle' && (
            <p className="mt-4 flex items-start gap-1.5 text-[13px] font-medium text-rose-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {errorMessage}
            </p>
          )}

          {step === 'scraping' && (
            <div className="mt-7 rounded-xl border border-[#E4E7EC] bg-white p-5">
              <p className="text-[13.5px] font-semibold text-[#101828]">
                Reading <span className="text-[#5B5CE2]">{crawlUrl}</span>…
              </p>
              <div className="mt-4 space-y-2.5">
                {CRAWL_STAGES.map((label, index) => {
                  const done = index < activeStage
                  const active = index === activeStage
                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-2 text-[13px] transition-opacity duration-300 ${
                        done || active ? 'text-[#344054] opacity-100' : 'text-[#667085] opacity-50'
                      }`}
                    >
                      {done ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : active ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#5B5CE2]" />
                      ) : (
                        <span className="grid h-4 w-4 shrink-0 place-items-center">
                          <span className="h-1 w-1 rounded-full bg-current" />
                        </span>
                      )}
                      {label}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]">
                <div
                  className="h-full rounded-full bg-[#5B5CE2] transition-all duration-700 ease-out"
                  style={{ width: `${crawlProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ───────────────────────── Live workspace ───────────────────────── */

  const words = siteData ? siteData.context.trim().split(/\s+/).length : 0
  const name = siteData ? shortName(siteData.title, crawlUrl) : crawlUrl

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
      <div className="grid items-start gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* ── The widget a visitor would see ── */}
        <div className="flex h-[calc(100vh-9rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_16px_48px_-28px_rgba(16,24,40,0.3)]">
          <div className="flex items-center gap-3 border-b border-black/[0.05] bg-[#0E1726] px-5 py-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white/[0.08] text-white ring-1 ring-inset ring-white/10">
              <ConciergeBell className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-white">{name}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live · trained seconds ago
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="press ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11.5px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" /> <span className="hidden sm:inline">Try another site</span>
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-3 pt-5">
            {messages.map((msg, index) => (
              <div key={index} className={`sandbox-msg flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-md bg-[#5B5CE2] text-white'
                      : 'rounded-bl-md border border-black/[0.06] bg-[#F7F8FA] text-[#2b3046]'
                  }`}
                >
                  {renderContent(msg.content)}
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
                    className="press rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[12px] transition-colors hover:border-[#5B5CE2]/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {isTyping && displayedText && (
              <div className="flex justify-start">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-black/[0.06] bg-[#F7F8FA] px-4 py-2.5 text-[13.5px] leading-relaxed text-[#2b3046]">
                  {renderContent(displayedText)}
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
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(inputVal)
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                disabled={isTyping}
                aria-label="Ask the assistant a question"
                placeholder="Ask anything about this website…"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="h-11 flex-1 rounded-xl bg-[#F7F8FA] px-4 text-[14px] text-[#0E1726] placeholder:text-[#667085] transition-shadow focus:outline-none focus:ring-4 focus:ring-[#5B5CE2]/15 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !inputVal.trim()}
                aria-label="Send"
                className="press grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#5B5CE2] text-white transition-colors hover:bg-[#4A4BD0] disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10.5px] text-[#98A2B3]">
              This is the exact widget your clients&apos; visitors get.
            </p>
          </div>
        </div>

        {/* ── What the agency sees behind it ── */}
        <div className="space-y-3">
          <Panel title="Workspace" hint="Created just now">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#5B5CE2] text-[12px] font-bold text-white">
                {(name[0] || 'A').toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#101828]">{name}</p>
                <p className="truncate text-[11.5px] text-[#667085]">{crawlUrl}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#0B6E51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A67A]" /> Live
              </span>
            </div>
          </Panel>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FileText, value: words.toLocaleString(), label: 'Words learned' },
              { icon: MessageSquare, value: asked.length, label: 'Questions asked' },
              {
                icon: Gauge,
                value: lastLatency === null ? '—' : `${(lastLatency / 1000).toFixed(1)}s`,
                label: 'Last reply time',
              },
            ].map((tile) => (
              <div key={tile.label} className="rounded-xl border border-[#E4E7EC] bg-white p-3.5">
                <tile.icon className="h-4 w-4 text-[#667085]" />
                <p className="mt-2.5 font-heading text-[22px] font-bold leading-none tracking-tight text-[#101828]">
                  {tile.value}
                </p>
                <p className="mt-1.5 text-[11px] leading-tight text-[#667085]">{tile.label}</p>
              </div>
            ))}
          </div>

          <Panel title="What it learned" hint="From public pages">
            <p className="text-[12.5px] leading-5 text-[#667085]">
              Every answer above is written from this content and nothing else. When the content
              doesn&apos;t cover a question, the assistant says so instead of guessing — that&apos;s the
              difference between a demo and something you can put on a client&apos;s site.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] px-3 py-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#0B6E51]" />
              <span className="text-[11.5px] font-medium text-[#344054]">
                Grounded in {name}&apos;s public pages
              </span>
            </div>
          </Panel>

          {asked.length > 0 && (
            <Panel title="Asked in this session" hint={`${asked.length} total`}>
              <ul className="space-y-1.5">
                {asked
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((q, i) => (
                    <li
                      key={`${q}-${i}`}
                      className="truncate rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] px-2.5 py-1.5 text-[12px] text-[#344054]"
                    >
                      {q}
                    </li>
                  ))}
              </ul>
              <p className="mt-3 text-[11.5px] leading-5 text-[#667085]">
                In a real workspace this list is the client&apos;s monthly report — what visitors asked,
                what converted, and which questions the site never answered.
              </p>
            </Panel>
          )}

          <div className="rounded-xl border border-[#5B5CE2]/25 bg-[#F5F5FE] p-4">
            <h2 className="font-heading text-[15px] font-bold tracking-tight text-[#101828]">
              Now put this on a client&apos;s site
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-5 text-[#475467]">
              Branded, capturing leads, booking appointments — and billed as a monthly service.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/auth/sign-up"
                className="press inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#5B5CE2] text-[13.5px] font-semibold text-white transition-colors hover:bg-[#4A4BD0]"
              >
                Start free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="https://cal.com/prathap-reddy-caxwn4/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white text-[13.5px] font-semibold text-[#101828] transition-colors hover:bg-black/[0.02]"
              >
                Book 15 minutes
              </a>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-1 text-[12.5px] font-medium text-[#667085] transition-colors hover:text-[#101828]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to chatdock.io
          </Link>
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
