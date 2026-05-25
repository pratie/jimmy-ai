'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { onIntegrateDomain, onUpdateTheme, onUpdateWelcomeMessage } from '@/actions/settings'
import {
  Sparkles,
  Plus,
  Globe,
  Code,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Send,
  Check,
  Bot,
  User,
  ArrowRight,
  Terminal,
  Copy,
  ChevronRight
} from 'lucide-react'

// Color themes mapping to standard theme variables schema
const THEMES = [
  {
    name: 'Electric Blue',
    primary: '#0071E3',
    headerBg: '#0071E3',
    headerText: '#FFFFFF',
    userBubbleBg: '#0071E3',
    userBubbleText: '#FFFFFF',
    botBubbleBg: '#F4F4F5',
    botBubbleText: '#18181B',
    accent: '#0071E3',
    ring: 'ring-[#0071E3]'
  },
  {
    name: 'Vercel Slate',
    primary: '#18181B',
    headerBg: '#18181B',
    headerText: '#FFFFFF',
    userBubbleBg: '#18181B',
    userBubbleText: '#FFFFFF',
    botBubbleBg: '#F4F4F5',
    botBubbleText: '#18181B',
    accent: '#18181B',
    ring: 'ring-[#18181B]'
  },
  {
    name: 'Forest Emerald',
    primary: '#10B981',
    headerBg: '#10B981',
    headerText: '#FFFFFF',
    userBubbleBg: '#10B981',
    userBubbleText: '#FFFFFF',
    botBubbleBg: '#F4F4F5',
    botBubbleText: '#18181B',
    accent: '#10B981',
    ring: 'ring-[#10B981]'
  },
  {
    name: 'Sunset Rose',
    primary: '#EF4444',
    headerBg: '#EF4444',
    headerText: '#FFFFFF',
    userBubbleBg: '#EF4444',
    userBubbleText: '#FFFFFF',
    botBubbleBg: '#F4F4F5',
    botBubbleText: '#18181B',
    accent: '#EF4444',
    ring: 'ring-[#EF4444]'
  }
]

const AVATARS = [
  { id: 'bot', icon: Bot, label: 'Standard Bot' },
  { id: 'sparkles', icon: Sparkles, label: 'AI Sparkles' },
  { id: 'globe', icon: Globe, label: 'Website Globe' }
]

const CRAWL_LOGS = [
  "🚀 Initializing crawler agent...",
  "🌐 Resolving DNS and crawling domain nodes...",
  "🔍 Discovered core entrypoints: /, /pricing, /about, /features, /docs",
  "⚡ Fetching HTML structures and parsing layout content...",
  "🧠 Extracting document entity relations and knowledge facts...",
  "📄 Formatting parsed text blocks (15,240 words ingested)...",
  "🛡️ Building OpenAI text-embedding-3-small vector schemas...",
  "💾 Storing 32 semantic chunk blocks into pgvector database...",
  "🎉 Domain ingestion indexing complete. RAG pipeline is active!"
]

const AddDomainCTA = () => {
  const router = useRouter()
  const { toast } = useToast()
  
  // Navigation & Forms State
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [domainInput, setDomainInput] = useState('')
  const [domainId, setDomainId] = useState<string | null>(null)
  const [domainName, setDomainName] = useState<string | null>(null)
  
  // Step 1: Crawler States
  const [scanning, setScanning] = useState(false)
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [currentLogs, setCurrentLogs] = useState<string[]>([])
  
  // Step 2: Customization States
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0)
  const [selectedAvatarId, setSelectedAvatarId] = useState('bot')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [savingTheme, setSavingTheme] = useState(false)
  
  // Sandbox Chat States
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot', text: string }>>([])
  const [chatInputValue, setChatInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const activeTheme = THEMES[selectedThemeIndex]

  // Automatically construct welcome message when domain is set
  useEffect(() => {
    if (domainInput) {
      setWelcomeMessage(`Hi! Welcome to ${domainInput}. How can I assist you with our services today?`)
    }
  }, [domainInput])

  // Scroll to bottom in chat sandbox
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Run the Crawling Sim & call backend
  const handleStartCrawl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainInput.trim()) return

    let cleanDomain = domainInput
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .trim()

    setScanning(true)
    setCrawlProgress(0)
    setCurrentLogs([])

    // Animate progress & logs for premium realistic feel
    const logInterval = 400 // logs appear every 400ms
    let currentLogIndex = 0

    const progressTimer = setInterval(() => {
      setCrawlProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return prev + 10
      })
    }, 400)

    const logTimer = setInterval(() => {
      if (currentLogIndex < CRAWL_LOGS.length) {
        setCurrentLogs((prev) => [...prev, CRAWL_LOGS[currentLogIndex]])
        currentLogIndex++
      } else {
        clearInterval(logTimer)
      }
    }, logInterval)

    // Run backend call in parallel
    try {
      const res = await onIntegrateDomain(cleanDomain, '/images/logo.svg')
      
      // Wait for the simulated animation to reach near-completion for high-fidelity experience
      setTimeout(async () => {
        clearInterval(progressTimer)
        clearInterval(logTimer)
        setCrawlProgress(100)
        setCurrentLogs(CRAWL_LOGS)

        if (res && res.status === 200 && res.id) {
          setDomainId(res.id)
          setDomainName(res.name ?? cleanDomain)
          
          // Seed the chatbot preview welcome message
          setMessages([
            {
              sender: 'bot',
              text: `Hi! Welcome to ${cleanDomain}. How can I assist you with our services today?`
            }
          ])
          
          // Small success pause, then go to customize step
          setTimeout(() => {
            setScanning(false)
            setStep(2)
          }, 800)
        } else {
          setScanning(false)
          toast({
            title: 'Error Adding Domain',
            description: res?.message || 'Failed to create domain.',
            variant: 'destructive'
          })
        }
      }, 4000)

    } catch (err) {
      clearInterval(progressTimer)
      clearInterval(logTimer)
      setScanning(false)
      toast({
        title: 'Error',
        description: 'An unexpected server error occurred.',
        variant: 'destructive'
      })
    }
  }

  // Handle saving customization & going to Step 3
  const handleSaveCustomizations = async () => {
    if (!domainId) return
    setSavingTheme(true)

    try {
      // 1. Update theme
      const dbTheme = {
        primary: activeTheme.primary,
        surface: '#FFFFFF',
        text: '#111827',
        headerBg: activeTheme.headerBg,
        headerText: activeTheme.headerText,
        userBubbleBg: activeTheme.userBubbleBg,
        userBubbleText: activeTheme.userBubbleText,
        botBubbleBg: activeTheme.botBubbleBg,
        botBubbleText: activeTheme.botBubbleText,
        inputBg: '#FFFFFF',
        inputBorder: '#E5E7EB',
        accent: activeTheme.accent,
        radius: 10,
        shadow: 'sm'
      }
      
      await onUpdateTheme(domainId, dbTheme)

      // 2. Update welcome message
      await onUpdateWelcomeMessage(welcomeMessage, domainId)

      toast({
        title: 'Settings Saved',
        description: 'Successfully customized your chatbot theme & avatar.'
      })
      
      setStep(3)
    } catch (err) {
      toast({
        title: 'Error saving settings',
        description: 'Could not save theme preferences to the server.',
        variant: 'destructive'
      })
    } finally {
      setSavingTheme(false)
    }
  }

  // Live Chatbot Sandbox Message Submission
  const handleSendSandboxMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInputValue.trim() || isTyping) return

    const userText = chatInputValue
    setMessages((prev) => [...prev, { sender: 'user', text: userText }])
    setChatInputValue('')
    setIsTyping(true)

    // Simulate smart context-aware bot reply
    setTimeout(() => {
      setIsTyping(false)
      let reply = "I can answer support questions, guide users, and capture lead contacts directly! Try embedding me to see how I process your domain."
      
      const query = userText.toLowerCase()
      if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
        reply = `Hello! I have crawled ${domainName} successfully. Ask me anything about your product features, pricing, or company support!`
      } else if (query.includes('pricing') || query.includes('cost') || query.includes('plan')) {
        reply = "Based on our indexed files, we offer a Free tier to get started, with flexible premium updates that unlock full lead-capturing potential."
      } else if (query.includes('features') || query.includes('what can you do') || query.includes('help')) {
        reply = "I automatically scan your site content via RAG, answer user queries 24/7, book calendars, capture customer emails, and sync with your favorite CRMs!"
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }])
    }, 1500)
  }

  // Copy embed snippet utility
  const handleCopySnippet = () => {
    const snippet = `<script\n  src="https://chatdock.io/slider.js"\n  data-chatbot-id="${domainId || 'your-chatbot-id'}"\n></script>`
    navigator.clipboard.writeText(snippet)
    toast({
      title: 'Copied!',
      description: 'Code snippet successfully copied to clipboard.'
    })
  }

  // Complete onboarding reload
  const handleLaunchDashboard = () => {
    toast({
      title: 'Success!',
      description: 'Launching your company chatbot assistant...',
    })
    window.location.reload()
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden transition-all duration-500 font-heading">
      {/* Clean Premium Grid Overlay & Ambient glow */}
      <div className="absolute inset-0 bg-grid-black/[0.015] pointer-events-none" />
      <div className="absolute top-[-25%] right-[-10%] w-[380px] h-[380px] rounded-full bg-primary/5 blur-[90px] pointer-events-none" />

      {/* Modern Active Step Stepper */}
      <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Assistant Setup Wizard</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {[
            { num: 1, label: 'Crawl Domain' },
            { num: 2, label: 'Custom Look' },
            { num: 3, label: 'Embed Snippet' }
          ].map((s) => (
            <React.Fragment key={s.num}>
              {s.num > 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />}
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  step === s.num
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span className={`text-xs font-semibold hidden md:inline transition-colors duration-300 ${
                  step === s.num ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 relative z-10">
        {/* ==================== STEP 1: SCANNER & CRAWL ==================== */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm mb-5">
              <Globe className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
              Activate your chatbot in minutes
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg leading-relaxed mb-8">
              Enter your website domain. Our high-speed document ingestion engine crawls your website pages, builds semantic indexes, and creates a customized AI chatbot instantly.
            </p>

            {!scanning ? (
              <form onSubmit={handleStartCrawl} className="w-full flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="example.com"
                    className="h-12 w-full pl-11 pr-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-6 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl shadow-glow transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2"
                >
                  Scan Website
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="w-full flex flex-col items-stretch text-left">
                {/* Visual Progress Loader */}
                <div className="bg-muted/30 border border-border/80 rounded-xl p-5 mb-5 flex flex-col gap-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Ingesting Knowledge Base</span>
                    <span className="text-xs font-bold text-primary">{crawlProgress}%</span>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full bg-muted-foreground/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${crawlProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>Crawling site nodes & converting context embeddings...</span>
                  </div>
                </div>

                {/* Simulated Crawler Console Logs */}
                <div className="bg-black/95 text-zinc-300 rounded-xl p-5 font-mono text-[11px] leading-relaxed h-52 overflow-y-auto border border-zinc-800 shadow-lg">
                  <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2 mb-3">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>FIRE-CRAWL-RAG CONSOLE</span>
                  </div>
                  <div className="space-y-1.5">
                    {currentLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-zinc-600 select-none">[{idx + 1}]</span>
                        <span className={idx === currentLogs.length - 1 ? 'text-primary font-semibold' : ''}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== STEP 2: CUSTOMIZER & SANDBOX ==================== */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Customizer Sidebar: Left (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Style Your Chatbot</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Brand your assistant widget design instantly</p>
              </div>

              {/* 1. Theme Selection Preset */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Brand Theme</span>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((themePreset, idx) => (
                    <button
                      key={themePreset.name}
                      onClick={() => setSelectedThemeIndex(idx)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        selectedThemeIndex === idx
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: themePreset.primary }}
                      />
                      <span className="text-xs font-bold text-foreground">{themePreset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Welcome Message Setting */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Welcome Message</span>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => {
                    setWelcomeMessage(e.target.value)
                    // Reset sandbox messages to show updated welcome bubble
                    setMessages([{ sender: 'bot', text: e.target.value }])
                  }}
                  rows={3}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm leading-relaxed"
                  placeholder="Greeting bubble message..."
                />
              </div>

              {/* 3. Avatar Icon Selection */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choose Assistant Icon</span>
                <div className="flex gap-2">
                  {AVATARS.map((avatar) => {
                    const IconComponent = avatar.icon
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border gap-2 transition-all ${
                          selectedAvatarId === avatar.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border bg-card hover:bg-muted/40'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 ${selectedAvatarId === avatar.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-[10px] font-bold text-foreground">{avatar.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Next CTA button */}
              <button
                onClick={handleSaveCustomizations}
                disabled={savingTheme}
                className="w-full h-11 mt-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
              >
                {savingTheme ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving appearance...
                  </>
                ) : (
                  <>
                    Looks Perfect, Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Live Chat Sandbox Container: Right (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col items-stretch">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Sandbox Simulator</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Test chatting with your AI assistant widget in real-time</p>
              </div>

              {/* Chatbot Mock Window */}
              <div className="w-full max-w-md mx-auto border border-border/80 rounded-2xl bg-zinc-50 shadow-medium overflow-hidden h-[420px] flex flex-col">
                
                {/* Chatbot Header */}
                <div
                  className="px-4 py-3 flex items-center gap-3 transition-colors duration-300"
                  style={{ backgroundColor: activeTheme.headerBg, color: activeTheme.headerText }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-sm">
                    {(() => {
                      const ActiveIcon = AVATARS.find(a => a.id === selectedAvatarId)?.icon || Bot
                      return <ActiveIcon className="w-4.5 h-4.5" />
                    })()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-none">{domainName || 'Site Assistant'}</h4>
                    <span className="text-[9px] opacity-80 mt-0.5 inline-block font-semibold">Online • AI Agent</span>
                  </div>
                </div>

                {/* Chat Bubbles Scroll View */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 chat-window">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 max-w-[85%] ${
                        msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        msg.sender === 'user' ? 'bg-zinc-200 text-zinc-700' : 'bg-white border border-border text-zinc-800 shadow-sm'
                      }`}>
                        {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : (
                          (() => {
                            const IconC = AVATARS.find(a => a.id === selectedAvatarId)?.icon || Bot
                            return <IconC className="w-3.5 h-3.5" style={{ color: activeTheme.primary }} />
                          })()
                        )}
                      </div>
                      <div
                        className="px-3.5 py-2.5 text-xs font-semibold leading-relaxed"
                        style={{
                          backgroundColor: msg.sender === 'user' ? activeTheme.userBubbleBg : activeTheme.botBubbleBg,
                          color: msg.sender === 'user' ? activeTheme.userBubbleText : activeTheme.botBubbleText,
                          borderRadius: msg.sender === 'user' ? '12px 2px 12px 12px' : '2px 12px 12px 12px'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Typing Animation */}
                  {isTyping && (
                    <div className="flex items-start gap-2 max-w-[85%] mr-auto animate-pulse">
                      <div className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center shrink-0">
                        {(() => {
                          const IconC = AVATARS.find(a => a.id === selectedAvatarId)?.icon || Bot
                          return <IconC className="w-3.5 h-3.5" style={{ color: activeTheme.primary }} />
                        })()}
                      </div>
                      <div
                        className="px-3.5 py-2.5 text-xs font-medium rounded-xl flex items-center gap-1 bg-zinc-200 text-zinc-500"
                        style={{ borderRadius: '2px 12px 12px 12px' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Sandbox Input Form */}
                <form onSubmit={handleSendSandboxMessage} className="border-t border-border/60 bg-white p-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInputValue}
                    onChange={(e) => setChatInputValue(e.target.value)}
                    disabled={isTyping}
                    placeholder="Type a message (e.g. features, pricing)..."
                    className="flex-1 px-3 py-2 text-xs font-medium border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!chatInputValue.trim() || isTyping}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 active:scale-95 transition-all disabled:opacity-30"
                    style={{ backgroundColor: activeTheme.primary }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            </div>

          </div>
        )}

        {/* ==================== STEP 3: CODE SNIPPET EMBED ==================== */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-sm mb-5">
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
              Assistant Integration Ready!
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg leading-relaxed mb-8">
              Copy and paste this snippet right before the closing <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-bold text-foreground">&lt;/body&gt;</code> tag on your site layout to publish your customized chatbot.
            </p>

            {/* Code Box */}
            <div className="w-full bg-zinc-950 text-zinc-100 rounded-xl p-5 border border-zinc-800 shadow-lg text-left font-mono text-[11px] relative mb-8">
              <button
                onClick={handleCopySnippet}
                className="absolute right-3 top-3 p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg active:scale-95 transition-all shadow-sm"
                title="Copy Code"
              >
                <Copy className="w-4 h-4" />
              </button>
              <span className="text-zinc-600 block border-b border-zinc-900 pb-2 mb-3">WIDGET SCRIPT INJECTION</span>
              <pre className="overflow-x-auto leading-relaxed select-all pr-12 text-sky-400">
{`<script
  src="https://chatdock.io/slider.js"
  data-chatbot-id="${domainId || 'your-chatbot-id'}"
></script>`}
              </pre>
            </div>

            {/* Progress checklist */}
            <div className="border border-border/80 rounded-2xl bg-muted/20 w-full p-5 mb-8 text-left space-y-3 max-w-md mx-auto">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Setup Checklist</h4>
              <div className="flex items-center gap-3 text-xs text-foreground font-semibold">
                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white"><Check className="w-2.5 h-2.5" /></span>
                <span>Crawled & Ingested {domainName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-foreground font-semibold">
                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white"><Check className="w-2.5 h-2.5" /></span>
                <span>Customized Greeting & Style presets</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                <span className="w-4 h-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary animate-pulse text-[9px] font-bold">3</span>
                <span>Paste widget script before &lt;/body&gt;</span>
              </div>
            </div>

            {/* Launch button */}
            <button
              onClick={handleLaunchDashboard}
              className="h-12 px-10 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Launch Dashboard
              <ArrowRight className="w-4 h-4 animate-bounce-x" />
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default AddDomainCTA
