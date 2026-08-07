'use client'

import * as React from 'react'
import { Check, ChevronDown, Loader2, MessageSquare, RotateCcw } from 'lucide-react'

import {
  onUpdateBotMode,
  onUpdateBrandVoice,
  onUpdateTheme,
  onUpdateWelcomeMessage,
} from '@/actions/settings'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

import {
  BUBBLE_STYLES,
  DEFAULT_THEME,
  bubbleColors,
  detectBubbleStyle,
  readableOn,
  type BubbleStyle,
  type Theme,
} from './agent-theme'
import TestChatPanel from './test-chat-panel'

export { DEFAULT_THEME }
export type { Theme }

/**
 * The agent workspace — one screen, two halves.
 *
 * **Left**: everything an agency configures, as a short stack of collapsed
 * sections rather than a mile of cards. One open at a time keeps the column
 * roughly a viewport tall whatever you are editing.
 *
 * **Right**: the live test chat, pinned to the viewport. It is the half agencies
 * live in during a demo, so it never scrolls away; below `lg` it becomes a
 * slide-over behind a floating button, and the same React subtree stays mounted
 * either way so a conversation survives opening and closing it.
 *
 * ## Two kinds of control, and the difference is visible
 *
 * The screen used to answer "can I just ask, or do I have to save first?" three
 * different ways at once. It now answers it twice, and each control says which
 * it is:
 *
 * - **Saves as you edit** — mode, tone, language. Each is a single-field server
 *   action, so there is no reason to make the agency press anything. The section
 *   header carries its own saving / saved / failed chip.
 * - **Draft, saved together** — the greeting, colours and radius. These render
 *   into the live chat immediately, so they are already visible and Save is what
 *   publishes them. The bar at the foot of the column names exactly what is
 *   unsaved.
 *
 * Behaviour still only applies to the *next* message, because the prompt is
 * built per request — so a successful behaviour write offers a fresh transcript
 * rather than pretending the bubbles on screen changed.
 */

/* ── shared classes ─────────────────────────────────────────────────────── */

const EASE_OUT = 'cubic-bezier(0.23,1,0.32,1)'

const BTN_PRIMARY =
  'inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[12.5px] font-semibold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] disabled:opacity-60 motion-reduce:active:scale-100'
const BTN_SECONDARY =
  'inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[12.5px] font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:scale-[0.97] disabled:opacity-60 motion-reduce:active:scale-100'

const PILL = 'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4 ring-1'
const PILL_TONE = {
  brand: 'bg-primary/10 text-primary ring-primary/25',
  good: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  bad: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  neutral: 'bg-muted text-muted-foreground ring-border',
} as const

const FIELD =
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-ring focus:ring-4 focus:ring-ring/20'

const SUBTLE_SELECT =
  'rounded-md border border-border bg-card px-2 py-1 text-[12px] font-medium text-foreground outline-none transition-colors duration-150 focus:border-ring'

const LABEL = 'text-[12px] font-semibold leading-5 text-foreground'
const HINT = 'text-[11.5px] leading-5 text-muted-foreground'

/* ── how it responds ────────────────────────────────────────────────────── */

/** Matches the `AssistantMode` enum. `onUpdateBotMode` lowercases whatever it is
 *  given and falls back to `sales`, so these are the only values worth sending. */
export type AssistantMode = 'sales' | 'support' | 'faq'

const MODES: {
  key: AssistantMode
  label: string
  recommended?: boolean
  description: string
}[] = [
  {
    key: 'sales',
    label: 'Sales',
    recommended: true,
    description:
      'Answers the question, then works towards a name and an email so the conversation turns into a lead you can follow up.',
  },
  {
    key: 'support',
    label: 'Support',
    description:
      'Walks the visitor through a fix step by step, and hands the conversation to a human when the content does not cover it.',
  },
  {
    key: 'faq',
    label: 'FAQ only',
    description:
      'Answers in a few sentences from the content and nothing more — no pitch, no follow-up questions.',
  },
]

const TONES = [
  'friendly, concise',
  'professional, helpful',
  'casual, conversational',
  'formal, technical',
  'warm, empathetic',
  'enthusiastic, high-energy',
]

const DEFAULT_TONE = 'friendly, concise'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'hi', label: 'Hindi' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
]

/** A typed tone is saved once typing stops rather than on every keystroke. */
const TONE_TYPING_DELAY_MS = 800

/* ── section shell ──────────────────────────────────────────────────────── */

type SectionKey = 'identity' | 'behaviour' | 'voice' | 'appearance' | 'embed'

function Section({
  title,
  summary,
  open,
  onToggle,
  status,
  children,
  /** Defer mounting until first opened — for panels that fetch on mount. */
  lazy = false,
}: {
  title: string
  summary: string
  open: boolean
  onToggle: () => void
  status?: React.ReactNode
  children: React.ReactNode
  lazy?: boolean
}) {
  const [everOpened, setEverOpened] = React.useState(open)
  React.useEffect(() => {
    if (open) setEverOpened(true)
  }, [open])

  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] duration-200',
        open
          ? 'border-border shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
          : 'border-border/70 hover:border-border'
      )}
    >
      {/* `text-base font-normal` undoes the global `h3 { @apply text-2xl }` in
          globals.css, whose 2rem line-height otherwise stretches this row to
          twice its height. */}
      <h3 className="text-base font-normal">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold leading-5 tracking-tight text-foreground">
              {title}
            </span>
            <span className="block truncate text-[11.5px] leading-4 text-muted-foreground">
              {summary}
            </span>
          </span>
          {status}
          <ChevronDown
            aria-hidden
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 motion-reduce:transition-none',
              open && 'rotate-180'
            )}
            style={{ transitionTimingFunction: EASE_OUT }}
          />
        </button>
      </h3>

      {/* 0fr → 1fr keeps the panel in the DOM so field state survives a
          collapse, and animates without measuring anything. */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
        style={{ transitionTimingFunction: EASE_OUT }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-4 py-4">
            {lazy && !everOpened ? null : children}
          </div>
        </div>
      </div>
    </section>
  )
}

/** An inline reveal inside a section — same 0fr→1fr trick as `Section`, for
 *  detail that would otherwise make a section long enough to scroll. */
function Reveal({
  label,
  open,
  onToggle,
  children,
  /** Defer mounting until first opened — for panels that fetch on mount. */
  lazy = false,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
  lazy?: boolean
}) {
  const [everOpened, setEverOpened] = React.useState(open)
  React.useEffect(() => {
    if (open) setEverOpened(true)
  }, [open])

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary"
      >
        {label}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
        style={{ transitionTimingFunction: EASE_OUT }}
      >
        <div className="overflow-hidden">
          <div className="pt-3">{lazy && !everOpened ? null : children}</div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={LABEL}>{label}</p>
      {hint && <p className={cn('mt-0.5', HINT)}>{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 transition-colors duration-150 hover:bg-muted/60">
      <span className="truncate text-[12px] font-medium text-muted-foreground">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-[11px] font-medium uppercase tabular-nums text-muted-foreground/70">
          {value}
        </span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-6 w-8 cursor-pointer rounded border border-border bg-card p-0.5"
          aria-label={label}
        />
      </span>
    </label>
  )
}

/** A quiet row of choices that reads as one control. Used for mode and for the
 *  bubble presets, so the two decisions with three options look alike. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (key: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex w-full max-w-md gap-1 rounded-xl border border-border bg-muted/50 p-1"
    >
      {options.map((option) => {
        const selected = value === option.key
        return (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.key)}
            className={cn(
              'flex-1 rounded-lg px-2 py-1.5 text-[12.5px] font-semibold transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
              selected
                ? 'bg-card text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── panel ──────────────────────────────────────────────────────────────── */

export type TestAndCustomiseProps = {
  /** The client workspace id — what `onUpdateTheme`, `onUpdateWelcomeMessage`
   *  and `onGetPreviewKey` all take. Not the deployment key. */
  workspaceId: string
  /** Fallback title for the widget header before the assistant's own name loads. */
  assistantName: string
  /** Saved theme, as stored on `Assistant.brandingSettings.theme`. */
  currentTheme?: Partial<Theme> | null
  currentWelcomeMessage?: string | null
  /** Saved `Assistant.mode`. Anything unrecognised is treated as `sales`, which
   *  is what the action would store anyway. */
  currentMode?: string | null
  /** Saved `Assistant.brandTone`, e.g. `friendly, concise`. */
  currentBrandTone?: string | null
  /** Saved `Assistant.language` as a two-letter code, e.g. `en`. */
  currentLanguage?: string | null
  /** Indexed chunks. Zero means the assistant has nothing to answer from yet. */
  knowledgeChunks: number

  /* Slots. Each is a piece of the same workspace that saves through a form the
     page already owns — passed in rather than re-implemented so no server
     action changes hands. All optional, so existing call sites still compile. */

  /** Name and avatar, under Identity. */
  identitySlot?: React.ReactNode
  /** Curated answers, under Behaviour. */
  helpDeskSlot?: React.ReactNode
  /** Install snippet and publish state, under Embed. */
  embedSlot?: React.ReactNode
  /** Where "Advanced" lives — model, temperature and mode instructions. */
  advancedHref?: string
  /** Sends the reader to knowledge management, which is a different job. */
  onManageKnowledge?: () => void
  /** Which section starts open — deep links from elsewhere in the app land on
   *  the part they promised (e.g. the embed snippet), not the default. */
  initialSection?: SectionKey
}

/** Everything that has been committed to the server. Held in state rather than
 *  read from props so the draft indicators settle after a save, and so a partial
 *  failure leaves the parts that did save marked as saved. */
type Saved = {
  theme: Theme
  welcome: string
  mode: AssistantMode
  tone: string
  language: string
}

/** The state of the auto-saving half of the panel. `error` carries the server's
 *  own wording so a failure is never reported as a generic one. */
type AutoSaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'error'; message: string }

function normaliseMode(value: string | null | undefined): AssistantMode {
  return value === 'support' || value === 'faq' ? value : 'sales'
}

export default function TestAndCustomise({
  workspaceId,
  assistantName,
  currentTheme,
  currentWelcomeMessage,
  currentMode,
  currentBrandTone,
  currentLanguage,
  knowledgeChunks,
  identitySlot,
  helpDeskSlot,
  embedSlot,
  advancedHref,
  onManageKnowledge,
  initialSection,
}: TestAndCustomiseProps) {
  const { toast } = useToast()

  const [saved, setSaved] = React.useState<Saved>(() => ({
    theme: { ...DEFAULT_THEME, ...(currentTheme || {}) },
    welcome: currentWelcomeMessage || '',
    mode: normaliseMode(currentMode),
    tone: currentBrandTone || DEFAULT_TONE,
    language: currentLanguage || 'en',
  }))

  const [theme, setTheme] = React.useState<Theme>(saved.theme)
  const [welcome, setWelcome] = React.useState(saved.welcome)
  const [mode, setMode] = React.useState<AssistantMode>(saved.mode)
  const [tone, setTone] = React.useState(saved.tone)
  const [language, setLanguage] = React.useState(saved.language)
  const [bubbleStyle, setBubbleStyle] = React.useState<BubbleStyle>(() =>
    detectBubbleStyle(saved.theme)
  )
  const [showMore, setShowMore] = React.useState(false)
  const [showHelpDesk, setShowHelpDesk] = React.useState(false)
  const [showCustomTone, setShowCustomTone] = React.useState(() => !TONES.includes(saved.tone))
  const [saving, setSaving] = React.useState(false)

  const [openSection, setOpenSection] = React.useState<SectionKey | null>(
    initialSection ?? 'behaviour'
  )
  // The deep-link target arrives after mount (the page reads the URL in an
  // effect to avoid a hydration mismatch), so follow it when it shows up.
  React.useEffect(() => {
    if (initialSection) setOpenSection(initialSection)
  }, [initialSection])
  const toggle = React.useCallback(
    (key: SectionKey) => setOpenSection((current) => (current === key ? null : key)),
    []
  )

  const [behaviour, setBehaviour] = React.useState<AutoSaveState>({ kind: 'idle' })
  /** Set once a behaviour change has actually been written. Drives the nudge to
   *  send another message — the only way to hear it. */
  const [behaviourApplied, setBehaviourApplied] = React.useState(false)
  const clearBehaviourNotice = React.useCallback(() => setBehaviourApplied(false), [])

  /** Below `lg` the chat is a slide-over. The panel itself never unmounts, so a
   *  conversation survives closing and reopening it. */
  const [sheetOpen, setSheetOpen] = React.useState(false)

  /* ── the auto-saving half ────────────────────────────────────────────── */

  const toneTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Guards against a slow first write landing after a faster second one and
   *  reporting a stale result. */
  const behaviourSeq = React.useRef(0)
  /** The write to repeat if the last one failed, so "Try again" retries the
   *  change the agency actually made rather than re-sending current state. */
  const retryRef = React.useRef<(() => void) | null>(null)

  const runBehaviourWrite = React.useCallback(
    async (
      commit: () => Promise<{ status: number; message?: string } | undefined>,
      apply: () => void,
      fallbackMessage: string,
      retry: () => void
    ) => {
      const seq = ++behaviourSeq.current
      setBehaviour({ kind: 'saving' })
      const result = await commit()
      if (seq !== behaviourSeq.current) return
      if (result?.status !== 200) {
        const message = result?.message || fallbackMessage
        retryRef.current = retry
        setBehaviour({ kind: 'error', message })
        toast({ title: 'Not saved', description: message, variant: 'destructive' })
        return
      }
      retryRef.current = null
      apply()
      setBehaviour({ kind: 'saved' })
      setBehaviourApplied(true)
    },
    [toast]
  )

  // "Saved" is a moment, not a resting state — it settles back to the quiet
  // "Saves as you edit" chip so the group does not permanently shout success.
  React.useEffect(() => {
    if (behaviour.kind !== 'saved') return
    const timer = setTimeout(() => setBehaviour({ kind: 'idle' }), 2200)
    return () => clearTimeout(timer)
  }, [behaviour])

  React.useEffect(() => {
    return () => {
      if (toneTimer.current) clearTimeout(toneTimer.current)
    }
  }, [])

  const commitMode = React.useCallback(
    (next: AssistantMode) => {
      setMode(next)
      void runBehaviourWrite(
        () => onUpdateBotMode(workspaceId, next),
        () => setSaved((current) => ({ ...current, mode: next })),
        'Could not update the mode',
        () => commitMode(next)
      )
    },
    [runBehaviourWrite, workspaceId]
  )

  /** Tone and language share one action, so both are always sent together. */
  const commitVoice = React.useCallback(
    (nextTone: string, nextLanguage: string, delayMs: number) => {
      if (toneTimer.current) clearTimeout(toneTimer.current)
      const fire = () => {
        const trimmed = nextTone.trim() || DEFAULT_TONE
        void runBehaviourWrite(
          () => onUpdateBrandVoice(workspaceId, trimmed, nextLanguage),
          () => setSaved((current) => ({ ...current, tone: trimmed, language: nextLanguage })),
          'Could not update the brand voice',
          () => commitVoice(nextTone, nextLanguage, 0)
        )
      }
      if (delayMs <= 0) fire()
      else toneTimer.current = setTimeout(fire, delayMs)
    },
    [runBehaviourWrite, workspaceId]
  )

  /* ── the draft half ──────────────────────────────────────────────────── */

  const themeDirty = JSON.stringify(theme) !== JSON.stringify(saved.theme)
  const welcomeDirty = welcome !== saved.welcome
  const draftDirty = themeDirty || welcomeDirty

  const set = <K extends keyof Theme>(key: K, value: Theme[K]) =>
    setTheme((current) => ({ ...current, [key]: value }))

  /** One brand colour drives the send button, the accent and the visitor's own
   *  bubbles, because those are the three surfaces people mean by "our colour".
   *  Bubble text follows automatically so the choice can never be unreadable. */
  const onBrandChange = (value: string) => {
    setTheme((current) => ({
      ...current,
      primary: value,
      accent: value,
      userBubbleBg: value,
      userBubbleText: readableOn(value),
      ...(bubbleStyle === 'tinted' ? bubbleColors('tinted', value) : {}),
    }))
  }

  const onBubbleStyleChange = (style: BubbleStyle) => {
    setBubbleStyle(style)
    setTheme((current) => ({ ...current, ...bubbleColors(style, current.primary) }))
  }

  const onDiscard = () => {
    setTheme(saved.theme)
    setWelcome(saved.welcome)
    setBubbleStyle(detectBubbleStyle(saved.theme))
  }

  /**
   * Two writes, each committed into `saved` on its own. A failure part way
   * through has to say which half landed — an agency that reads "not saved" and
   * re-picks colours it already saved is worse off than one told the truth.
   */
  const onSave = async () => {
    setSaving(true)
    try {
      let themeSaved = false

      if (themeDirty) {
        const themeResult = await onUpdateTheme(workspaceId, { ...theme })
        if (themeResult?.status !== 200) {
          toast({
            title: 'Not saved',
            description: themeResult?.message || 'Could not update appearance',
            variant: 'destructive',
          })
          return
        }
        setSaved((current) => ({ ...current, theme }))
        themeSaved = true
      }

      // Only touched when it actually changed — a needless write here would
      // reset the assistant's welcome message on every colour tweak.
      if (welcomeDirty) {
        const welcomeResult = await onUpdateWelcomeMessage(welcome, workspaceId)
        if (welcomeResult?.status !== 200) {
          toast({
            // Only claim the colours saved when a colour write actually ran.
            title: themeSaved ? 'Colours saved, greeting not' : 'Not saved',
            description: welcomeResult?.message || 'Could not update the greeting',
            variant: 'destructive',
          })
          return
        }
        setSaved((current) => ({ ...current, welcome }))
      }

      toast({ title: 'Saved', description: 'Your client’s visitors will see this.' })
    } finally {
      setSaving(false)
    }
  }

  /* ── chrome ──────────────────────────────────────────────────────────── */

  const behaviourChip = (() => {
    if (behaviour.kind === 'saving')
      return (
        <span className={cn(PILL, PILL_TONE.neutral, 'inline-flex items-center gap-1')}>
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          Saving
        </span>
      )
    if (behaviour.kind === 'saved')
      return (
        <span className={cn(PILL, PILL_TONE.good, 'inline-flex items-center gap-1')}>
          <Check className="h-2.5 w-2.5" strokeWidth={4} />
          Saved
        </span>
      )
    if (behaviour.kind === 'error') return <span className={cn(PILL, PILL_TONE.bad)}>Not saved</span>
    return <span className={cn(PILL, PILL_TONE.neutral)}>Saves as you edit</span>
  })()

  const draftChip = (dirty: boolean) =>
    dirty ? <span className={cn(PILL, PILL_TONE.brand)}>Unsaved</span> : null

  const selectedMode = MODES.find((option) => option.key === mode) || MODES[0]

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:items-start">
      {/* ── configuration ─────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col gap-2">
        <Section
          title="Identity"
          summary="Name, avatar and the first thing a visitor reads"
          open={openSection === 'identity'}
          onToggle={() => toggle('identity')}
          status={draftChip(welcomeDirty)}
        >
          <div className="flex flex-col gap-5">
            <Field label="Greeting" hint="The opening message, before anyone types anything.">
              <textarea
                id="welcome-message"
                value={welcome}
                onChange={(event) => setWelcome(event.target.value)}
                rows={2}
                placeholder="Hi — ask me anything about our services."
                className={cn(FIELD, 'resize-y')}
              />
            </Field>
            {identitySlot}
          </div>
        </Section>

        <Section
          title="Behaviour"
          summary={`${selectedMode.label} — what it is there to do`}
          open={openSection === 'behaviour'}
          onToggle={() => toggle('behaviour')}
          status={behaviourChip}
        >
          <div className="flex flex-col gap-5">
            <div>
              <Segmented
                ariaLabel="Assistant mode"
                options={MODES.map((option) => ({ key: option.key, label: option.label }))}
                value={mode}
                onChange={commitMode}
              />
              <div className="mt-2.5 flex flex-col items-start gap-1.5">
                {selectedMode.recommended && (
                  <span className={cn(PILL, PILL_TONE.brand)}>Recommended</span>
                )}
                <p className="text-[12px] leading-5 text-muted-foreground">
                  {selectedMode.description}
                </p>
              </div>
            </div>

            {behaviour.kind === 'error' && (
              <p className="flex flex-wrap items-center gap-2 text-[12px] leading-5 text-rose-700">
                {behaviour.message}
                <button
                  type="button"
                  onClick={() => retryRef.current?.()}
                  className="font-semibold text-primary hover:underline"
                >
                  Try again
                </button>
              </p>
            )}

            {/* Not a detail we can hide: until a visitor has left contact details
                every mode still works towards getting them, and the choice only
                shapes the conversation after that. */}
            <p className="text-[11px] leading-4 text-muted-foreground/70">
              Every mode works towards contact details first. The mode shapes what happens after
              that.
            </p>

            {helpDeskSlot && (
              <div className="border-t border-border pt-3">
                <Reveal
                  label="Curated answers"
                  lazy
                  open={showHelpDesk}
                  onToggle={() => setShowHelpDesk((open) => !open)}
                >
                  <p className={cn('mb-3', HINT)}>
                    Questions you want answered a particular way, every time.
                  </p>
                  {helpDeskSlot}
                </Reveal>
              </div>
            )}

            {advancedHref && (
              <a
                href={advancedHref}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors duration-150 hover:bg-muted/60"
              >
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-foreground">Advanced</span>
                  <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                    Model, response variation and the instruction block per mode.
                  </span>
                </span>
                <ChevronDown aria-hidden className="h-4 w-4 shrink-0 -rotate-90 text-muted-foreground/60" />
              </a>
            )}
          </div>
        </Section>

        <Section
          title="Voice"
          summary={`${tone} · ${LANGUAGES.find((l) => l.value === language)?.label ?? 'English'}`}
          open={openSection === 'voice'}
          onToggle={() => toggle('voice')}
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className={LABEL}>Tone</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TONES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={tone === preset}
                    onClick={() => {
                      setTone(preset)
                      setShowCustomTone(false)
                      commitVoice(preset, language, 0)
                    }}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100',
                      tone === preset
                        ? 'bg-primary text-primary-foreground ring-primary'
                        : 'bg-card text-muted-foreground ring-border hover:text-foreground'
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCustomTone((open) => !open)}
                className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold text-primary"
                aria-expanded={showCustomTone}
              >
                Write your own
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none',
                    showCustomTone && 'rotate-180'
                  )}
                />
              </button>

              {showCustomTone && (
                <input
                  value={tone}
                  onChange={(event) => {
                    setTone(event.target.value)
                    commitVoice(event.target.value, language, TONE_TYPING_DELAY_MS)
                  }}
                  onBlur={(event) => commitVoice(event.target.value, language, 0)}
                  placeholder="e.g. direct, no-nonsense"
                  aria-label="Custom tone"
                  className={cn('mt-2', FIELD)}
                />
              )}
            </div>

            <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
              <span className="text-[12px] font-medium text-muted-foreground">Language</span>
              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value)
                  commitVoice(tone, event.target.value, 0)
                }}
                className={SUBTLE_SELECT}
              >
                {LANGUAGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Section>

        <Section
          title="Appearance"
          summary="Brand colour, bubbles and corners"
          open={openSection === 'appearance'}
          onToggle={() => toggle('appearance')}
          status={draftChip(themeDirty)}
        >
          <div className="flex flex-col gap-4">
            <Field
              label="Brand colour"
              hint="Sets the send button and the visitor’s own messages."
            >
              <ColorField label="Brand" value={theme.primary} onChange={onBrandChange} />
            </Field>

            <Field label="Assistant bubbles">
              <Segmented
                ariaLabel="Assistant bubble style"
                options={BUBBLE_STYLES}
                value={bubbleStyle}
                onChange={onBubbleStyleChange}
              />
            </Field>

            <div>
              <div className="flex items-center justify-between">
                <p className={LABEL}>Corner radius</p>
                <span className="text-[11px] tabular-nums text-muted-foreground/70">
                  {theme.radius}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={theme.radius}
                onChange={(event) => set('radius', parseInt(event.target.value, 10))}
                className="mt-2 w-full accent-primary"
                aria-label="Corner radius"
              />
            </div>

            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowMore((open) => !open)}
                aria-expanded={showMore}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary"
              >
                Every other colour
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none',
                    showMore && 'rotate-180'
                  )}
                />
              </button>

              <div
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none',
                  showMore ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
                style={{ transitionTimingFunction: EASE_OUT }}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-1.5 pt-3 sm:grid-cols-2">
                    <ColorField label="Window background" value={theme.surface} onChange={(v) => set('surface', v)} />
                    <ColorField label="Text" value={theme.text} onChange={(v) => set('text', v)} />
                    <ColorField label="Header background" value={theme.headerBg} onChange={(v) => set('headerBg', v)} />
                    <ColorField label="Header text" value={theme.headerText} onChange={(v) => set('headerText', v)} />
                    <ColorField label="Visitor bubble" value={theme.userBubbleBg} onChange={(v) => set('userBubbleBg', v)} />
                    <ColorField label="Visitor bubble text" value={theme.userBubbleText} onChange={(v) => set('userBubbleText', v)} />
                    <ColorField label="Assistant bubble" value={theme.botBubbleBg} onChange={(v) => set('botBubbleBg', v)} />
                    <ColorField label="Assistant bubble text" value={theme.botBubbleText} onChange={(v) => set('botBubbleText', v)} />
                    <ColorField label="Input background" value={theme.inputBg} onChange={(v) => set('inputBg', v)} />
                    <ColorField label="Input border" value={theme.inputBorder} onChange={(v) => set('inputBorder', v)} />
                    <ColorField label="Accent" value={theme.accent} onChange={(v) => set('accent', v)} />
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                      <span className="text-[12px] font-medium text-muted-foreground">Shadow</span>
                      <select
                        value={theme.shadow}
                        onChange={(event) => set('shadow', event.target.value === 'none' ? 'none' : 'sm')}
                        className={SUBTLE_SELECT}
                      >
                        <option value="none">None</option>
                        <option value="sm">Small</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {embedSlot && (
          <Section
            title="Embed & share"
            summary="One snippet, pasted into the client’s site"
            open={openSection === 'embed'}
            onToggle={() => toggle('embed')}
            lazy
          >
            {embedSlot}
          </Section>
        )}

        {onManageKnowledge && (
          <button
            type="button"
            onClick={onManageKnowledge}
            className={cn(
              'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150',
              knowledgeChunks === 0
                ? 'border-amber-200 bg-amber-50 hover:bg-amber-100/70'
                : 'border-border/70 bg-card hover:border-border hover:bg-muted/50'
            )}
          >
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold tracking-tight text-foreground">
                Knowledge
              </span>
              <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                {knowledgeChunks === 0
                  ? 'Nothing indexed yet — the assistant will decline every question'
                  : `${knowledgeChunks.toLocaleString()} indexed passages to answer from`}
              </span>
            </span>
            <ChevronDown aria-hidden className="h-4 w-4 shrink-0 -rotate-90 text-muted-foreground/60" />
          </button>
        )}

        {/* Sticky at the foot of the config column only, so it never overlaps the
            chat. Quiet when clean, and the same height either way — nothing on
            this column moves when the draft goes dirty. */}
        <div
          className={cn(
            'sticky bottom-3 z-10 mt-1 flex h-12 items-center justify-between gap-3 rounded-xl px-3 transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none',
            draftDirty
              ? 'border border-border bg-card/95 shadow-[0_8px_24px_rgba(15,23,42,0.10)] backdrop-blur'
              // Opaque even when quiet: the bar is pinned over the column, and a
              // translucent one lets section text bleed through it.
              : 'border border-transparent bg-background'
          )}
          style={{ transitionTimingFunction: EASE_OUT }}
        >
          <span className="flex min-w-0 flex-wrap items-center gap-1.5" aria-live="polite">
            {draftDirty ? (
              <>
                <span className="text-[12px] font-medium text-muted-foreground">Unsaved:</span>
                {themeDirty && <span className={cn(PILL, PILL_TONE.brand)}>Appearance</span>}
                {welcomeDirty && <span className={cn(PILL, PILL_TONE.brand)}>Greeting</span>}
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground/70">
                <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                Saved
              </span>
            )}
          </span>

          {draftDirty && (
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={onDiscard} disabled={saving} className={BTN_SECONDARY}>
                <RotateCcw className="h-3.5 w-3.5" />
                Discard
              </button>
              <button type="button" onClick={onSave} disabled={saving} className={BTN_PRIMARY}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── live test chat ────────────────────────────────────────────────
          One subtree, two positions. Below `lg` it is a slide-over; from `lg`
          it is a column pinned to the viewport. Because only the positioning
          classes change, the conversation survives the switch. */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 top-14 z-50 flex flex-col p-3 md:top-[72px]',
          'transition-transform duration-300 motion-reduce:transition-none',
          sheetOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full',
          'lg:pointer-events-auto lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-4 lg:z-auto lg:h-[calc(100vh-100px)] lg:translate-y-0 lg:p-0'
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
      >
        <TestChatPanel
          workspaceId={workspaceId}
          assistantName={assistantName}
          theme={theme}
          welcomeMessage={welcome}
          knowledgeChunks={knowledgeChunks}
          behaviourApplied={behaviourApplied}
          onBehaviourNoticeCleared={clearBehaviourNotice}
          onClose={() => setSheetOpen(false)}
          className="min-h-0 flex-1 shadow-[0_24px_60px_rgba(15,23,42,0.18)] lg:shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        />
      </div>

      {/* Backdrop sits under the sheet and above the page, below `lg` only. */}
      <div
        onClick={() => setSheetOpen(false)}
        aria-hidden
        className={cn(
          'fixed inset-0 z-40 bg-foreground/25 transition-opacity duration-200 lg:hidden',
          sheetOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className={cn(
          // Clears the sticky save bar at the foot of the config column, which
          // occupies the bottom 60px of the viewport whenever the draft is dirty.
          'fixed bottom-[4.5rem] right-4 z-30 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-[0_8px_24px_rgba(15,23,42,0.20)] transition-[opacity,transform] duration-200 active:scale-[0.97] lg:hidden motion-reduce:transition-none motion-reduce:active:scale-100',
          sheetOpen ? 'pointer-events-none scale-95 opacity-0' : 'opacity-100'
        )}
      >
        <MessageSquare className="h-4 w-4" />
        Test your assistant
      </button>
    </div>
  )
}
