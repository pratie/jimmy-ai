'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, Globe, Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { onGeneratePreviewContext } from '@/actions/landing'

type Role = 'user' | 'assistant'

interface ChatMessage {
  role: Role
  content: string
}

type SandboxStep = 'idle' | 'scraping' | 'chatting' | 'cta'

export default function InteractivePreviewChat() {
  const [step, setStep] = useState<SandboxStep>('idle')
  const [urlInput, setUrlInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Crawler Loading Animation Steps
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [crawlStatus, setCrawlStatus] = useState('')
  
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

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, displayedText, isTyping])

  // Trigger real-time crawler progress steps
  const runCrawlerProgress = () => {
    const statuses = [
      { prg: 15, msg: 'Connecting to Firecrawl API...' },
      { prg: 40, msg: 'Discovering site assets & links...' },
      { prg: 70, msg: 'Converting raw HTML into clean Markdown...' },
      { prg: 90, msg: 'Generating embedding vectors for RAG sandbox...' },
      { prg: 100, msg: 'Sandbox RAG AI Agent ready!' }
    ]

    let idx = 0
    setCrawlProgress(0)
    setErrorMessage('')

    const timer = setInterval(() => {
      if (idx < statuses.length) {
        setCrawlProgress(statuses[idx].prg)
        setCrawlStatus(statuses[idx].msg)
        idx++
      } else {
        clearInterval(timer)
      }
    }, 900)

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
            content: `Hi there! 👋 I have successfully crawled your website **${response.data.title}** and trained myself on its contents. 
            
Ask me anything about your website, services, pricing, or details, and I will answer you using RAG context! 😊`
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
    <div className="w-full max-w-2xl mx-auto rounded-b-2xl border border-t-0 border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300">
      
      {/* Dynamic Header */}
      <div className="bg-slate-900 dark:bg-black/40 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-800 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center ring-1 ring-white/10 overflow-hidden shadow-glow-primary">
            {step === 'scraping' ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Globe className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">
              {step === 'idle' && 'Sandbox AI Agent Builder'}
              {step === 'scraping' && 'Training Agent in Sandbox...'}
              {(step === 'chatting' || step === 'cta') && `${siteData?.title || 'Sandbox Agent'}`}
            </h4>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {step === 'idle' && 'Ready to train'}
                {step === 'scraping' && 'Firecrawl mapping in progress'}
                {(step === 'chatting' || step === 'cta') && 'Interactive sandbox live'}
              </span>
            </p>
          </div>
        </div>

        {step === 'chatting' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setStep('idle')
              setMessages([])
              setSiteData(null)
            }}
            className="text-xs text-slate-400 hover:text-white"
          >
            Reset Sandbox
          </Button>
        )}
      </div>

      {/* Main Sandbox Area */}
      <div className="h-[400px] flex flex-col justify-center bg-slate-50/50 dark:bg-slate-950/20 relative">
        
        {/* Phase 1: Idle (URL Input Form) */}
        {step === 'idle' && (
          <div className="p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-slate-800 dark:text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Test with Your Own Website
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              Enter your domain URL to automatically discover pages, extract text, and build an interactive AI Agent sandbox in seconds!
            </p>

            <form onSubmit={handleStartCrawl} className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all shadow-sm"
                />
              </div>
              <Button type="submit" className="h-12 px-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-200 font-semibold shadow-md flex items-center gap-1.5 transition-transform active:scale-95">
                Analyze <ChevronRight className="w-4 h-4" />
              </Button>
            </form>

            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 text-rose-500 justify-center text-xs font-medium animate-bounce">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Crawler Scraping State */}
        {step === 'scraping' && (
          <div className="p-8 text-center animate-pulse">
            <Loader2 className="w-12 h-12 text-slate-900 dark:text-white animate-spin mx-auto mb-6" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Discovering Website Data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
              Crawling pages & converting document structures using Firecrawl...
            </p>

            {/* Custom high-fidelity progress stepping bar */}
            <div className="max-w-xs mx-auto">
              <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-slate-900 dark:bg-white h-2 rounded-full transition-all duration-500 shadow-md"
                  style={{ width: `${crawlProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>{crawlProgress}%</span>
                <span>•</span>
                <span className="text-[11px] font-normal">{crawlStatus}</span>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Interactive Active Chat Widget */}
        {(step === 'chatting' || step === 'cta') && (
          <div className="h-full flex flex-col">
            
            {/* Grounding Attribution Banner */}
            {siteData?.isFallback && (
              <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-[10px] px-4 py-2 border-b border-amber-200/50 dark:border-amber-900/20 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Firecrawl limit reached / offline. Loaded intelligent sandbox context for **${siteData.title}**.</span>
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                      <Bot className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-900 dark:bg-slate-800 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-white/5 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && displayedText && (
                <div className="flex gap-3 justify-start">
                  <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                    <Bot className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 text-sm leading-relaxed bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-white/5 shadow-sm">
                    {displayedText}
                    <span className="inline-block w-1 h-3.5 bg-slate-400 ml-0.5 animate-pulse" />
                  </div>
                </div>
              )}

              {isTyping && !displayedText && (
                <div className="flex gap-3 justify-start">
                  <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                    <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} className="p-4 pt-2 border-t border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 flex gap-2">
              <input
                type="text"
                disabled={isTyping}
                placeholder="Ask something about this site..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 h-10 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isTyping || !inputVal.trim()} 
                className="h-10 w-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-white dark:text-slate-900 disabled:opacity-40 disabled:scale-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Phase 4: Pitch Overlay (Turn count completed) */}
        {step === 'cta' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-fade-in z-20">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">
              Fully Trained Agent Ready!
            </h3>
            <p className="text-sm text-slate-300 mb-8 max-w-sm mx-auto">
              I answered queries using **${siteData?.title}**&apos;s real content. Deploy this assistant on your site and start qualifying leads today!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
              <a href="/auth/sign-up" className="w-full">
                <Button className="w-full h-12 bg-white text-slate-900 hover:bg-slate-200 rounded-full font-bold shadow-lg transition-transform active:scale-95">
                  Launch Widget <Sparkles className="w-4 h-4 ml-1.5 text-slate-900" />
                </Button>
              </a>
              <a href="https://cal.com/prathap-reddy-caxwn4/15min" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full h-12 bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full font-medium transition-all">
                  Book Managed Demo
                </Button>
              </a>
            </div>

            <button 
              onClick={() => setStep('chatting')}
              className="mt-6 text-xs text-slate-400 hover:text-white underline underline-offset-4"
            >
              Continue chatting in sandbox
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
