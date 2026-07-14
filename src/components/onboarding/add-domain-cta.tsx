'use client'

import { onIntegrateDomain, onUpdateTheme, onUpdateWelcomeMessage } from '@/actions/settings'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Globe2,
  Loader2,
  MessageSquareText,
  Palette,
  Sparkles,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

const THEMES = [
  { name: 'Indigo', primary: '#6768E5', headerBg: '#171D2B', headerText: '#FFFFFF', userBubbleBg: '#6768E5', userBubbleText: '#FFFFFF', botBubbleBg: '#F1F3F7', botBubbleText: '#1F2937', accent: '#6768E5' },
  { name: 'Midnight', primary: '#111827', headerBg: '#111827', headerText: '#FFFFFF', userBubbleBg: '#111827', userBubbleText: '#FFFFFF', botBubbleBg: '#F1F3F7', botBubbleText: '#1F2937', accent: '#111827' },
  { name: 'Emerald', primary: '#059669', headerBg: '#065F46', headerText: '#FFFFFF', userBubbleBg: '#059669', userBubbleText: '#FFFFFF', botBubbleBg: '#ECFDF5', botBubbleText: '#064E3B', accent: '#059669' },
  { name: 'Terracotta', primary: '#E36F4F', headerBg: '#9A3412', headerText: '#FFFFFF', userBubbleBg: '#E36F4F', userBubbleText: '#FFFFFF', botBubbleBg: '#FFF7ED', botBubbleText: '#7C2D12', accent: '#E36F4F' },
]

const AVATARS = [
  { id: 'bot', icon: Bot, label: 'Agent' },
  { id: 'sparkles', icon: Sparkles, label: 'Spark' },
  { id: 'globe', icon: Globe2, label: 'Globe' },
]

const CRAWL_STEPS = [
  'Reading public website pages',
  'Structuring approved content',
  'Creating the knowledge index',
  'Preparing your agent workspace',
]

const STEPS = [
  { number: 1, label: 'Knowledge', icon: Globe2 },
  { number: 2, label: 'Appearance', icon: Palette },
  { number: 3, label: 'Install', icon: Code2 },
]

export default function AddDomainCTA({ onClose }: { onClose?: () => void }) {
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [domainInput, setDomainInput] = useState('')
  const [domainId, setDomainId] = useState<string | null>(null)
  const [domainName, setDomainName] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [currentLogs, setCurrentLogs] = useState<string[]>([])
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0)
  const [selectedAvatarId, setSelectedAvatarId] = useState('bot')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [savingTheme, setSavingTheme] = useState(false)

  const activeTheme = THEMES[selectedThemeIndex]
  const ActiveAvatar = AVATARS.find((avatar) => avatar.id === selectedAvatarId)?.icon || Bot

  useEffect(() => {
    if (domainInput) setWelcomeMessage(`Hi! Welcome to ${domainInput}. How can I help today?`)
  }, [domainInput])

  const handleStartCrawl = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!domainInput.trim()) return

    const cleanDomain = domainInput.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').trim()
    setScanning(true)
    setCrawlProgress(12)
    setCurrentLogs([])

    let logIndex = 0
    const logTimer = window.setInterval(() => {
      if (logIndex >= CRAWL_STEPS.length) return window.clearInterval(logTimer)
      setCurrentLogs((logs) => [...logs, CRAWL_STEPS[logIndex]])
      setCrawlProgress(Math.min(88, 24 + logIndex * 21))
      logIndex += 1
    }, 500)

    try {
      const result = await onIntegrateDomain(cleanDomain, '/images/logo.svg')
      window.clearInterval(logTimer)

      if (result?.status === 200 && result.id) {
        setCurrentLogs(CRAWL_STEPS)
        setCrawlProgress(100)
        setDomainId(result.id)
        setDomainName(result.name ?? cleanDomain)
        window.setTimeout(() => {
          setScanning(false)
          setStep(2)
        }, 450)
      } else {
        setScanning(false)
        toast({ title: 'Could not add website', description: result?.message || 'Please check the domain and try again.', variant: 'destructive' })
      }
    } catch {
      window.clearInterval(logTimer)
      setScanning(false)
      toast({ title: 'Could not add website', description: 'An unexpected server error occurred.', variant: 'destructive' })
    }
  }

  const handleSaveCustomizations = async () => {
    if (!domainId) return
    setSavingTheme(true)

    try {
      await onUpdateTheme(domainId, {
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
        radius: 12,
        shadow: 'sm',
      })
      await onUpdateWelcomeMessage(welcomeMessage, domainId)
      setStep(3)
    } catch {
      toast({ title: 'Could not save appearance', description: 'Your workspace was created, but these preferences were not saved.', variant: 'destructive' })
    } finally {
      setSavingTheme(false)
    }
  }

  const snippet = `<script defer\n  src="https://www.chatdock.io/embed.min.js"\n  id="${domainId || 'your-agent-id'}"\n  data-app-origin="https://www.chatdock.io"\n  data-margin="24"\n  data-size="md">\n</script>`

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet)
    toast({ title: 'Install code copied', description: 'Paste it before the closing body tag on your client website.' })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.07)]">
      <header className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">New client agent</p>
          <p className="mt-1 text-xs text-slate-500">From website to install in three focused steps.</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          {STEPS.map((item, index) => {
            const complete = step > item.number
            const active = step === item.number
            const Icon = item.icon
            return (
              <React.Fragment key={item.number}>
                {index > 0 && <span className={cn('h-px w-5 sm:w-9', complete || active ? 'bg-indigo-300' : 'bg-slate-200')} />}
                <div className="flex items-center gap-2">
                  <span className={cn('grid h-7 w-7 place-items-center rounded-lg border text-[11px] font-semibold', active && 'border-indigo-200 bg-indigo-50 text-indigo-600', complete && 'border-emerald-200 bg-emerald-50 text-emerald-600', !active && !complete && 'border-slate-200 text-slate-400')}>
                    {complete ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  <span className={cn('hidden text-xs font-medium sm:block', active ? 'text-slate-900' : 'text-slate-400')}>{item.label}</span>
                </div>
              </React.Fragment>
            )
          })}
          {onClose && <button type="button" onClick={onClose} aria-label="Close setup" className="ml-2 grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"><X className="h-4 w-4" /></button>}
        </div>
      </header>

      {step === 1 && (
        <div className="grid lg:grid-cols-[minmax(0,1.25fr)_360px]">
          <section className="p-6 sm:p-8 lg:p-10">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Globe2 className="h-[18px] w-[18px]" /></span>
            <h2 className="mt-7 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Add the client website</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">We’ll use its public pages as the starting knowledge source. You can review and refine the content after setup.</p>

            {!scanning ? (
              <form onSubmit={handleStartCrawl} className="mt-8 max-w-2xl">
                <label htmlFor="client-domain" className="text-xs font-semibold text-slate-700">Website address</label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Globe2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="client-domain" required value={domainInput} onChange={(event) => setDomainInput(event.target.value)} placeholder="clientwebsite.com" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                  </div>
                  <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-[#252d3d]">Continue <ArrowRight className="h-4 w-4" /></button>
                </div>
                <p className="mt-3 text-[11px] text-slate-400">Use the main public domain. No sitemap or technical access is required.</p>
              </form>
            ) : (
              <div className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Preparing {domainInput}</div><span className="text-xs font-semibold text-indigo-600">{crawlProgress}%</span></div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${crawlProgress}%` }} /></div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">{CRAWL_STEPS.map((label) => { const done = currentLogs.includes(label); return <div key={label} className={cn('flex items-center gap-2 text-xs', done ? 'text-slate-700' : 'text-slate-400')}><span className={cn('grid h-5 w-5 place-items-center rounded-full', done ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-300')}>{done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span>{label}</div>})}</div>
              </div>
            )}
          </section>

          <aside className="border-t border-slate-200 bg-[#f7f8fb] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">What happens next</p>
            <div className="mt-6 space-y-6">
              {[
                ['1', 'Website knowledge', 'Public pages become the agent’s initial source material.'],
                ['2', 'Brand and greeting', 'Choose the visual style and first message visitors see.'],
                ['3', 'Install and preview', 'Copy one script and test the complete client experience.'],
              ].map(([number, title, copy]) => <div key={number} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-500">{number}</span><div><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p></div></div>)}
            </div>
            <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4"><p className="text-xs font-semibold text-indigo-900">Usually ready in a few minutes</p><p className="mt-1 text-[11px] leading-5 text-indigo-700/70">Large websites may continue indexing after the workspace is created.</p></div>
          </aside>
        </div>
      )}

      {step === 2 && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_430px]">
          <section className="p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Match the client brand</h2>
            <p className="mt-2 text-sm text-slate-500">Choose a solid starting point. Everything remains editable later.</p>

            <div className="mt-8">
              <label className="text-xs font-semibold text-slate-700">Color system</label>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{THEMES.map((theme, index) => <button key={theme.name} type="button" onClick={() => setSelectedThemeIndex(index)} className={cn('flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-medium transition', selectedThemeIndex === index ? 'border-indigo-300 bg-indigo-50 text-slate-900 ring-2 ring-indigo-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}><span className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.primary }} />{theme.name}</button>)}</div>
            </div>

            <div className="mt-7">
              <label htmlFor="welcome-message" className="text-xs font-semibold text-slate-700">Welcome message</label>
              <textarea id="welcome-message" value={welcomeMessage} onChange={(event) => setWelcomeMessage(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-slate-300 p-3.5 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
            </div>

            <div className="mt-7">
              <label className="text-xs font-semibold text-slate-700">Agent icon</label>
              <div className="mt-3 flex gap-2">{AVATARS.map((avatar) => <button key={avatar.id} type="button" onClick={() => setSelectedAvatarId(avatar.id)} className={cn('flex min-w-24 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition', selectedAvatarId === avatar.id ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50')}><avatar.icon className="h-4 w-4" />{avatar.label}</button>)}</div>
            </div>

            <button type="button" onClick={handleSaveCustomizations} disabled={savingTheme} className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-[#252d3d] disabled:opacity-50">{savingTheme ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving</> : <>Save and continue <ArrowRight className="h-4 w-4" /></>}</button>
          </section>

          <aside className="border-t border-slate-200 bg-[#f7f8fb] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Live preview</p>
            <div className="mx-auto flex h-[430px] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,.12)]">
              <div className="flex items-center gap-3 px-4 py-3.5" style={{ backgroundColor: activeTheme.headerBg, color: activeTheme.headerText }}><span className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><ActiveAvatar className="h-4 w-4" /></span><div><p className="text-sm font-semibold capitalize">{domainName?.split('.')[0] || 'Client'} assistant</p><p className="mt-0.5 text-[10px] opacity-70">Online</p></div></div>
              <div className="flex-1 bg-slate-50 p-4"><div className="flex items-end gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white shadow-sm"><ActiveAvatar className="h-3 w-3" style={{ color: activeTheme.primary }} /></span><div className="max-w-[82%] px-3.5 py-2.5 text-xs leading-5 shadow-sm" style={{ backgroundColor: activeTheme.botBubbleBg, color: activeTheme.botBubbleText, borderRadius: '14px 14px 14px 3px' }}>{welcomeMessage || 'How can I help today?'}</div></div></div>
              <div className="border-t border-slate-200 bg-white p-3"><div className="flex h-10 items-center justify-between rounded-xl border border-slate-200 px-3 text-xs text-slate-400"><span>Write a message…</span><span className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{ backgroundColor: activeTheme.primary }}><ArrowRight className="h-3.5 w-3.5" /></span></div></div>
            </div>
          </aside>
        </div>
      )}

      {step === 3 && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="p-6 sm:p-8 lg:p-10">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span>
            <h2 className="mt-7 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Your agent is ready to install</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Add this script before the closing body tag on the client website. It loads asynchronously and can be removed at any time.</p>
            <div className="relative mt-8 max-w-2xl overflow-hidden rounded-2xl bg-[#111827] p-5 text-left text-xs text-slate-300 shadow-lg">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3"><span className="flex items-center gap-2 text-[11px] font-medium text-white/45"><Code2 className="h-3.5 w-3.5" /> HTML install code</span><button type="button" onClick={copySnippet} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-white/15"><Copy className="h-3 w-3" /> Copy</button></div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono leading-6 text-[#b8b9ff]">{snippet}</pre>
            </div>
            <button type="button" onClick={() => window.location.reload()} className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-[#252d3d]">Finish setup <ArrowRight className="h-4 w-4" /></button>
          </section>

          <aside className="border-t border-slate-200 bg-[#f7f8fb] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Launch checklist</p>
            <div className="mt-6 space-y-5">{[
              ['Knowledge added', domainName || 'Client website'],
              ['Appearance saved', `${activeTheme.name} theme`],
              ['Install code ready', 'Waiting for website placement'],
            ].map(([title, copy], index) => <div key={title} className="flex gap-3"><span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full', index < 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600')}>{index < 2 ? <Check className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}</span><div><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{copy}</p></div></div>)}</div>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><MessageSquareText className="h-4 w-4 text-indigo-600" /> Test before handoff</div><p className="mt-2 text-[11px] leading-5 text-slate-500">Open the agent preview from its workspace after finishing setup.</p></div>
          </aside>
        </div>
      )}
    </div>
  )
}
