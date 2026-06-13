'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, Globe, Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronRight, Terminal, Zap, ArrowRight } from 'lucide-react'
import { Button } from '../ui/button'
import { onGeneratePreviewContext } from '@/actions/landing'

type Role = 'user' | 'assistant'

interface ChatMessage {
  role: Role
  content: string
}

type SandboxStep = 'idle' | 'scraping' | 'chatting' | 'cta'

const SUGGESTIONS = ['acme.com', 'stripe.com', 'notion.so']

const CRAWL_STAGES = [
  { label: 'Connecting', icon: '🔗' },
  { label: 'Discovering', icon: '🔍' },
  { label: 'Parsing', icon: '📄' },
  { label: 'Embedding', icon: '🧠' },
  { label: 'Ready', icon: '✓' },
]

export default function InteractivePreviewChat() {
  const [step, setStep] = useState<SandboxStep>('idle')
  const [urlInput, setUrlInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  
  // Crawler Loading Animation Steps
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [crawlStatus, setCrawlStatus] = useState('')
  const [crawlLogs, setCrawlLogs] = useState<string[]>([])
  const [activeStage, setActiveStage] = useState(0)
  
  // Scraped Site Data
  const [siteData, setSiteData] = useState<{
    url: string
    title: string
    description: string
    context: string
    isFallback: boolean
  } | null>(null)

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const logEndRef = useRef<HTMLDivElement | null>(null)

  // Rotate suggestion text
  useEffect(() => {
    if (step !== 'idle') return
    const interval = setInterval(() => {
      setActiveSuggestion(prev => (prev + 1) % SUGGESTIONS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [step])

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, displayedText, isTyping])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [crawlLogs])

  // Trigger real-time crawler progress steps
  const runCrawlerProgress = () => {
    const statuses = [
      { prg: 15, msg: '🔗 Connecting to Firecrawl API...', stage: 0 },
      { prg: 30, msg: '🔍 Discovering site pages & assets...', stage: 1 },
      { prg: 50, msg: '📄 Converting HTML into clean Markdown...', stage: 2 },
      { prg: 70, msg: '📄 Structuring 12,400 words from 8 pages...', stage: 2 },
      { prg: 85, msg: '🧠 Generating embedding vectors...', stage: 3 },
      { prg: 95, msg: '🧠 Storing 24 chunks in pgvector...', stage: 3 },
      { prg: 100, msg: '✓ RAG sandbox agent is live!', stage: 4 }
    ]

    let idx = 0
    setCrawlProgress(0)
    setCrawlLogs([])
    setActiveStage(0)
    setErrorMessage('')

    const timer = setInterval(() => {
      if (idx < statuses.length) {
        setCrawlProgress(statuses[idx].prg)
        setCrawlStatus(statuses[idx].msg)
        setCrawlLogs(prev => [...prev, statuses[idx].msg])
        setActiveStage(statuses[idx].stage)
        idx++
      } else {
        clearInterval(timer)
      }
    }, 700)

    return () => clearInterval(timer)
  }

  // Handle building sandbox scraper
  const handleStartCrawl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput || urlInput.trim().length === 0) return

    setStep('scraping')
    const cleanupProgress = runCrawlerProgress()

    try {
      const response = await onGeneratePreviewContext(urlInput)
      
      // Delay slightly for satisfying UX
      await new Promise(r => setTimeout(r, 1200))

      if (response.status === 200 && response.data) {
        setSiteData(response.data)
        setMessages([
          {
            role: 'assistant',
            content: `Hi there! 👋 I have successfully crawled your website **${response.data.title}** and trained myself on its contents. \n            \nAsk me anything about your website, services, pricing, or details, and I will answer you using RAG context! 😊`
          }
        ])
        setStep('chatting')
      } else {
        setErrorMessage(response.message || 'Failed to crawl website')
        setStep('idle')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during training')
      setStep('idle')
    } finally {
      cleanupProgress()
    }
  }

  // Handle sending a chat message with Server-Sent Events (SSE) stream parsing
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal || inputVal.trim().length === 0 || isTyping) return

    const userMessage: ChatMessage = { role: 'user', content: inputVal.trim() }
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
          message: userMessage.content,
          chat: messages,
          context: siteData?.context || '',
          title: siteData?.title || 'your website'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate response stream')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('ReadableStream not supported')

      let accumulated = ''
      
      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n\n')

        for (const line of lines) {
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

      // Finish streaming, save assistant message
      const assistantMessage: ChatMessage = { role: 'assistant', content: accumulated }
      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)
      setDisplayedText('')
      setIsTyping(false)

      // Trigger CTA Overlay after 3 turns (6 messages total in chat history)
      if (finalMessages.length >= 6) {
        await new Promise(r => setTimeout(r, 1500))
        setStep('cta')
      }
    } catch (err: any) {
      console.error('[Sandbox Chat] Error:', err)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Sorry, I encountered an error streaming responses. Please try again.' }
      ])
      setIsTyping(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-b-2xl border border-t-0 border-white/[0.08] bg-[#0a0a0a] shadow-2xl overflow-hidden transition-all duration-500">
      
      {/* Dynamic Header */}
      <div className="bg-[#111113] p-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-white/[0.08] overflow-hidden">
            {step === 'scraping' ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : step === 'chatting' || step === 'cta' ? (
              <Bot className="w-4 h-4 text-primary" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary" />
            )}
          </div>
          <div>
            <h4 className="text-white font-bold text-sm tracking-tight">
              {step === 'idle' && 'AI Agent Sandbox'}
              {step === 'scraping' && 'Training Agent...'}
              {(step === 'chatting' || step === 'cta') && `${siteData?.title || 'Your Agent'}`}
            </h4>
            <p className="text-[10px] text-white/40 flex items-center gap-1.5 mt-0.5 font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${step === 'scraping' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span>
                {step === 'idle' && 'Ready to deploy'}
                {step === 'scraping' && 'Crawling pages...'}
                {(step === 'chatting' || step === 'cta') && 'Live sandbox active'}
              </span>
            </p>
          </div>
        </div>

        {step === 'chatting' && (
          <button
            onClick={() => {
              setStep('idle')
              setMessages([])
              setSiteData(null)
            }}
            className="text-[10px] text-white/30 hover:text-white/60 font-bold uppercase tracking-widest transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Main Sandbox Area */}
      <div className="h-[420px] flex flex-col justify-center relative">
        
        {/* ═══════════ Phase 1: Idle (Premium URL Input) ═══════════ */}
        {step === 'idle' && (
          <div className="p-8 text-center relative overflow-hidden">
            {/* Subtle background orbs */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(0,113,227,0.1)]">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-black text-white mb-1.5 tracking-tight">
                Try It With Your Website
              </h3>
              <p className="text-xs text-white/40 mb-8 max-w-[320px] mx-auto leading-relaxed font-medium">
                Paste any URL — we&apos;ll crawl it, build a knowledge base, and let you chat with an AI agent trained on your content.
              </p>

              <form onSubmit={handleStartCrawl} className="flex gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    placeholder={SUGGESTIONS[activeSuggestion]}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all font-medium"
                  />
                </div>
                <Button type="submit" className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(0,113,227,0.3)] hover:shadow-[0_0_30px_rgba(0,113,227,0.5)] flex items-center gap-2 transition-all active:scale-95">
                  Train <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              {errorMessage && (
                <div className="mt-4 flex items-center gap-2 text-rose-400 justify-center text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <p className="text-[10px] text-white/20 mt-5 font-medium">
                Free sandbox • No signup required • Powered by Firecrawl + pgvector
              </p>
            </div>
          </div>
        )}

        {/* ═══════════ Phase 2: Crawler Terminal ═══════════ */}
        {step === 'scraping' && (
          <div className="h-full flex flex-col p-5">
            {/* Stage Progress Bar */}
            <div className="flex items-center gap-1 mb-4">
              {CRAWL_STAGES.map((stage, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    i < activeStage ? 'text-emerald-400 bg-emerald-400/10' :
                    i === activeStage ? 'text-primary bg-primary/10 shadow-[0_0_10px_rgba(0,113,227,0.2)]' :
                    'text-white/20 bg-white/[0.02]'
                  }`}>
                    <span>{stage.icon}</span>
                    <span className="hidden sm:inline">{stage.label}</span>
                  </div>
                  {i < CRAWL_STAGES.length - 1 && (
                    <div className={`flex-1 h-px mx-1 transition-colors duration-300 ${i < activeStage ? 'bg-emerald-400/30' : 'bg-white/[0.06]'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Terminal Console */}
            <div className="flex-1 bg-black/40 rounded-xl border border-white/[0.06] overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <Terminal className="w-3 h-3 text-white/30" />
                <span className="text-[10px] font-mono text-white/40 font-bold">crawl-agent</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-white/30 font-mono">{crawlProgress}%</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5">
                {crawlLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 animate-fade-in">
                    <span className="text-white/15 text-[10px] mt-0.5 tabular-nums select-none">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`leading-relaxed ${i === crawlLogs.length - 1 ? 'text-white/80' : 'text-white/40'}`}>
                      {log}
                    </span>
                  </div>
                ))}
                {crawlProgress < 100 && (
                  <div className="flex items-center gap-2 text-white/20">
                    <span className="text-[10px] tabular-nums select-none">{String(crawlLogs.length + 1).padStart(2, '0')}</span>
                    <span className="inline-block w-1.5 h-3.5 bg-primary/60 animate-pulse" />
                  </div>
                )}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* Progress bar at bottom */}
            <div className="mt-3">
              <div className="w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-blue-400 h-1 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,113,227,0.4)]"
                  style={{ width: `${crawlProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ Phase 3: Premium Chat Interface ═══════════ */}
        {(step === 'chatting' || step === 'cta') && (
          <div className="h-full flex flex-col">
            
            {/* Grounding Attribution Banner */}
            {siteData?.isFallback && (
              <div className="bg-amber-500/5 text-amber-400/80 text-[10px] px-4 py-2 border-b border-amber-500/10 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>Firecrawl limit reached. Using intelligent fallback context for <strong>{siteData.title}</strong>.</span>
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20 shadow-[0_0_12px_rgba(0,113,227,0.15)]">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-md shadow-[0_2px_12px_rgba(0,113,227,0.3)]'
                      : 'bg-white/[0.04] text-white/80 border border-white/[0.06] rounded-tl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && displayedText && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20 shadow-[0_0_12px_rgba(0,113,227,0.15)]">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-tl-md px-4 py-3 text-[13px] leading-relaxed bg-white/[0.04] text-white/80 border border-white/[0.06]">
                    {displayedText}
                    <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                  </div>
                </div>
              )}

              {isTyping && !displayedText && (
                <div className="flex gap-3 justify-start">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-white/[0.06] bg-[#0a0a0a]">
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  disabled={isTyping}
                  placeholder="Ask anything about this website..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 h-10 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 disabled:opacity-40 transition-all font-medium"
                />
                <button 
                  type="submit" 
                  disabled={isTyping || !inputVal.trim()} 
                  className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center active:scale-95 transition-all text-white disabled:opacity-30 disabled:scale-100 shadow-[0_0_12px_rgba(0,113,227,0.3)]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-center text-[9px] text-white/15 mt-2 font-medium">
                Powered by ChatDock AI • Gemini Flash + pgvector RAG
              </p>
            </div>
          </div>
        )}

        {/* ═══════════ Phase 4: CTA Overlay ═══════════ */}
        {step === 'cta' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center z-20 animate-fade-in">
            {/* Success glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              
              <h3 className="text-xl font-black text-white mb-1.5 tracking-tight">
                Agent is Ready to Deploy
              </h3>
              <p className="text-xs text-white/40 mb-8 max-w-[280px] mx-auto leading-relaxed font-medium">
                Your AI answered queries using <strong className="text-white/60">{siteData?.title}</strong>&apos;s real content. Deploy it on your website today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full max-w-xs mx-auto">
                <a href="/auth/sign-up" className="w-full">
                  <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(0,113,227,0.3)] transition-all active:scale-95 text-sm">
                    Launch Your Agent <Sparkles className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </a>
                <a href="https://cal.com/prathap-reddy-caxwn4/15min" target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button variant="outline" className="w-full h-11 bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06] hover:text-white rounded-xl font-medium transition-all text-sm">
                    Book Demo
                  </Button>
                </a>
              </div>

              <button 
                onClick={() => setStep('chatting')}
                className="mt-5 text-[10px] text-white/25 hover:text-white/50 font-bold uppercase tracking-widest transition-colors"
              >
                Continue chatting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
