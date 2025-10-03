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
import { CheckCircle2, CircleDashed, ExternalLink } from 'lucide-react'

const WelcomeMessage = dynamic(
  () => import('./greetings-message').then((props) => props.default),
  {
    ssr: false,
  }
)

type Props = {
  id: string
  name: string
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
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
  } | null
}

const SettingsForm = ({ id, name, chatBot, plan }: Props) => {
  const {
    register,
    onUpdateSettings,
    errors,
    onDeleteDomain,
    deleting,
    loading,
  } = useSettings(id)
  
  // Setup checklist state
  const [embedStatus, setEmbedStatus] = useState<'not_started' | 'processing' | 'completed' | 'failed'>('not_started')
  const [hasEmbeddings, setHasEmbeddings] = useState(false)

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
  return (
    <form
      className="flex flex-col gap-8 pb-10"
      onSubmit={onUpdateSettings}
    >
      {/* Setup Checklist */}
      <div className="flex flex-col gap-2 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3 shadow-sm">
        <h2 className="font-semibold text-lg text-sauce-black">Setup Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
          <a href="#knowledge-base" className="flex items-center justify-between rounded-md border border-sauce-cyan/30 bg-white px-2.5 py-1.5 hover:bg-sauce-mint/20 transition text-xs">
            <div className="flex items-center gap-1.5 font-medium text-sauce-black">
              {kbDone ? <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" /> : <CircleDashed className="w-3.5 h-3.5 text-sauce-gray" />}
              <span>1) Knowledge Base</span>
            </div>
            <ExternalLink className="w-3 h-3 text-sauce-gray" />
          </a>
          <a href="#ai-behavior" className="flex items-center justify-between rounded-md border border-sauce-cyan/30 bg-white px-2.5 py-1.5 hover:bg-sauce-mint/20 transition text-xs">
            <div className="flex items-center gap-1.5 font-medium text-sauce-black">
              {behaviorDone ? <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" /> : <CircleDashed className="w-3.5 h-3.5 text-sauce-gray" />}
              <span>2) AI Behavior</span>
            </div>
            <ExternalLink className="w-3 h-3 text-sauce-gray" />
          </a>
          <a href="#embed" className="flex items-center justify-between rounded-md border border-sauce-cyan/30 bg-white px-2.5 py-1.5 hover:bg-sauce-mint/20 transition text-xs">
            <div className="flex items-center gap-1.5 font-medium text-sauce-black">
              {trainDone ? <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" /> : <CircleDashed className="w-3.5 h-3.5 text-sauce-gray" />}
              <span>3) Embed & Preview</span>
            </div>
            <ExternalLink className="w-3 h-3 text-sauce-gray" />
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3.5 shadow-sm">
        <h2 id="domain-basics" className="font-semibold text-lg text-sauce-black">Domain Settings</h2>
        <DomainUpdate
          name={name}
          register={register}
          errors={errors}
        />
        <div id="embed" />
        <CodeSnippet id={id} />
      </div>
      <div className="flex flex-col gap-2.5 mt-5 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3.5 shadow-sm">
        <div className="flex gap-3 items-center">
          <h2 className="font-semibold text-lg text-sauce-black">Chatbot Settings</h2>
          <div className="flex gap-1 bg-sauce-purple/10 rounded-full px-2.5 py-0.5 text-[10px] items-center font-semibold text-sauce-purple">
            <PremiumBadge />
            Premium
          </div>
        </div>
        <Separator orientation="horizontal" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="col-span-1 flex flex-col gap-5 order-last md:order-first">
            <EditChatbotIcon
              chatBot={chatBot}
              register={register}
              errors={errors}
            />
            <WelcomeMessage
              message={chatBot?.welcomeMessage!}
              register={register}
              errors={errors}
            />
          </div>
          <div id="knowledge-base" className="col-span-1">
            <KnowledgeBaseViewer
              domainId={id}
              domainName={name}
              knowledgeBase={chatBot?.knowledgeBase || null}
              status={chatBot?.knowledgeBaseStatus || null}
              updatedAt={chatBot?.knowledgeBaseUpdatedAt || null}
            />
          </div>
        </div>

      </div>

      {/* AI Mode & Brand Voice Settings */}
      <div className="flex flex-col gap-2.5 mt-5 rounded-lg border border-sauce-cyan/40 bg-white px-4 py-3.5 shadow-sm">
        <h2 id="ai-behavior" className="font-semibold text-lg text-sauce-black">AI Behavior Settings</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-1">
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
