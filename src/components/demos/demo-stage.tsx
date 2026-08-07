'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { BotWindow } from '@/components/chatbot/window'
import { Loader } from '@/components/loader'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'

/**
 * The demo a prospect actually sees at /d/<shareToken>.
 *
 * The chat is not a new transport: `useChatBot` takes the share token as its
 * `domainId` — that value is only ever "the key" and resolution accepts a
 * `shareToken` there — so this page talks to the same resolved, rate-limited,
 * entitlement-checked path as an installed widget. Anything built separately
 * here would drift from the real product, which is the one thing a sales asset
 * cannot afford.
 *
 * Everything on the page is either true or absent. No counts, no testimonials,
 * no logos we do not own: the prospect can verify every claim by asking the
 * assistant a question about their own business.
 */

// Mirrors `EngagementEvent` in lib/demos/engagement, which is server-only and
// so cannot be imported from a client bundle at all, type or otherwise.
type EngagementEvent = 'opened' | 'conversation_started' | 'cta_clicked'

const ANONYMOUS_ID_KEY = 'chatdock_anonymous_id'

/** Same key and shape `useChatBot` uses, so a beacon and a conversation from
 *  the same browser can be matched up afterwards. */
function getAnonymousId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    let id = window.localStorage.getItem(ANONYMOUS_ID_KEY)
    if (!id) {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
      window.localStorage.setItem(ANONYMOUS_ID_KEY, id)
    }
    return id
  } catch {
    // Private browsing can throw on localStorage. Engagement is not worth an
    // exception on a page a prospect is reading.
    return undefined
  }
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const BRAND = '#5b5ce2'

const STARTERS = [
  'What services do you offer?',
  'How much does it cost?',
  'What are your hours and where are you located?',
  'Can I book a call?',
]

const CTA_MESSAGE = 'I like this — how would we get an assistant like this on our website?'

export type DemoStageProps = {
  /** The deployment `shareToken` from the URL. Doubles as the chat key. */
  token: string
  businessName: string
  websiteUrl: string | null
  logoUrl: string | null
  /** The workspace's brand colour, or null to fall back to the ChatDock brand. */
  primaryColor: string | null
}

export default function DemoStage({
  token,
  businessName,
  websiteUrl,
  logoUrl,
  primaryColor,
}: DemoStageProps) {
  const accent = primaryColor && HEX.test(primaryColor.trim()) ? primaryColor.trim() : BRAND
  // A demo row with no name is a data problem, not something a prospect should
  // read as a blank heading.
  const displayName = businessName?.trim() || 'This business'
  const [logoBroken, setLogoBroken] = useState(false)

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
  } = useChatBot({ domainId: token, defaultOpen: true, disablePostMessage: true })

  /** Fire-and-forget. The endpoint answers 204 to everything; nothing here is
   *  awaited and a failure is swallowed, because analytics must never be able
   *  to break or stall the page. */
  const beacon = useCallback(
    (event: EngagementEvent) => {
      try {
        void fetch('/api/demo/engagement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, event, anonymousId: getAnonymousId() }),
          keepalive: true,
        }).catch(() => {})
      } catch {
        // ignored
      }
    },
    [token]
  )

  // StrictMode invokes effects twice in development; without the ref every dev
  // open would write two rows, and "opened" is a count an agency reads.
  const openedSent = useRef(false)
  useEffect(() => {
    if (openedSent.current) return
    openedSent.current = true
    beacon('opened')
  }, [beacon])

  // Derived from the transcript rather than from the send handlers, so a
  // question typed into the input and one clicked from a starter chip are both
  // counted, and neither is counted twice.
  const conversationSent = useRef(false)
  useEffect(() => {
    if (conversationSent.current) return
    if (!onChats.some((chat) => chat.role === 'user')) return
    conversationSent.current = true
    beacon('conversation_started')
  }, [onChats, beacon])

  useEffect(() => setOnChats([]), [token, setOnChats])

  const ask = useCallback(
    (question: string) => {
      // `setValue` writes react-hook-form's internal values synchronously, so
      // the submit handler that runs next already sees the question.
      setValue('content', question, { shouldValidate: true })
      void onStartChatting()
    },
    [setValue, onStartChatting]
  )

  const onCta = useCallback(() => {
    beacon('cta_clicked')
    ask(CTA_MESSAGE)
  }, [beacon, ask])

  const host = (() => {
    if (!websiteUrl) return null
    try {
      return new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname.replace(/^www\./, '')
    } catch {
      return null
    }
  })()

  const hasStarted = onChats.some((chat) => chat.role === 'user')

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1120px] px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex items-start gap-3.5">
          {logoUrl && !logoBroken ? (
            // eslint-disable-next-line @next/next/no-img-element -- the logo is
            // an arbitrary customer-hosted URL, which next/image cannot serve
            // without an allow-list entry per prospect.
            <img
              src={logoUrl}
              alt=""
              onError={() => setLogoBroken(true)}
              className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white object-contain"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-2xl">
              {displayName}
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              An AI assistant, built from {host ? `the public pages on ${host}` : 'your public website'}.
            </p>
          </div>
        </header>

        <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">
          Everything below answers from your own website content and nothing else. Ask it what a
          customer would ask. When your site does not cover something, it will say so rather than
          invent an answer — you can try that too.
        </p>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
            <div className="bg-[linear-gradient(135deg,#f8f9fc_0%,#eef0f6_100%)] p-3 sm:p-5">
              <Loader loading={loading}>
                {currentBot ? (
                  <div className="mx-auto h-[70vh] min-h-[460px] max-w-[520px] sm:h-[620px]">
                    <BotWindow
                      errors={errors}
                      helpdesk={currentBot.helpdesk || []}
                      domainName={currentBot.name || displayName}
                      ref={messageWindowRef}
                      help={currentBot.chatBot?.helpdesk}
                      theme={currentBot.chatBot?.background}
                      textColor={currentBot.chatBot?.textColor}
                      // The assistant's own configured theme wins; otherwise the
                      // prospect's brand colour drives the send button and their
                      // own message bubbles.
                      themeConfig={
                        currentBot.chatBot?.theme ?? {
                          primary: accent,
                          accent,
                          userBubbleBg: accent,
                        }
                      }
                      chats={onChats}
                      register={register}
                      watch={watch}
                      onChat={onStartChatting}
                      onResponding={onAiTyping}
                      botIcon={currentBot.chatBot?.icon || currentBot.icon || null}
                      // Deliberately no `onSuggestion`: BotWindow's built-in chips
                      // only fill the input, and the starters below actually send.
                      // Two sets of chips on one screen is noise.
                    />
                  </div>
                ) : (
                  <div className="grid h-[460px] place-items-center px-6 text-center text-sm text-slate-500">
                    This demo could not be loaded. Ask whoever sent you the link for a fresh one.
                  </div>
                )}
              </Loader>
            </div>
          </section>

          <aside className="space-y-4">
            {currentBot && !hasStarted && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.04)]">
                <p className="text-sm font-semibold text-slate-900">Try one of these</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">
                  Whatever your customers ask on the phone works here too.
                </p>
                <div className="mt-4 space-y-2">
                  {STARTERS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => ask(question)}
                      className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.04)]">
              <p className="text-sm font-semibold text-slate-900">Want this on your website?</p>
              <p className="mt-2 text-[13px] leading-5 text-slate-500">
                It answers visitors around the clock and passes on anything it cannot handle. Ask
                here and whoever sent you this link will see the question, or just reply to them
                directly.
              </p>
              <button
                type="button"
                onClick={onCta}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                Ask about setting this up
              </button>
            </div>

            {/* Messages here are stored and readable by whoever built the demo,
                exactly like the inbox of a real installed widget. Saying
                "nothing is published publicly" would be true and still leave
                the wrong impression, so it says who can read it instead. */}
            <p className="px-1 text-[11px] leading-4 text-slate-400">
              A demo built for {displayName}. Whoever sent you this link can read what you ask
              here, the same way they would see messages from your website.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
