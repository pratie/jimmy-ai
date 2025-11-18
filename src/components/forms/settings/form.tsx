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
import AppearanceSettings from './appearance'
import { CheckCircle2, CircleDashed } from 'lucide-react'
import HelpDesk from './help-desk'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const WelcomeMessage = dynamic(
  () => import('./greetings-message').then((props) => props.default),
  {
    ssr: false,
  }
)

import { PlanType, getPlanLimits } from '@/lib/plans'

type Props = {
  id: string
  name: string
  plan: PlanType
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
    ;(async () => {
      try {
        const res = await onGetEmbeddingStatus(id)
        if (mounted && res?.status === 200 && res.data) {
          const status = res.data.status
          if (status === 'not_started' || status === 'processing' || status === 'completed' || status === 'failed') {
            setEmbedStatus(status)
          }
          setHasEmbeddings(!!res.data.hasEmbeddings)
        }
      } catch {}
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

  return (
    <form className="flex flex-col gap-8 pb-10" onSubmit={onUpdateSettings}>
      {/* Setup Checklist */}
      <div className="flex flex-col gap-2 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-sauce-black">Setup Checklist</h2>
          <Button asChild variant="outline" size="sm">
            <a href={`/preview/${id}`} target="_blank" rel="noopener noreferrer">Live Preview ↗</a>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2 mt-1 md:grid-cols-3">
          {checklistItems.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className="flex items-center justify-between rounded-md border border-sauce-cyan/30 bg-white px-2.5 py-1.5 text-left text-xs transition hover:bg-sauce-mint/20"
            >
              <div className="flex items-center gap-1.5 font-medium text-sauce-black">
                {item.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                ) : (
                  <CircleDashed className="w-3.5 h-3.5 text-sauce-gray" />
                )}
                <span>{item.label}</span>
              </div>
              <span className="text-[10px] text-sauce-gray">{item.description}</span>
            </button>
          ))}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabKey)}
        className="flex flex-col gap-6"
      >
        <TabsList className="flex w-full flex-wrap items-center gap-2 rounded-2xl bg-muted/60 p-1">
          <TabsTrigger
            value="knowledge"
            className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:bg-white"
          >
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger
            value="behavior"
            className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:bg-white"
          >
            AI Behavior
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:bg-white"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="domain"
            className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:bg-white"
          >
            Domain & Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="mt-0">
          <div className="flex flex-col gap-2.5 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3.5 shadow-sm">
            <h2 className="font-semibold text-lg text-sauce-black">Knowledge Base</h2>
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

        <TabsContent value="behavior" className="mt-0 space-y-5">
          <div className="flex flex-col gap-2.5 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-sauce-black">AI Behavior Settings</h2>
              <a
                href={`/settings/${name}/advanced`}
                className="text-xs underline text-sauce-black hover:text-sauce-purple"
              >
                Advanced settings ↗
              </a>
            </div>
            <div className="grid gap-6 mt-1 md:grid-cols-2">
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

          <div className="flex flex-col gap-2.5 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3.5 shadow-sm">
            <h2 className="font-semibold text-lg text-sauce-black">FAQs</h2>
            <HelpDesk id={id} />
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0">
          <div className="flex flex-col gap-2.5 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3.5 shadow-sm">
            <div className="flex gap-3 items-center">
              <h2 className="font-semibold text-lg text-sauce-black">Chatbot Settings</h2>
              <div className="flex gap-1 bg-sauce-purple/10 rounded-full px-2.5 py-0.5 text-[10px] items-center font-semibold text-sauce-purple">
                <PremiumBadge />
                Premium
              </div>
            </div>
            <Separator orientation="horizontal" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="col-span-1 flex flex-col gap-5 order-last md:order-first">
                <EditChatbotIcon chatBot={chatBot} register={register} errors={errors} />
                <WelcomeMessage message={chatBot?.welcomeMessage!} register={register} errors={errors} />
              </div>
              <div className="col-span-1">
                <AppearanceSettings domainId={id} current={chatBot?.theme as any} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="domain" className="mt-0 space-y-5">
          <div className="flex flex-col gap-2.5 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3.5 shadow-sm">
            <h2 className="font-semibold text-lg text-sauce-black">Domain Settings</h2>
            <DomainUpdate name={name} register={register} errors={errors} />
          </div>
          <div className="flex flex-col gap-2.5 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3.5 shadow-sm">
            <h2 className="font-semibold text-lg text-sauce-black">Embed & Preview</h2>
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
