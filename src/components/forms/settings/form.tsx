'use client'

import React, { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'

import { onGetEmbeddingStatus } from '@/actions/firecrawl'
import CodeSnippet from './code-snippet'
import { DomainUpdate } from './domain-update'
import EditChatbotIcon from './edit-chatbot-icon'
import HelpDesk from './help-desk'
import KnowledgeBaseViewer, { type KnowledgeSummary } from '@/components/settings/knowledge-base-viewer'
import TestAndCustomise from '@/components/settings/test-and-customise'
import { Loader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/settings/use-settings'
import { getPlanLimits } from '@/lib/plans'
import { cn } from '@/lib/utils'

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

/**
 * One client, two places to be.
 *
 * There used to be four tabs — Knowledge base, AI behaviour, Test & customise,
 * Domain & embed — and the assistant you were configuring only appeared on one
 * of them. Everything that shapes a reply now lives in a single workspace with
 * the live chat pinned beside it, so a change and its effect are never a
 * navigation apart. Behaviour, embed and the domain field were sections, not
 * destinations, and they are sections now.
 *
 * Knowledge stays its own view. Managing sources is a different job from tuning
 * an assistant, it needs the full width, and it is the one place where the chat
 * beside it would have nothing to say.
 */

type ViewKey = 'assistant' | 'knowledge'

/** The old four tabs are still linked from elsewhere and sit in people's
 *  history, so every one of them still lands somewhere sensible. */
const VIEW_ALIASES: Record<string, ViewKey> = {
  assistant: 'assistant',
  behavior: 'assistant',
  appearance: 'assistant',
  domain: 'assistant',
  knowledge: 'knowledge',
}

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
  const [view, setView] = useState<ViewKey>('assistant')
  const [deepLinkSection, setDeepLinkSection] = useState<
    'appearance' | 'embed' | undefined
  >(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const param = new URLSearchParams(window.location.search).get('tab')
    if (param && VIEW_ALIASES[param]) setView(VIEW_ALIASES[param])
    // Old tab links promised a specific place, so open that section rather
    // than landing on the workspace default.
    if (param === 'domain') setDeepLinkSection('embed')
    if (param === 'appearance') setDeepLinkSection('appearance')
  }, [])

  /**
   * Keeps the open view in the URL.
   *
   * `view` is component state, so any remount — a `router.refresh()` after a
   * save, a hot reload, a back/forward — used to silently return the user to the
   * first tab. Writing it to the URL means the mount effect above restores where
   * they actually were. `replaceState` rather than a router push: this is not a
   * navigation and should not stack history entries.
   */
  const selectView = React.useCallback((next: ViewKey) => {
    setView(next)
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.set('tab', next)
    window.history.replaceState(window.history.state, '', url)
  }, [])

  const showKnowledge = React.useCallback(() => selectView('knowledge'), [selectView])

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
  // permanently null under the current schema, so this could never be ticked no
  // matter how much content the client actually had.
  const kbDone = knowledge.chunks > 0
  const trained = hasEmbeddings || embedStatus === 'completed'

  const views: { key: ViewKey; label: string; needsAttention: boolean }[] = [
    { key: 'assistant', label: 'Assistant', needsAttention: false },
    { key: 'knowledge', label: 'Knowledge', needsAttention: !kbDone || !trained },
  ]

  return (
    /**
     * A div, not a form — deliberately.
     *
     * This used to wrap everything. The workspace contains a real chat whose
     * composer is its own `<form>`, and a submit from it bubbled up and fired
     * `onUpdateSettings`, which ends in `reset()` + `router.refresh()` — throwing
     * the user out of the panel mid-conversation. Each card that actually has
     * fields to save owns its own form instead.
     */
    <div className="flex flex-col gap-5 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{name}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Tune the assistant on the left, talk to it on the right.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            role="tablist"
            aria-label="Client workspace"
            className="flex gap-1 rounded-xl border border-border bg-muted/50 p-1"
          >
            {views.map((entry) => {
              const active = view === entry.key
              return (
                <button
                  key={entry.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectView(entry.key)}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition-[background-color,color,box-shadow] duration-150 motion-reduce:transition-none',
                    active
                      ? 'bg-card text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {entry.label}
                  {entry.needsAttention && (
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              )
            })}
          </div>

          <a
            href={`/preview/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12.5px] font-semibold text-foreground transition-colors duration-150 hover:bg-muted"
          >
            Full-screen test
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {view === 'assistant' ? (
        <TestAndCustomise
          workspaceId={id}
          assistantName={name}
          currentTheme={chatBot?.theme as any}
          currentWelcomeMessage={chatBot?.welcomeMessage ?? null}
          currentMode={chatBot?.mode ?? null}
          currentBrandTone={chatBot?.brandTone ?? null}
          currentLanguage={chatBot?.language ?? null}
          knowledgeChunks={knowledge.chunks}
          advancedHref={`/settings/${name}/advanced`}
          onManageKnowledge={showKnowledge}
          initialSection={deepLinkSection}
          helpDeskSlot={<HelpDesk id={id} />}
          embedSlot={<CodeSnippet id={id} />}
          identitySlot={
            /* Name and avatar save through the settings form the page already
               owns, so they carry their own submit rather than joining the
               workspace's draft bar. */
            <form onSubmit={onUpdateSettings} className="flex flex-col gap-4 border-t border-border pt-4">
              <DomainUpdate name={name} register={register} errors={errors} />
              <EditChatbotIcon chatBot={chatBot} register={register} errors={errors} />
              <div className="flex items-center justify-between gap-3">
                {/* Deleting lives on the client page, one click from anywhere. The
                    link keeps this a dead end rather than a second, differently
                    guarded way to do the same destructive thing. */}
                <a
                  href={`/clients/${id}`}
                  className="text-[11.5px] font-medium text-muted-foreground/70 underline underline-offset-2 transition-colors hover:text-rose-600"
                >
                  Delete this client
                </a>
                <Button
                  type="submit"
                  className="h-8 rounded-lg bg-primary px-3.5 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Loader loading={loading}>Save identity</Loader>
                </Button>
              </div>
            </form>
          }
        />
      ) : (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Knowledge base</h2>
              <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground">
                Everything the assistant is allowed to answer from. Nothing else gets said.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <KnowledgeBaseViewer
              domainId={id}
              domainName={name}
              knowledge={knowledge}
              trainingSourcesUsed={trainingSourcesUsed || 0}
              trainingSourcesLimit={planLimits.trainingSources}
              kbSizeMB={knowledgeBaseSizeMB || 0}
              kbSizeLimit={planLimits.knowledgeBaseMB}
            />
          </div>
        </section>
      )}
    </div>
  )
}

export default SettingsForm
