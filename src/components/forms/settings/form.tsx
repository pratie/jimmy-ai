'use client'
import { Separator } from '@/components/ui/separator'
import { useSettings } from '@/hooks/settings/use-settings'
import React, { useEffect, useState } from 'react'
import { DomainUpdate } from './domain-update'
import CodeSnippet from './code-snippet'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HelpDesk from './help-desk'
import AppearanceSettings from './appearance'
import { getPlanLimits } from '@/lib/plans'

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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,.035)] md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex items-center gap-2"><h2 className="text-base font-semibold text-slate-950">Launch readiness</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{completedSteps}/{totalSteps}</span></div><p className="mt-1 text-xs text-slate-500">Complete the essentials, then validate the visitor experience.</p></div>
          <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"><a href={`/preview/${id}`} target="_blank" rel="noopener noreferrer">Open test workspace <ArrowRight className="ml-2 h-3.5 w-3.5" /></a></Button>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${progressPercent}%` }} /></div>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {checklistItems.map((item) => <button key={item.key} type="button" onClick={() => setActiveTab(item.key)} className={cn('flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition', activeTab === item.key ? 'border-indigo-200 bg-indigo-50/70' : 'border-slate-200 hover:bg-slate-50')}><span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', item.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400')}><CheckCircle2 className="h-3.5 w-3.5" /></span><span><span className="block text-xs font-semibold text-slate-800">{item.label.replace(/^\d\)\s*/, '')}</span><span className="mt-0.5 block text-[10px] text-slate-400">{item.completed ? 'Ready' : item.description}</span></span></button>)}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabKey)}
        className="flex flex-col gap-6"
      >
        <TabsList className="inline-flex h-auto w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm md:w-auto">
          <TabsTrigger
            value="knowledge"
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 data-[state=active]:bg-[#111827] data-[state=active]:text-white"
          >
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger
            value="behavior"
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 data-[state=active]:bg-[#111827] data-[state=active]:text-white"
          >
            AI Behavior
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 data-[state=active]:bg-[#111827] data-[state=active]:text-white"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="domain"
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 data-[state=active]:bg-[#111827] data-[state=active]:text-white"
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
