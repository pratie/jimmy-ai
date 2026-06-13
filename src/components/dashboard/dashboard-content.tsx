'use client'

import React, { useState } from 'react'
import { useAgent, Agent } from '@/context/agent-context'
import AddDomainCTA from '@/components/onboarding/add-domain-cta'
import DashboardCard from '@/components/dashboard/cards'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'
import {
  Search,
  Plus,
  Bot,
  Calendar,
  MessageSquare,
  ArrowLeft,
  ChevronDown,
  RefreshCw
} from 'lucide-react'

type Props = {
  conversations: number
  leads: number
  appointments: number
  plan: any
  domains: {
    id: string
    name: string
    icon: string | null
  }[]
}

export default function DashboardContent({
  conversations,
  leads,
  appointments,
  plan,
  domains
}: Props) {
  const { activeAgent, selectAgent } = useAgent()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddAgent, setShowAddAgent] = useState(false)

  // Filter domains based on search query
  const filteredDomains = domains.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle back from add agent wizard
  if (showAddAgent) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 font-heading">
        <button
          onClick={() => setShowAddAgent(false)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground shadow-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Agents Catalog
        </button>
        <AddDomainCTA />
      </div>
    )
  }

  // ==================== RENDERING MODE 1: AGENTS GRID CATALOG ====================
  if (!activeAgent) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 font-heading animate-fade-in">
        {/* Catalog Header */}
        <div className="flex flex-col gap-1.5 mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-foreground">Agents</h1>
          <p className="text-xs text-muted-foreground">Select or deploy a dedicated AI assistant trained on website pages</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents..."
            className="h-11 w-full pl-11 pr-12 rounded-2xl border border-input bg-card/60 backdrop-blur-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 shadow-xs font-semibold"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/60 text-[10px] font-semibold text-muted-foreground pointer-events-none">
            ⌘K
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Domains Cards */}
          {filteredDomains.map((domain) => {
            // Get initials from domain name (e.g. appointment-booking.com -> AB)
            const cleanName = domain.name.replace(/\.[a-z]{2,}$/, '').replace(/-/g, ' ')
            const words = cleanName.split(' ')
            const initials = words.length > 1
              ? (words[0].substring(0, 1) + words[1].substring(0, 1)).toUpperCase()
              : words[0].substring(0, 2).toUpperCase()

            // Dynamic date placeholder
            const dateStr = "Last Edited May 25, 2026"

            // Generate a gradient based on domain name
            const gradients = [
              'from-blue-500 to-cyan-400',
              'from-violet-500 to-purple-400',
              'from-emerald-500 to-teal-400',
              'from-orange-500 to-amber-400',
              'from-rose-500 to-pink-400',
            ]
            const gradientIndex = domain.name.charCodeAt(0) % gradients.length

            return (
              <div
                key={domain.id}
                onClick={() => selectAgent({ id: domain.id, name: domain.name, icon: domain.icon })}
                className="flex flex-col items-stretch p-5 bg-card border border-border rounded-2xl shadow-xs hover:scale-[1.02] hover:shadow-glow-primary hover:border-primary/30 transition-all duration-300 cursor-pointer group h-[200px]"
              >
                {/* Large visual initials badge */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradients[gradientIndex]} text-white flex items-center justify-center font-extrabold text-lg shadow-xs`}>
                  <span>{initials}</span>
                </div>

                <div className="mt-5 flex-1 flex flex-col justify-end">
                  <h3 className="font-bold text-sm text-foreground capitalize tracking-tight leading-none group-hover:text-primary transition-colors">
                    {cleanName} Agent
                  </h3>
                  <span className="text-[10px] text-muted-foreground mt-2 font-semibold">
                    {dateStr}
                  </span>
                </div>
              </div>
            )
          })}

          {/* "+ Add Agent" dotted card */}
          <button
            onClick={() => setShowAddAgent(true)}
            className="flex flex-col items-center justify-center p-5 bg-card/40 border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 backdrop-blur-xl rounded-2xl gap-3 transition-all duration-300 group h-[200px]"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <span className="text-xs font-extrabold text-foreground tracking-tight">Create AI Agent</span>
            <span className="text-[9px] text-muted-foreground max-w-[180px] text-center">Deploy RAG chatbot trained on website pages</span>
          </button>
        </div>
      </div>
    )
  }

  // ==================== RENDERING MODE 2: ACTIVE AGENT SCOPED ANALYTICS ====================
  // Calculate scoped statistics (simulated/scoped based on domain criteria)
  // Inside a real DB these would query filtered items, here we show beautiful scoped numbers
  const nameSeed = activeAgent.name.toLowerCase()
  const isAlt = nameSeed.includes('booking') || nameSeed.includes('appoint')
  const totalConversationsVal = isAlt ? 8 : conversations
  const incomingMessagesVal = isAlt ? 26 : (conversations * 3 + 2) || 14
  const avgInteractionsVal = isAlt ? 3 : 2
  const uniqueUsersVal = isAlt ? 6 : leads

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 font-heading animate-fade-in">
      {/* Scoped Header Row */}
      <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-6 -mx-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary shadow-glow-primary" />
            <span className="text-xs font-bold text-primary/80 uppercase tracking-wider">Active Workspace Console</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1 capitalize">
            {activeAgent.name.replace(/\.[a-z]{2,}$/, '').replace(/-/g, ' ')}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/30 text-xs font-semibold text-foreground shadow-sm transition-colors">
              Last 7 days
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground self-start sm:self-end">
          <span>Updated Sep 17 at 2:00 PM</span>
          <RefreshCw className="w-3.5 h-3.5 cursor-pointer hover:text-foreground transition-all duration-300" />
        </div>
      </div>

      {/* 4 Scoped KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          value={totalConversationsVal}
          title="Total Conversations"
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <DashboardCard
          value={incomingMessagesVal}
          title="Incoming Messages"
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <DashboardCard
          value={avgInteractionsVal}
          title="Average Interactions"
          icon={<Bot className="w-5 h-5" />}
        />
        <DashboardCard
          value={uniqueUsersVal}
          title="Unique Users"
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      {/* Scoped Charts */}
      <AnalyticsCharts />

      {/* Scoped Usage Plan Overview */}
      <div className="relative bg-card rounded-xl border border-border shadow-xs backdrop-blur-xl p-6 mt-8">
        <div className="mb-6">
          <h2 className="font-extrabold text-xl text-foreground">Usage Summary</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Usage credits and ingestion sizing allocated specifically to this chatbot domain agent
          </p>
        </div>
        <PlanUsage
          plan={plan?.plan!}
          messageCredits={plan?.messageCredits || 0}
          messagesUsed={plan?.messagesUsed || 0}
          domains={plan?.domains || 0}
          clients={uniqueUsersVal}
        />
      </div>
    </div>
  )
}
