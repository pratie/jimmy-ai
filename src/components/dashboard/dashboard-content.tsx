'use client'

import AddDomainCTA from '@/components/onboarding/add-domain-cta'
import { useAgent } from '@/context/agent-context'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  Bot,
  CalendarCheck2,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  Inbox,
  MessageSquareText,
  Plus,
  Search,
  Sparkles,
  Target,
  UsersRound,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'

type Workspace = {
  id: string
  name: string
  icon: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  chatBot?: {
    id: string
    knowledgeBaseStatus?: string | null
    hasEmbeddings?: boolean
    mode?: string | null
  } | null
  customer?: {
    id?: string
    email?: string | null
    chatRoom: { id: string; live: boolean }[]
  }[]
}

type Props = {
  conversations: number
  leads: number
  appointments: number
  plan: {
    plan?: string
    messageCredits?: number
    messagesUsed?: number
    domains?: number
  } | null | undefined
  domains: Workspace[]
}

function displayName(domain: string) {
  return domain.replace(/^www\./, '').split('.')[0].replace(/[-_]/g, ' ')
}

function workspaceState(workspace: Workspace) {
  if (workspace.chatBot?.hasEmbeddings || workspace.chatBot?.knowledgeBaseStatus === 'completed') {
    return { label: 'Live', tone: 'emerald', progress: 100 }
  }
  if (workspace.chatBot?.knowledgeBaseStatus === 'processing') {
    return { label: 'Training', tone: 'amber', progress: 62 }
  }
  return { label: 'Needs setup', tone: 'slate', progress: 25 }
}

function MetricCard({ label, value, detail, icon: Icon, accent }: {
  label: string
  value: string | number
  detail: string
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accent)}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      <p className="mt-3 text-[11px] font-medium text-slate-400">{detail}</p>
    </div>
  )
}

export default function DashboardContent({ conversations, leads, appointments, plan, domains }: Props) {
  const router = useRouter()
  const { selectAgent } = useAgent()
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const totalKnownLeads = domains.reduce((sum, domain) => sum + (domain.customer || []).filter((customer) => customer.email).length, 0)
  const liveAgents = domains.filter((domain) => workspaceState(domain).label === 'Live').length
  const conversionRate = totalKnownLeads > 0 ? Math.round((appointments / totalKnownLeads) * 100) : 0
  const credits = plan?.messageCredits || 0
  const used = plan?.messagesUsed || 0
  const usage = credits > 0 ? Math.min(100, Math.round((used / credits) * 100)) : 0

  const filtered = useMemo(
    () => domains.filter((domain) => domain.name.toLowerCase().includes(query.toLowerCase())),
    [domains, query]
  )

  const manageWorkspace = (workspace: Workspace) => {
    selectAgent({ id: workspace.id, name: workspace.name, icon: workspace.icon })
    router.push(`/settings/${workspace.name.split('.')[0]}`)
  }

  if (showCreate) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-7 md:px-8">
        <button onClick={() => setShowCreate(false)} className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm hover:text-slate-950">
          <X className="h-3.5 w-3.5" /> Close setup
        </button>
        <AddDomainCTA />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-8 md:py-9">
      <section className="relative overflow-hidden rounded-[28px] bg-[#0b1020] px-6 py-7 text-white shadow-[0_25px_70px_rgba(15,23,42,0.16)] md:px-8 md:py-8">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#5b5ce2]/35 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/65">
              <Sparkles className="h-3.5 w-3.5 text-[#9b9cff]" /> Agency pulse
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white md:text-4xl">
              Your agents should prove revenue, not just answer questions.
            </h2>
            <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-white/55">
              Monitor every client workspace, resolve conversations, and move qualified visitors toward a booked meeting.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#0b1020] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#f1f1ff]">
            <Plus className="h-4 w-4" /> Deploy client agent
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Client agents" value={domains.length} detail={`${liveAgents} live and customer-facing`} icon={Bot} accent="bg-indigo-50 text-[#5b5ce2]" />
        <MetricCard label="Conversations" value={conversations} detail="Across every client workspace" icon={MessageSquareText} accent="bg-sky-50 text-sky-600" />
        <MetricCard label="Qualified leads" value={totalKnownLeads || leads} detail="Visitors with captured contact data" icon={UsersRound} accent="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Lead → booking" value={`${conversionRate}%`} detail={`${appointments} confirmed booking${appointments === 1 ? '' : 's'}`} icon={Target} accent="bg-orange-50 text-orange-600" />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-950">Client workspaces</h3>
              <p className="mt-1 text-xs font-medium text-slate-400">One operating view for every deployed agent.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a client…" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold outline-none transition focus:border-[#5b5ce2]/40 focus:bg-white focus:ring-4 focus:ring-[#5b5ce2]/8" />
            </div>
          </div>

          {!filtered.length ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[#5b5ce2]"><Bot className="h-6 w-6" /></div>
              <h4 className="mt-4 text-base font-black text-slate-950">{domains.length ? 'No matching workspace' : 'Deploy your first client agent'}</h4>
              <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">Train it on a website, tune the response style, preview the experience, then install one embed.</p>
              {!domains.length && <button onClick={() => setShowCreate(true)} className="mt-5 rounded-xl bg-[#5b5ce2] px-4 py-2.5 text-xs font-black text-white">Start setup</button>}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((workspace) => {
                const state = workspaceState(workspace)
                const customers = workspace.customer || []
                const chats = customers.reduce((sum, customer) => sum + customer.chatRoom.length, 0)
                const knownLeads = customers.filter((customer) => customer.email).length
                return (
                  <div key={workspace.id} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition hover:bg-slate-50/80 md:grid-cols-[minmax(240px,1.4fr)_110px_100px_110px_auto] md:px-6">
                    <button onClick={() => manageWorkspace(workspace)} className="flex min-w-0 items-center gap-3 text-left">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b1020] text-xs font-black uppercase text-white shadow-md">
                        {displayName(workspace.name).slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black capitalize text-slate-900">{displayName(workspace.name)}</p>
                        <p className="mt-1 truncate text-[11px] font-medium text-slate-400">{workspace.name}</p>
                      </div>
                    </button>
                    <div className="hidden md:block">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black',
                        state.tone === 'emerald' && 'bg-emerald-50 text-emerald-700',
                        state.tone === 'amber' && 'bg-amber-50 text-amber-700',
                        state.tone === 'slate' && 'bg-slate-100 text-slate-500'
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', state.tone === 'emerald' ? 'bg-emerald-500' : state.tone === 'amber' ? 'bg-amber-500' : 'bg-slate-400')} />
                        {state.label}
                      </span>
                    </div>
                    <div className="hidden md:block"><p className="text-sm font-black text-slate-900">{chats}</p><p className="text-[10px] font-medium text-slate-400">chats</p></div>
                    <div className="hidden md:block"><p className="text-sm font-black text-slate-900">{knownLeads}</p><p className="text-[10px] font-medium text-slate-400">leads</p></div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => manageWorkspace(workspace)} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-700 shadow-sm transition hover:border-[#5b5ce2]/30 hover:text-[#5b5ce2]">Manage <ChevronRight className="h-3 w-3" /></button>
                      <Link href={`/preview/${workspace.id}`} target="_blank" className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-900" title="Open preview"><ExternalLink className="h-3.5 w-3.5" /></Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Capacity</p><h3 className="mt-1 text-base font-black text-slate-950">{plan?.plan || 'Free'} plan</h3></div>
              <Zap className="h-5 w-5 text-[#5b5ce2]" />
            </div>
            <div className="mt-5 flex items-end justify-between"><span className="text-2xl font-black tracking-tight text-slate-950">{used.toLocaleString()}</span><span className="text-[11px] font-bold text-slate-400">of {credits.toLocaleString()} messages</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#5b5ce2] to-[#898aff]" style={{ width: `${usage}%` }} /></div>
            <Link href="/settings" className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-100">Manage plan <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>

          <div className="rounded-3xl bg-[#e9e9ff] p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5b5ce2] text-white"><CircleAlert className="h-4 w-4" /></div>
            <h3 className="mt-4 text-base font-black text-[#17174a]">Next best action</h3>
            <p className="mt-2 text-xs font-medium leading-5 text-[#4d4d7a]">
              {domains.length === 0
                ? 'Deploy a demo agent on your own website before presenting ChatDock to a client.'
                : liveAgents < domains.length
                  ? `${domains.length - liveAgents} workspace${domains.length - liveAgents === 1 ? '' : 's'} still need training or launch setup.`
                  : 'All agents are live. Review the inbox and follow up with qualified leads.'}
            </p>
            <button onClick={() => domains.length === 0 ? setShowCreate(true) : router.push('/conversation')} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#3535a3]">{domains.length === 0 ? 'Build demo agent' : 'Open inbox'} <ArrowRight className="h-3.5 w-3.5" /></button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/conversation" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"><Inbox className="h-4 w-4 text-sky-600" /><p className="mt-3 text-xs font-black text-slate-900">Inbox</p><p className="mt-1 text-[10px] text-slate-400">Resolve chats</p></Link>
            <Link href="/appointment" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"><CalendarCheck2 className="h-4 w-4 text-orange-600" /><p className="mt-3 text-xs font-black text-slate-900">Bookings</p><p className="mt-1 text-[10px] text-slate-400">View pipeline</p></Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
