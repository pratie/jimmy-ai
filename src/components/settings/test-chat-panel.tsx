'use client'

import * as React from 'react'
import { Loader2, RotateCcw, TriangleAlert, X } from 'lucide-react'

import { onGetPreviewKey } from '@/actions/settings'
import { BotWindow } from '@/components/chatbot/window'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import { cn } from '@/lib/utils'

import type { Theme } from './agent-theme'

/**
 * The live test chat — the half of the workspace an agency actually lives in
 * while demoing, so it is pinned to the viewport and never scrolls away.
 *
 * The chat is real, not a mock. It runs through `useChatBot` against a
 * `preview` deployment key, which is the same resolved, rate-limited path an
 * installed widget takes — the website widget key is origin-locked to the
 * client's own domain and would 403 here, and a preview deployment also serves
 * the draft assistant, which is what an agency needs to try before publishing.
 * That means a preview answer is the answer a visitor gets.
 *
 * Nothing about how it talks to the server changed in the redesign: the same
 * hook, the same key, the same draft-theme override on the opening bubble.
 */

/** What a prospective customer actually opens with — price, fit and next step —
 *  so a test conversation exercises the path a real lead takes. */
const STARTERS = [
  'How much does it cost?',
  'Do you work with businesses like mine?',
  'What makes you different?',
  'Can I speak to someone this week?',
]

const QUIET_BUTTON =
  'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:opacity-50'

type PreviewChatProps = {
  previewKey: string
  assistantName: string
  theme: Theme
  welcomeMessage: string
  registerClear: (clear: () => void) => void
  onConversationChange: (hasConversation: boolean) => void
}

/**
 * Split out so `useChatBot` is only ever mounted with a real preview key —
 * without a key the hook falls back to waiting for a `postMessage` from an
 * embedding page that does not exist here, and would sit loading forever.
 */
function PreviewChat({
  previewKey,
  assistantName,
  theme,
  welcomeMessage,
  registerClear,
  onConversationChange,
}: PreviewChatProps) {
  const {
    register,
    setValue,
    watch,
    onStartChatting,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    onChats,
    setOnChats,
    errors,
  } = useChatBot({ domainId: previewKey, defaultOpen: true, disablePostMessage: true })

  const ask = React.useCallback(
    (question: string) => {
      // `setValue` writes react-hook-form's values synchronously, so the submit
      // handler invoked next already sees the question.
      setValue('content', question, { shouldValidate: true })
      void onStartChatting()
    },
    [setValue, onStartChatting]
  )

  React.useEffect(() => {
    // Emptying the transcript is enough: the welcome bubble is re-derived from
    // the draft below, and the next send opens a new chat session server-side.
    registerClear(() => {
      setOnChats([])
      setValue('content', '')
    })
  }, [registerClear, setOnChats, setValue])

  // The hook seeds the transcript with the *saved* welcome message. The draft is
  // what the agency is editing, so the opening bubble is swapped for it; every
  // later message is left exactly as the assistant produced it.
  const chats = React.useMemo(() => {
    const draft = welcomeMessage.trim()
    const seeded = onChats.length > 0 && onChats[0].role === 'assistant'
    if (!draft) return onChats
    if (seeded) return [{ ...onChats[0], content: draft }, ...onChats.slice(1)]
    return [{ role: 'assistant' as const, content: draft }, ...onChats]
  }, [onChats, welcomeMessage])

  const hasStarted = onChats.some((chat) => chat.role === 'user')

  React.useEffect(() => {
    onConversationChange(hasStarted)
  }, [hasStarted, onConversationChange])

  if (loading) return <PanelMessage>Loading the preview…</PanelMessage>

  if (!currentBot)
    return (
      <PanelMessage spinner={false}>
        The preview could not load this assistant. Check that the client still has an assistant
        under Knowledge, then reload this page.
      </PanelMessage>
    )

  return (
    // BotWindow's composer is a real `<form>`. Anything this panel is nested
    // inside must not receive that submit, or a chat send would fire a settings
    // save too.
    <div
      className="flex min-h-0 flex-1 flex-col gap-3"
      onSubmit={(event) => event.stopPropagation()}
    >
      <div className="min-h-0 flex-1">
        <BotWindow
          errors={errors}
          helpdesk={currentBot.helpdesk || []}
          domainName={currentBot.name || assistantName}
          ref={messageWindowRef}
          help={currentBot.chatBot?.helpdesk}
          theme={currentBot.chatBot?.background}
          textColor={theme.text}
          // The draft theme, not the saved one: this is what makes a colour
          // change visible before Save.
          themeConfig={theme}
          chats={chats}
          register={register}
          watch={watch}
          onChat={onStartChatting}
          onResponding={onAiTyping}
          botIcon={currentBot.chatBot?.icon || currentBot.icon || null}
          // No `onSuggestion`: BotWindow's built-in chips only fill the input,
          // while the starters below actually send.
        />
      </div>

      {!hasStarted && (
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {STARTERS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => ask(question)}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground motion-safe:animate-in motion-safe:fade-in"
            >
              {question}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PanelMessage({
  children,
  spinner = true,
}: {
  children: React.ReactNode
  spinner?: boolean
}) {
  return (
    <div className="grid min-h-0 flex-1 place-items-center px-8 text-center text-[13px] leading-6 text-muted-foreground">
      <span className="inline-flex items-center gap-2">
        {spinner && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </span>
    </div>
  )
}

export type TestChatPanelProps = {
  /** The client workspace id — what `onGetPreviewKey` takes, not a deployment key. */
  workspaceId: string
  assistantName: string
  /** Draft theme, so a colour change shows before it is saved. */
  theme: Theme
  /** Draft welcome message, for the same reason. */
  welcomeMessage: string
  /** Indexed chunks. Zero means the assistant has nothing to answer from yet. */
  knowledgeChunks: number
  /** True once a behaviour write has landed — behaviour only applies to the
   *  *next* message, so the panel offers a fresh transcript instead of
   *  pretending the bubbles on screen changed. */
  behaviourApplied?: boolean
  onBehaviourNoticeCleared?: () => void
  /** Present below `lg`, where the panel is a slide-over rather than a column. */
  onClose?: () => void
  className?: string
}

export default function TestChatPanel({
  workspaceId,
  assistantName,
  theme,
  welcomeMessage,
  knowledgeChunks,
  behaviourApplied = false,
  onBehaviourNoticeCleared,
  onClose,
  className,
}: TestChatPanelProps) {
  const [previewKey, setPreviewKey] = React.useState<string | null>(null)
  const [previewError, setPreviewError] = React.useState<string | null>(null)
  const [hasConversation, setHasConversation] = React.useState(false)

  const clearChatRef = React.useRef<(() => void) | null>(null)
  const registerClear = React.useCallback((clear: () => void) => {
    clearChatRef.current = clear
  }, [])
  const onConversationChange = React.useCallback((started: boolean) => {
    setHasConversation(started)
  }, [])

  const resetConversation = React.useCallback(() => {
    clearChatRef.current?.()
    onBehaviourNoticeCleared?.()
  }, [onBehaviourNoticeCleared])

  React.useEffect(() => {
    let mounted = true
    void (async () => {
      const res = await onGetPreviewKey(workspaceId)
      if (!mounted) return
      const publicKey = 'publicKey' in res ? res.publicKey : undefined
      if (res.status === 200 && publicKey) {
        setPreviewKey(publicKey)
      } else {
        // The server's own wording, not a generic failure: it distinguishes
        // "no assistant for this client" from a permission problem.
        const message = 'message' in res ? res.message : undefined
        setPreviewError(message || 'Could not open a preview')
      }
    })()
    return () => {
      mounted = false
    }
  }, [workspaceId])

  return (
    <div
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        className
      )}
    >
      {/* Panel chrome. The assistant's own name and avatar live in the widget
          header just below — this strip only says what the panel is. */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[13px] font-semibold tracking-tight text-foreground">
            Live test
          </p>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            Real answers
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={resetConversation}
            disabled={!hasConversation && !behaviourApplied}
            className={QUIET_BUTTON}
            title="Clear the transcript and start a new session"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close the test chat"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {behaviourApplied && hasConversation && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-primary/5 px-4 py-2">
          <p className="text-[12px] leading-5 text-muted-foreground">
            New behaviour starts from the next message.
          </p>
          <button
            type="button"
            onClick={resetConversation}
            className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 text-[12px] font-semibold text-primary transition-colors duration-150 hover:bg-primary/10"
          >
            <RotateCcw className="h-3 w-3" />
            Fresh chat
          </button>
        </div>
      )}

      {knowledgeChunks === 0 && (
        <div className="flex shrink-0 gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p className="text-[12px] leading-5 text-amber-900">
            Nothing indexed yet, so it will decline every question — here and on the client&rsquo;s
            site. Add content under Knowledge.
          </p>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(135deg,#f8f9fc_0%,#eef0f6_100%)] p-3">
        {previewError ? (
          <PanelMessage spinner={false}>{previewError}</PanelMessage>
        ) : previewKey ? (
          <PreviewChat
            previewKey={previewKey}
            assistantName={assistantName}
            theme={theme}
            welcomeMessage={welcomeMessage}
            registerClear={registerClear}
            onConversationChange={onConversationChange}
          />
        ) : (
          <PanelMessage>Opening a preview…</PanelMessage>
        )}
      </div>
    </div>
  )
}
