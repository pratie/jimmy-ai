'use client'

import * as React from 'react'
import { Check, ChevronDown, Loader2, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react'

import {
  onGetPreviewKey,
  onUpdateBotMode,
  onUpdateBrandVoice,
  onUpdateTheme,
  onUpdateWelcomeMessage,
} from '@/actions/settings'
import { BotWindow } from '@/components/chatbot/window'
import { useToast } from '@/components/ui/use-toast'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'

/**
 * Test & customise — the one screen where an agency talks to the assistant it
 * just built while changing how it looks.
 *
 * The two halves are the point. Picking `botBubbleBg` out of a column of colour
 * swatches with nothing to look at is guesswork; every competitor puts the chat
 * and the controls together, and this closes that gap. Draft state drives the
 * preview directly, so a colour lands before it is saved and Save is a decision
 * rather than a way to find out what you did.
 *
 * The chat is real, not a mock. It runs through `useChatBot` against a
 * `preview` deployment key, which is the same resolved, rate-limited path an
 * installed widget takes — the website widget key is origin-locked to the
 * client's own domain and would 403 here, and a preview deployment also serves
 * the draft assistant, which is what an agency needs to try before publishing.
 * That means a preview answer is the answer a visitor gets. If the assistant
 * has nothing indexed it will decline everything; the panel says so rather than
 * letting the agency read correct behaviour as a broken product.
 *
 * The controls are grouped by what they change: how the assistant *responds*
 * first, then how it *looks*. Mode, tone and language used to live on a separate
 * tab, which meant tuning the thing the product is sold on — a lead-generating
 * assistant — without hearing a single answer. They belong next to the chat.
 * Unlike a colour, they cannot be previewed from draft state: the system prompt
 * is built server-side per request, so they only apply once saved, and only to
 * the *next* message. The panel says exactly that and offers a fresh transcript
 * rather than pretending the bubbles already on screen changed.
 */

export type Theme = {
  primary: string
  surface: string
  text: string
  headerBg: string
  headerText: string
  userBubbleBg: string
  userBubbleText: string
  botBubbleBg: string
  botBubbleText: string
  inputBg: string
  inputBorder: string
  accent: string
  radius: number
  shadow: 'none' | 'sm'
}

export const DEFAULT_THEME: Theme = {
  primary: '#1DA1F2',
  surface: '#FFFFFF',
  text: '#111827',
  headerBg: '#FFFFFF',
  headerText: '#111827',
  userBubbleBg: '#1DA1F2',
  userBubbleText: '#FFFFFF',
  botBubbleBg: '#F3F4F6',
  botBubbleText: '#111827',
  inputBg: '#FFFFFF',
  inputBorder: '#D1D5DB',
  accent: '#1DA1F2',
  radius: 10,
  shadow: 'sm',
}

const BTN_PRIMARY =
  'inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#5b5ce2] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#4c4dd6] disabled:opacity-60'
const BTN_SECONDARY =
  'inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-60'

/** What a prospective customer actually opens with — price, fit and next step —
 *  so a test conversation exercises the path a real lead takes. */
const STARTERS = [
  'How much does it cost?',
  'Do you work with businesses like mine?',
  'What makes you different?',
  'Can I speak to someone this week?',
]

/* ── how it responds ────────────────────────────────────────────────────── */

/** Matches the `AssistantMode` enum. `onUpdateBotMode` lowercases whatever it is
 *  given and falls back to `sales`, so these are the only values worth sending. */
export type AssistantMode = 'sales' | 'support' | 'faq'

const MODES: { key: AssistantMode; label: string; recommended?: boolean; description: string }[] = [
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

/* ── colour helpers ─────────────────────────────────────────────────────── */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function toRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ]
}

/** Relative luminance, WCAG definition. */
function luminance(hex: string): number {
  const channels = toRgb(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** Black or white, whichever stays readable on `hex`. The agency picks one
 *  brand colour; making them separately pick legible text on top of it is the
 *  kind of decision software should make for them. */
function readableOn(hex: string): string {
  return luminance(hex) > 0.5 ? '#111827' : '#FFFFFF'
}

/** `hex` blended toward white by `amount` (0–1) — used for the tinted bubble
 *  style, so the assistant's own bubbles can carry the brand without shouting. */
function tint(hex: string, amount: number): string {
  const [r, g, b] = toRgb(hex)
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount)
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

type BubbleStyle = 'light' | 'tinted' | 'dark'

const BUBBLE_STYLES: { key: BubbleStyle; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'tinted', label: 'Tinted' },
  { key: 'dark', label: 'Dark' },
]

function bubbleColors(style: BubbleStyle, brand: string): Pick<Theme, 'botBubbleBg' | 'botBubbleText'> {
  if (style === 'dark') return { botBubbleBg: '#1E293B', botBubbleText: '#FFFFFF' }
  if (style === 'tinted') {
    const bg = HEX.test(brand) ? tint(brand, 0.88) : '#F3F4F6'
    return { botBubbleBg: bg, botBubbleText: '#111827' }
  }
  return { botBubbleBg: '#F1F5F9', botBubbleText: '#111827' }
}

/** Which of the three presets the current colours correspond to, so reopening
 *  the panel shows the choice that is actually in effect rather than a default. */
function detectBubbleStyle(theme: Theme): BubbleStyle {
  if (luminance(theme.botBubbleBg) < 0.4) return 'dark'
  if (theme.botBubbleBg.toLowerCase() === bubbleColors('tinted', theme.primary).botBubbleBg.toLowerCase())
    return 'tinted'
  return 'light'
}

/* ── controls ───────────────────────────────────────────────────────────── */

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
    <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
      <span className="text-[12px] font-medium text-slate-600">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tabular-nums text-slate-400">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
          aria-label={label}
        />
      </span>
    </label>
  )
}

/* ── preview ────────────────────────────────────────────────────────────── */

type PreviewChatProps = {
  previewKey: string
  assistantName: string
  theme: Theme
  welcomeMessage: string
  /** Hands the transcript back up so the panel can offer "start a fresh chat"
   *  after a behaviour change — the chat state lives in `useChatBot`, which is
   *  only mounted down here. */
  registerClear: (clear: () => void) => void
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
    onRealTime,
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
    registerClear(() => setOnChats([]))
  }, [registerClear, setOnChats])

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

  if (loading) {
    return (
      <div className="grid h-[560px] place-items-center text-[13px] text-slate-500">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading the preview…
        </span>
      </div>
    )
  }

  if (!currentBot) {
    return (
      <div className="grid h-[560px] place-items-center px-6 text-center text-[13px] leading-5 text-slate-500">
        The preview could not load this assistant. Check that the client still has an assistant on
        the Knowledge Base tab, then reload this page.
      </div>
    )
  }

  return (
    // BotWindow's composer is a real `<form>`, and this panel is rendered inside
    // the settings form. React propagates submit through the tree, so without
    // this every chat send would also fire the settings form's save handler.
    <div className="flex flex-col gap-3" onSubmit={(event) => event.stopPropagation()}>
      <div className="h-[560px]">
        <BotWindow
          errors={errors}
          setChat={setOnChats}
          realtimeMode={onRealTime}
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
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => ask(question)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {question}
            </button>
          ))}
        </div>
      )}
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
}

/** Everything Save has committed. Held in state rather than read from props so
 *  the unsaved-changes indicator settles after a save, and so a partial failure
 *  leaves the parts that did save marked as saved. */
type Saved = {
  theme: Theme
  welcome: string
  mode: AssistantMode
  tone: string
  language: string
}

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
  const [bubbleStyle, setBubbleStyle] = React.useState<BubbleStyle>(() => detectBubbleStyle(saved.theme))
  const [showMore, setShowMore] = React.useState(false)
  const [showCustomTone, setShowCustomTone] = React.useState(() => !TONES.includes(saved.tone))
  const [saving, setSaving] = React.useState(false)
  /** Set once a behaviour change has actually been written. Drives the nudge to
   *  send another message — the only way to hear it. */
  const [behaviourJustSaved, setBehaviourJustSaved] = React.useState(false)

  const clearChatRef = React.useRef<(() => void) | null>(null)
  const registerClear = React.useCallback((clear: () => void) => {
    clearChatRef.current = clear
  }, [])
  const onClearChat = () => {
    clearChatRef.current?.()
    setBehaviourJustSaved(false)
  }

  const [previewKey, setPreviewKey] = React.useState<string | null>(null)
  const [previewError, setPreviewError] = React.useState<string | null>(null)

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

  const themeDirty = JSON.stringify(theme) !== JSON.stringify(saved.theme)
  const welcomeDirty = welcome !== saved.welcome
  const behaviourDirty = mode !== saved.mode || tone !== saved.tone || language !== saved.language
  const dirty = themeDirty || welcomeDirty || behaviourDirty

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

  const onReset = () => {
    setTheme(saved.theme)
    setWelcome(saved.welcome)
    setMode(saved.mode)
    setTone(saved.tone)
    setLanguage(saved.language)
    setBubbleStyle(detectBubbleStyle(saved.theme))
    setShowCustomTone(!TONES.includes(saved.tone))
  }

  /**
   * Four separate writes, each committed into `saved` on its own. A failure part
   * way through has to say which half landed — an agency that reads "not saved"
   * and re-picks colours it already saved is worse off than one told the truth.
   */
  const onSave = async () => {
    setSaving(true)
    try {
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
      }

      // Only touched when it actually changed — a needless write here would
      // reset the assistant's welcome message on every colour tweak.
      if (welcomeDirty) {
        const welcomeResult = await onUpdateWelcomeMessage(welcome, workspaceId)
        if (welcomeResult?.status !== 200) {
          toast({
            title: 'Colours saved, welcome message not',
            description: welcomeResult?.message || 'Could not update the welcome message',
            variant: 'destructive',
          })
          return
        }
        setSaved((current) => ({ ...current, welcome }))
      }

      if (mode !== saved.mode) {
        const modeResult = await onUpdateBotMode(workspaceId, mode)
        if (modeResult?.status !== 200) {
          toast({
            title: 'Mode not saved',
            description: modeResult?.message || 'Could not update the mode',
            variant: 'destructive',
          })
          return
        }
        setSaved((current) => ({ ...current, mode }))
      }

      if (tone !== saved.tone || language !== saved.language) {
        const voiceResult = await onUpdateBrandVoice(workspaceId, tone.trim() || DEFAULT_TONE, language)
        if (voiceResult?.status !== 200) {
          toast({
            title: 'Tone and language not saved',
            description: voiceResult?.message || 'Could not update the brand voice',
            variant: 'destructive',
          })
          return
        }
        setSaved((current) => ({ ...current, tone, language }))
      }

      if (behaviourDirty) setBehaviourJustSaved(true)
      toast({ title: 'Saved', description: 'Your client’s visitors will see this.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
      {/* Preview is first in the DOM order on mobile: seeing it matters more
          than tweaking it, and a phone shows one column at a time. */}
      <section className="order-1 flex flex-col gap-4 lg:order-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-[13px] font-black text-slate-900">What a visitor sees</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
              Live
            </span>
          </div>
          <div className="bg-[linear-gradient(135deg,#f8f9fc_0%,#eef0f6_100%)] p-4">
            {previewError ? (
              <div className="grid h-[560px] place-items-center px-6 text-center text-[13px] leading-5 text-slate-500">
                {previewError}
              </div>
            ) : previewKey ? (
              <PreviewChat
                previewKey={previewKey}
                assistantName={assistantName}
                theme={theme}
                welcomeMessage={welcome}
                registerClear={registerClear}
              />
            ) : (
              <div className="grid h-[560px] place-items-center text-[13px] text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening a preview…
                </span>
              </div>
            )}
          </div>
        </div>

        {knowledgeChunks === 0 && (
          <div className="flex gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-[13px] leading-5 text-amber-900">
              This assistant has nothing indexed yet, so it will decline every question here. That
              is what a visitor would get too — add content on the Knowledge Base tab and the
              answers will appear.
            </p>
          </div>
        )}
      </section>

      <section className="order-2 flex flex-col gap-4 lg:order-1">
        {/* Responds before looks: it is the half that decides whether the
            assistant brings the client leads. */}
        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
          How it responds
        </p>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[13px] font-black text-slate-900">What it is there to do</p>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            Sales is the one that turns conversations into leads. Pick another only if the client
            asked for it.
          </p>

          <div className="mt-4 space-y-2">
            {MODES.map((option) => {
              const selected = mode === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMode(option.key)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selected
                      ? 'border-[#5b5ce2] bg-[#5b5ce2]/5'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                        selected ? 'border-[#5b5ce2] bg-[#5b5ce2] text-white' : 'border-slate-300'
                      }`}
                    >
                      {selected && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
                    </span>
                    <span className="text-[13px] font-bold text-slate-900">{option.label}</span>
                    {option.recommended && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-[#5b5ce2] ring-1 ring-[#5b5ce2]/30">
                        Recommended
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block pl-6 text-[12px] leading-5 text-slate-500">
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Not a detail we can hide: until a visitor has left contact details
              every mode still works towards getting them, and the choice only
              shapes the conversation after that. */}
          <p className="mt-3 text-[11px] leading-4 text-slate-400">
            Until a visitor leaves their contact details, the assistant works towards getting them
            whichever option is picked. The mode shapes the conversation from that point on.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[13px] font-black text-slate-900">How it speaks</p>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            The tone it writes in, and the language it defaults to.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {TONES.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-pressed={tone === preset}
                onClick={() => {
                  setTone(preset)
                  setShowCustomTone(false)
                }}
                className={`rounded-full px-3 py-1 text-[12px] font-bold ring-1 transition ${
                  tone === preset
                    ? 'bg-[#5b5ce2] text-white ring-[#5b5ce2]'
                    : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCustomTone((open) => !open)}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#5b5ce2]"
            aria-expanded={showCustomTone}
          >
            Write your own
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showCustomTone ? 'rotate-180' : ''}`}
            />
          </button>

          {showCustomTone && (
            <input
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              placeholder="e.g. direct, no-nonsense"
              aria-label="Custom tone"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-[#5b5ce2] focus:ring-4 focus:ring-[#5b5ce2]/10"
            />
          )}

          <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
            <span className="text-[12px] font-medium text-slate-600">Language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1 text-[12px] text-slate-700 outline-none"
            >
              {LANGUAGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {behaviourDirty && (
          <p className="px-1 text-[11px] leading-4 text-slate-400">
            Mode, tone and language are decided when a message is answered, so the preview keeps
            answering the old way until you save.
          </p>
        )}

        {behaviourJustSaved && !behaviourDirty && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#5b5ce2]/30 bg-[#5b5ce2]/5 p-4">
            <p className="text-[12px] leading-5 text-slate-600">
              Saved. Send another message in the preview to hear it — the replies already on screen
              were written with the old settings.
            </p>
            {previewKey && (
              <button type="button" onClick={onClearChat} className={BTN_SECONDARY}>
                <RotateCcw className="h-3.5 w-3.5" />
                Start a fresh chat
              </button>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <label htmlFor="welcome-message" className="text-[13px] font-black text-slate-900">
            Welcome message
          </label>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            The first thing anyone reads. It shows in the preview as you type.
          </p>
          <textarea
            id="welcome-message"
            value={welcome}
            onChange={(event) => setWelcome(event.target.value)}
            rows={3}
            placeholder="Hi! Ask me anything about our services."
            className="mt-3 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-[#5b5ce2] focus:ring-4 focus:ring-[#5b5ce2]/10"
          />
        </div>

        <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
          How it looks
        </p>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[13px] font-black text-slate-900">The basics</p>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            Most agencies change one colour. Everything else has a sensible default.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-[12px] font-bold text-slate-700">Brand colour</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Sets the send button and the visitor’s own messages.
              </p>
              <div className="mt-2">
                <ColorField label="Brand" value={theme.primary} onChange={onBrandChange} />
              </div>
            </div>

            <div>
              <p className="text-[12px] font-bold text-slate-700">Assistant bubbles</p>
              <div className="mt-2 inline-flex rounded-lg border border-slate-200 p-1">
                {BUBBLE_STYLES.map((style) => (
                  <button
                    key={style.key}
                    type="button"
                    onClick={() => onBubbleStyleChange(style.key)}
                    className={
                      bubbleStyle === style.key
                        ? 'rounded-md bg-[#5b5ce2] px-3 py-1.5 text-[12px] font-bold text-white'
                        : 'rounded-md px-3 py-1.5 text-[12px] font-bold text-slate-500 transition hover:text-slate-800'
                    }
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-slate-700">Corner radius</p>
                <span className="text-[11px] tabular-nums text-slate-400">{theme.radius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={theme.radius}
                onChange={(event) => set('radius', parseInt(event.target.value, 10))}
                className="mt-2 w-full accent-[#5b5ce2]"
                aria-label="Corner radius"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setShowMore((open) => !open)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
            aria-expanded={showMore}
          >
            <span>
              <span className="block text-[13px] font-black text-slate-900">More colours</span>
              <span className="mt-0.5 block text-[12px] text-slate-500">
                Header, surfaces, text and the input field.
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${showMore ? 'rotate-180' : ''}`}
            />
          </button>

          {showMore && (
            <div className="grid gap-2 border-t border-slate-100 p-5 sm:grid-cols-2">
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
              <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-[12px] font-medium text-slate-600">Shadow</span>
                <select
                  value={theme.shadow}
                  onChange={(event) => set('shadow', event.target.value === 'none' ? 'none' : 'sm')}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[12px] text-slate-700 outline-none"
                >
                  <option value="none">None</option>
                  <option value="sm">Small</option>
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
            {dirty ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-[#5b5ce2]" />
                {/* Colours and the welcome message render from draft state;
                    behaviour does not, so the claim is narrowed when it is. */}
                {behaviourDirty
                  ? 'Unsaved changes — save to hear the new behaviour.'
                  : 'Unsaved changes — the preview is already showing them.'}
              </>
            ) : (
              'Everything here is saved.'
            )}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onReset} disabled={!dirty || saving} className={BTN_SECONDARY}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button type="button" onClick={onSave} disabled={!dirty || saving} className={BTN_PRIMARY}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
