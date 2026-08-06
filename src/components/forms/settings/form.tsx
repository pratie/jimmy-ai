'use client'
import { useSettings } from '@/hooks/settings/use-settings'
import React, { useEffect, useState } from 'react'
import { DomainUpdate } from './domain-update'
import CodeSnippet from './code-snippet'
import EditChatbotIcon from './edit-chatbot-icon'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import KnowledgeBaseViewer, { type KnowledgeSummary } from '@/components/settings/knowledge-base-viewer'
import { onGetEmbeddingStatus } from '@/actions/firecrawl'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HelpDesk from './help-desk'
import TestAndCustomise from '@/components/settings/test-and-customise'
import { getPlanLimits } from '@/lib/plans'

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
  /** Live counts from the knowledge tables — the only honest source of KB state. */
  knowledge: KnowledgeSummary
  trainingSourcesUsed?: number
  knowledgeBaseSizeMB?: number
}

type TabKey = 'knowledge' | 'behavior' | 'appearance' | 'domain'

const TAB_KEYS: TabKey[] = ['knowledge', 'behavior', 'appearance', 'domain']

/** One card. Every panel on this screen is made of these and nothing else. */
const Section = ({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-black tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-[12.5px] leading-5 text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </section>
)

const SettingsForm = ({
  id,
  name,
  chatBot,
  plan,
  knowledge,
  trainingSourcesUsed,
  knowledgeBaseSizeMB,
}: Props) => {
  const { register, onUpdateSettings, errors, loading } = useSettings(id)

  const planLimits = getPlanLimits(plan)

  const [embedStatus, setEmbedStatus] = useState<'not_started' | 'processing' | 'completed' | 'failed'>('not_started')
  const [hasEmbeddings, setHasEmbeddings] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('knowledge')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab') as TabKey
      if (tabParam && TAB_KEYS.includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  /**
   * Keeps the open tab in the URL.
   *
   * `activeTab` is component state defaulting to `'knowledge'`, so any remount
   * — a `router.refresh()` after a save, a hot reload, a back/forward — used to
   * silently return the user to the first tab. Writing it to the URL means the
   * mount effect above restores where they actually were, and the tab becomes
   * linkable. `replaceState` rather than a router push: this is not a
   * navigation and should not stack history entries.
   */
  const selectTab = React.useCallback((value: TabKey) => {
    setActiveTab(value)
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.set('tab', value)
    window.history.replaceState(window.history.state, '', url)
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

  // Indexed chunks, not the dead `chatBot.knowledgeBase` blob: that field is
  // permanently null under the current schema, so this step could never be
  // ticked no matter how much content the client actually had.
  const kbDone = knowledge.chunks > 0
  const trainDone = hasEmbeddings || embedStatus === 'completed'
  const behaviorDone = !!chatBot?.mode && !!chatBot?.brandTone && !!chatBot?.language

  /**
   * The tab strip is the only navigation on this screen.
   *
   * There used to be a "launch readiness 2/3" card above it with its own three
   * step buttons, which meant two navigations to four places and a percentage
   * bar restating what the tabs could say themselves. Readiness now rides
   * inside the nav as a dot per destination: solid when that piece is done,
   * hollow when it still needs the user. `done: null` is a destination with
   * nothing to complete — Test & customise is a place you go, not a box you
   * tick — and it gets no dot rather than a permanently empty one.
   */
  const tabs: Array<{ key: TabKey; label: string; done: boolean | null; todo: string }> = [
    { key: 'knowledge', label: 'Knowledge base', done: kbDone, todo: 'No content indexed yet' },
    { key: 'behavior', label: 'AI behaviour', done: behaviorDone, todo: 'Personality not set yet' },
    { key: 'appearance', label: 'Test & customise', done: null, todo: '' },
    { key: 'domain', label: 'Domain & embed', done: trainDone, todo: 'Not trained and installed yet' },
  ]

  return (
    /**
     * A div, not a form — deliberately.
     *
     * This used to wrap everything, including the tab panels. The Test &
     * customise panel contains a real chat whose composer is its own `<form>`,
     * and a submit from it bubbled up and fired `onUpdateSettings`, which ends
     * in `reset()` + `router.refresh()`. `activeTab` is component state
     * defaulting to `'knowledge'`, so the remount that followed threw the user
     * out of the panel and back to the Knowledge Base tab — mid-conversation,
     * after a couple of messages.
     *
     * Guarding it with `stopPropagation` treated the symptom and still left a
     * nested form, which is invalid HTML the moment either panel is
     * server-rendered. Each card that actually has fields to save now owns its
     * own form instead, so nothing that isn't a settings field can submit one.
     */
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-black tracking-tight text-slate-900">{name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configuration — what the assistant knows, how it speaks, and where it lives.
          </p>
        </div>
        <a
          href={`/preview/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-900 transition-colors hover:bg-slate-50"
        >
          Open test workspace
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => selectTab(value as TabKey)} className="space-y-5">
        {/* Two columns on a phone, one row from `sm` up. A scrolling strip hid
            the last destination behind an edge nobody knew to swipe. */}
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1 sm:flex sm:w-auto sm:justify-start">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              title={tab.done === false ? tab.todo : undefined}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-bold text-slate-500 transition-colors',
                'hover:text-slate-900 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-none'
              )}
            >
              {tab.done !== null && (
                <span
                  aria-hidden
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    tab.done ? 'bg-emerald-500' : 'bg-amber-400'
                  )}
                />
              )}
              <span className="truncate">{tab.label}</span>
              {tab.done === false && <span className="sr-only">— {tab.todo}</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="knowledge" className="mt-0">
          <Section
            title="Knowledge base"
            description="Everything the assistant is allowed to answer from. Nothing else gets said."
          >
            <KnowledgeBaseViewer
              domainId={id}
              domainName={name}
              knowledge={knowledge}
              trainingSourcesUsed={trainingSourcesUsed || 0}
              trainingSourcesLimit={planLimits.trainingSources}
              kbSizeMB={knowledgeBaseSizeMB || 0}
              kbSizeLimit={planLimits.knowledgeBaseMB}
            />
          </Section>
        </TabsContent>

        <TabsContent value="behavior" className="mt-0 space-y-3">
          <Section
            title="AI behaviour"
            description="How the agent handles a visitor once it has something to say."
            action={
              <a
                href={`/settings/${name}/advanced`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-900 transition-colors hover:bg-slate-50"
              >
                Advanced settings
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            }
          >
            {/* Mode and brand voice used to live here in their own widgets, and
                neither ever saved: both called their action with the arguments
                reversed — `onUpdateBotMode(mode, domainId)` against a signature
                of `(workspaceId, mode)` — so the mode string arrived as the
                workspace id, resolved to nothing, and every attempt returned
                400. They now live in Test & customise, called correctly and
                next to a chat that shows what they do. */}
            <p className="text-[13px] leading-6 text-slate-500">
              How the assistant speaks and what it is trying to achieve are set in{' '}
              <button
                type="button"
                onClick={() => selectTab('appearance')}
                className="font-bold text-[#5b5ce2] underline underline-offset-2"
              >
                Test &amp; customise
              </button>
              , where you can hear the difference straight away. This tab holds the deeper
              controls: qualifying questions and curated answers.
            </p>
          </Section>

          <Section
            title="Help desk"
            description="Questions you want answered a particular way, every time."
          >
            <HelpDesk id={id} />
          </Section>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0 space-y-3">
          <Section
            title="Test & customise"
            description="Talk to the assistant and change how it looks, side by side."
          >
            <TestAndCustomise
              workspaceId={id}
              assistantName={name}
              currentTheme={chatBot?.theme as any}
              currentWelcomeMessage={chatBot?.welcomeMessage ?? null}
              currentMode={chatBot?.mode ?? null}
              currentBrandTone={chatBot?.brandTone ?? null}
              currentLanguage={chatBot?.language ?? null}
              knowledgeChunks={knowledge.chunks}
            />
          </Section>

          {/* The icon uploads through the settings form rather than the panel,
              so it carries its own form and its own Save. One button per thing
              it saves — the previous single Save at the foot of the page gave
              no clue which of four tabs it was acting on. */}
          <Section
            title="Chat icon"
            description="The avatar visitors see on the bubble and beside every reply."
          >
            <form onSubmit={onUpdateSettings}>
              <EditChatbotIcon chatBot={chatBot} register={register} errors={errors} />
              <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                <Button
                  type="submit"
                  className="h-9 rounded-lg bg-[#5b5ce2] px-4 text-[13px] font-bold text-white hover:bg-[#4c4dd6]"
                >
                  <Loader loading={loading}>Save icon</Loader>
                </Button>
              </div>
            </form>
          </Section>
        </TabsContent>

        <TabsContent value="domain" className="mt-0 space-y-3">
          <Section
            title="Domain"
            description="The site this assistant belongs to."
          >
            <form onSubmit={onUpdateSettings}>
              <DomainUpdate name={name} register={register} errors={errors} />
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                {/* Deleting lives on the client page now, one click from anywhere.
                    The link keeps this a dead end rather than a second, differently
                    guarded way to do the same destructive thing. */}
                <a
                  href={`/clients/${id}`}
                  className="text-[12.5px] font-semibold text-slate-400 underline underline-offset-2 hover:text-rose-600"
                >
                  Delete this client
                </a>
                <Button
                  type="submit"
                  className="h-9 rounded-lg bg-[#5b5ce2] px-4 text-[13px] font-bold text-white hover:bg-[#4c4dd6]"
                >
                  <Loader loading={loading}>Save</Loader>
                </Button>
              </div>
            </form>
          </Section>

          <Section
            title="Embed & launch"
            description="Paste this once into the site’s HTML. It stays current on its own."
          >
            <CodeSnippet id={id} />
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsForm
