'use client'
import { Separator } from '@/components/ui/separator'
import { useSettings } from '@/hooks/settings/use-settings'
import React, { useEffect, useState } from 'react'
import { DomainUpdate } from './domain-update'
import CodeSnippet from './code-snippet'
import PremiumBadge from '@/icons/premium-badge'
import EditChatbotIcon from './edit-chatbot-icon'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import KnowledgeBaseViewer from '@/components/settings/knowledge-base-viewer'
import { BotModeSelector } from '@/components/settings/bot-mode-selector'
import { BrandVoiceSettings } from '@/components/settings/brand-voice-settings'
import { onGetEmbeddingStatus } from '@/actions/firecrawl'
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HelpDesk from './help-desk'
import AppearanceSettings from './appearance'
import { getPlanLimits } from '@/lib/plans'
import { SpotlightCard } from '@/components/ui/spotlight-card'

const WelcomeMessage = dynamic(
  () => import('./greetings-message').then((props) => props.default),
  {
    ssr: false,
  }
)

type Props = {
  id: string
  name: string
  plan: any
  chatBot: {
    id: string
    icon: string | null
    welcomeMessage: string | null
    knowledgeBase: string | null
    knowledgeBaseStatus: string | null
    knowledgeBaseUpdatedAt: Date | null
    mode: string | null
    brandTone: string | null
    language: string | null
    theme?: any | null
  } | null
  trainingSourcesUsed?: number
  knowledgeBaseSizeMB?: number
}

type TabKey = 'knowledge' | 'behavior' | 'appearance' | 'domain'

const SettingsForm = ({ id, name, chatBot, plan, trainingSourcesUsed, knowledgeBaseSizeMB }: Props) => {
  const {
    register,
    onUpdateSettings,
    errors,
    onDeleteDomain,
    deleting,
    loading,
  } = useSettings(id)

  // Get plan limits
  const planLimits = getPlanLimits(plan)

  // Setup checklist state
  const [embedStatus, setEmbedStatus] = useState<'not_started' | 'processing' | 'completed' | 'failed'>('not_started')
  const [hasEmbeddings, setHasEmbeddings] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('knowledge')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab') as TabKey
      if (tabParam && ['knowledge', 'behavior', 'appearance', 'domain'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await onGetEmbeddingStatus(id)
          if (mounted && res?.status === 200 && res.data) {
            const status = res.data.status
            if (status === 'not_started' || status === 'processing' || status === 'completed' || status === 'failed') {
              setEmbedStatus(status)
            }
            setHasEmbeddings(!!res.data.hasEmbeddings)
          }
        } catch { }
      })()
    return () => { mounted = false }
  }, [id])

  const hasKB = !!chatBot?.knowledgeBase && chatBot.knowledgeBase.length >= 50
  const basicsDone = !!name && !!(chatBot?.icon)
  const kbDone = hasKB
  const trainDone = hasEmbeddings || embedStatus === 'completed'
  const behaviorDone = !!(chatBot?.mode) && !!(chatBot?.brandTone) && !!(chatBot?.language)

  const checklistItems: Array<{ key: TabKey; label: string; completed: boolean; description: string }> = [
    { key: 'knowledge', label: '1) Knowledge Base', completed: kbDone, description: 'Train your bot' },
    { key: 'behavior', label: '2) AI Behavior', completed: behaviorDone, description: 'Tune personality' },
    { key: 'domain', label: '3) Embed & Preview', completed: trainDone, description: 'Go live' },
  ]

  const totalSteps = checklistItems.length
  const completedSteps = checklistItems.filter(item => item.completed).length
  const progressPercent = Math.round((completedSteps / totalSteps) * 100)

  return (
    <form className="flex flex-col gap-8 pb-10" onSubmit={onUpdateSettings}>
      {/* Premium Setup Checklist */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-slate-300 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Circular Progress Ring */}
            <div className="relative flex items-center justify-center w-16 h-16 bg-slate-50 border border-slate-200 rounded-full shadow-inner">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 - (progressPercent / 100) * (2 * Math.PI * 26)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-900 tracking-tighter">
                {progressPercent}%
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="font-black text-xl text-slate-950 tracking-tight flex items-center gap-2">
                Agent Setup Progress
              </h2>
              <p className="text-xs text-slate-400 font-medium">Complete these steps to launch your autonomous AI agent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-all duration-300">
              <a href={`/preview/${id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Live Preview <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {checklistItems.map((item) => (
            <SpotlightCard
              key={item.key}
              spotlightColor={item.completed ? 'rgba(34, 197, 94, 0.08)' : 'rgba(0, 113, 227, 0.12)'}
              className={cn(
                "group cursor-pointer transition-all duration-300 border",
                item.completed
                  ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                  : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50",
                activeTab === item.key && !item.completed && "ring-2 ring-primary/30 border-primary/40"
              )}
              onClick={() => setActiveTab(item.key)}
            >
              <div className="flex flex-col gap-3 p-5 text-left">
                <div className="flex items-center justify-between w-full">
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    item.completed ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 animate-in zoom-in duration-300" />
                    ) : (
                      <CircleDashed className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                    )}
                  </div>
                  {item.completed && (
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Completed</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight transition-colors">{item.label}</h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-tight group-hover:text-slate-500 transition-colors">{item.description}</p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabKey)}
        className="flex flex-col gap-6"
      >
        <TabsList className="inline-flex h-auto w-full gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm md:w-auto">
          <TabsTrigger
            value="knowledge"
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-400 transition-all duration-300 hover:text-slate-700 data-[state=active]:bg-[#5b5ce2] data-[state=active]:text-white data-[state=active]:shadow-[0_4px_16px_rgba(91,92,226,0.3)]"
          >
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger
            value="behavior"
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-400 transition-all duration-300 hover:text-slate-700 data-[state=active]:bg-[#5b5ce2] data-[state=active]:text-white data-[state=active]:shadow-[0_4px_16px_rgba(91,92,226,0.3)]"
          >
            AI Behavior
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-400 transition-all duration-300 hover:text-slate-700 data-[state=active]:bg-[#5b5ce2] data-[state=active]:text-white data-[state=active]:shadow-[0_4px_16px_rgba(91,92,226,0.3)]"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="domain"
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-400 transition-all duration-300 hover:text-slate-700 data-[state=active]:bg-[#5b5ce2] data-[state=active]:text-white data-[state=active]:shadow-[0_4px_16px_rgba(91,92,226,0.3)]"
          >
            Domain & Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="mt-0">
          <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] md:p-8">
            <h2 className="font-black text-xl text-slate-950 tracking-tight">Knowledge Base</h2>
            <KnowledgeBaseViewer
              domainId={id}
              domainName={name}
              knowledgeBase={chatBot?.knowledgeBase || null}
              status={chatBot?.knowledgeBaseStatus || null}
              updatedAt={chatBot?.knowledgeBaseUpdatedAt || null}
              plan={plan}
              trainingSourcesUsed={trainingSourcesUsed || 0}
              trainingSourcesLimit={planLimits.trainingSources}
              kbSizeMB={knowledgeBaseSizeMB || 0}
              kbSizeLimit={planLimits.knowledgeBaseMB}
            />
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="mt-0 space-y-6">
          <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] md:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <h2 className="font-black text-xl text-slate-950 tracking-tight">AI Behavior</h2>
                <p className="text-xs text-slate-400 font-medium">Configure how your agent interacts with customers</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/10">
                <a href={`/settings/${name}/advanced`}>Advanced Settings <ArrowRight className="ml-2 w-3.5 h-3.5" /></a>
              </Button>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="col-span-1">
                <BotModeSelector
                  domainId={id}
                  currentMode={chatBot?.mode || null}
                />
              </div>
              <div className="col-span-1">
                <BrandVoiceSettings
                  domainId={id}
                  currentBrandTone={chatBot?.brandTone || null}
                  currentLanguage={chatBot?.language || null}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] md:p-8">
            <h2 className="font-black text-xl text-slate-950 tracking-tight border-b border-slate-100 pb-4">Help Desk (FAQs)</h2>
            <HelpDesk id={id} />
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0">
          <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] md:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <h2 className="font-black text-xl text-slate-950 tracking-tight">Appearance</h2>
                <p className="text-xs text-slate-400 font-medium">Customize your agent&apos;s visual identity</p>
              </div>
              <div className="flex gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 text-[10px] items-center font-black text-primary uppercase tracking-widest">
                <PremiumBadge />
                Enterprise
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
                <EditChatbotIcon chatBot={chatBot} register={register} errors={errors} />
                <WelcomeMessage message={chatBot?.welcomeMessage!} register={register} errors={errors} />
              </div>
              <div className="col-span-1 lg:col-span-2">
                <AppearanceSettings domainId={id} current={chatBot?.theme as any} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="domain" className="mt-0 space-y-6">
          <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] md:p-8">
            <h2 className="font-black text-xl text-slate-950 tracking-tight border-b border-slate-100 pb-5">Domain Settings</h2>
            <DomainUpdate name={name} register={register} errors={errors} />
          </div>
          <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] md:p-8">
            <h2 className="font-black text-xl text-slate-950 tracking-tight border-b border-slate-100 pb-5">Embed & Launch</h2>
            <CodeSnippet id={id} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-5 justify-end">
        <Button
          onClick={onDeleteDomain}
          variant="destructive"
          type="button"
          className="px-10 h-[50px]"
        >
          <Loader loading={deleting}>Delete Domain</Loader>
        </Button>
        <Button
          type="submit"
          className="w-[100px] h-[50px] bg-[#5b5ce2] hover:bg-[#4f50d8] text-white font-semibold shadow-[0_4px_12px_rgba(91,92,226,0.3)]"
        >
          <Loader loading={loading}>Save</Loader>
        </Button>
      </div>
    </form>
  )
}

export default SettingsForm
