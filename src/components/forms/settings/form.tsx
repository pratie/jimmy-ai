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
      <div className="flex flex-col gap-5 rounded-2xl border border-sauce-grid bg-white p-6 shadow-shadow transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-bold text-xl text-sauce-black tracking-tight flex items-center gap-2">
              Agent Setup Progress
              <span className="text-sm font-medium px-2 py-0.5 bg-sauce-purple/10 text-sauce-purple rounded-full">
                {progressPercent}%
              </span>
            </h2>
            <p className="text-xs text-sauce-gray/60 font-medium">Complete these steps to launch your autonomous AI agent</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block w-32 h-1.5 bg-sauce-grid rounded-full overflow-hidden">
              <div
                className="h-full bg-sauce-purple transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl border-sauce-grid hover:bg-sauce-mint/30 transition-colors">
              <a href={`/preview/${id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Live Preview <ArrowRight className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {checklistItems.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={cn(
                "group flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-300",
                item.completed
                  ? "border-accent-green/20 bg-accent-green/5 hover:bg-accent-green/10"
                  : "border-sauce-grid bg-white hover:border-sauce-purple/30 hover:shadow-md",
                activeTab === item.key && !item.completed && "ring-2 ring-sauce-purple/20 border-sauce-purple/40"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  item.completed ? "bg-accent-green/20 text-accent-green" : "bg-sauce-grid text-sauce-gray/50 group-hover:bg-sauce-purple/10 group-hover:text-sauce-purple"
                )}>
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <CircleDashed className="w-4 h-4" />
                  )}
                </div>
                {item.completed && (
                  <span className="text-[10px] font-bold text-accent-green uppercase tracking-wider">Completed</span>
                )}
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-sauce-black">{item.label}</h3>
                <p className="text-[11px] text-sauce-gray/60 font-medium leading-tight">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabKey)}
        className="flex flex-col gap-6"
      >
        <TabsList className="inline-flex w-auto self-start gap-1 rounded-xl bg-sauce-grid/50 p-1 border border-sauce-grid/20">
          <TabsTrigger
            value="knowledge"
            className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm"
          >
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger
            value="behavior"
            className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm"
          >
            AI Behavior
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="domain"
            className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-sauce-purple data-[state=active]:shadow-sm"
          >
            Domain & Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="mt-0">
          <div className="flex flex-col gap-4 rounded-2xl border border-sauce-grid bg-white p-6 shadow-shadow">
            <h2 className="font-bold text-xl text-sauce-black tracking-tight">Knowledge Base</h2>
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
          <div className="flex flex-col gap-6 rounded-2xl border border-sauce-grid bg-white p-6 shadow-shadow">
            <div className="flex items-center justify-between border-b border-sauce-grid pb-4">
              <div className="space-y-1">
                <h2 className="font-bold text-xl text-sauce-black tracking-tight">AI Behavior</h2>
                <p className="text-xs text-sauce-gray/60 font-medium">Configure how your agent interacts with customers</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-sauce-purple hover:bg-sauce-purple/5">
                <a href={`/settings/${name}/advanced`}>Advanced Settings <ArrowRight className="ml-2 w-3 h-3" /></a>
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

          <div className="flex flex-col gap-4 rounded-2xl border border-sauce-grid bg-white p-6 shadow-shadow">
            <h2 className="font-bold text-xl text-sauce-black tracking-tight">Help Desk (FAQs)</h2>
            <HelpDesk id={id} />
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0">
          <div className="flex flex-col gap-6 rounded-2xl border border-sauce-grid bg-white p-6 shadow-shadow">
            <div className="flex items-center justify-between border-b border-sauce-grid pb-4">
              <div className="space-y-1">
                <h2 className="font-bold text-xl text-sauce-black tracking-tight">Appearance</h2>
                <p className="text-xs text-sauce-gray/60 font-medium">Customize your agent's visual identity</p>
              </div>
              <div className="flex gap-1.5 bg-sauce-purple/10 rounded-full px-3 py-1 text-[10px] items-center font-bold text-sauce-purple uppercase tracking-wider">
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
          <div className="flex flex-col gap-6 rounded-2xl border border-sauce-grid bg-white p-6 shadow-shadow">
            <h2 className="font-bold text-xl text-sauce-black tracking-tight border-b border-sauce-grid pb-4">Domain Settings</h2>
            <DomainUpdate name={name} register={register} errors={errors} />
          </div>
          <div className="flex flex-col gap-6 rounded-2xl border border-sauce-grid bg-white p-6 shadow-shadow">
            <h2 className="font-bold text-xl text-sauce-black tracking-tight border-b border-sauce-grid pb-4">Embed & Launch</h2>
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
          className="w-[100px] h-[50px]"
        >
          <Loader loading={loading}>Save</Loader>
        </Button>
      </div>
    </form>
  )
}

export default SettingsForm
