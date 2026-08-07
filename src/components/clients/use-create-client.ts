'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { onIntegrateDomain } from '@/actions/settings'
import { onScrapeWebsiteForDomain } from '@/actions/firecrawl'
import type { SetupPhase } from '@/components/dashboard/setup-preview'

/**
 * Creating a client, in one place.
 *
 * This used to live inside the zero-client dashboard only, which meant the
 * *second* client could not be created at all: every "Add a client" button in
 * the product pointed at `/clients?new=1`, and nothing on that route read the
 * parameter. The flow is a hook now so the first-run screen and the roster
 * dialog run identical logic — same validation, same phases, same partial
 * success handling — rather than one of them being a link to nowhere.
 */

/** Accepts what people actually paste, rejects what cannot be a domain. */
export function normaliseDomain(
  raw: string
): { ok: true; domain: string } | { ok: false; reason: string } {
  const trimmed = raw.trim().toLowerCase()
  if (!trimmed) return { ok: false, reason: 'Enter the client’s website address.' }

  const stripped = trimmed
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/\s+/g, '')

  if (stripped.includes('@')) {
    return { ok: false, reason: 'That looks like an email address — enter the website instead.' }
  }
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(stripped)) {
    return { ok: false, reason: 'That does not look like a domain. Try something like acmedental.com' }
  }
  return { ok: true, domain: stripped }
}

/** The primary button's label for each real phase — never a generic spinner. */
export const CTA_LABEL: Record<string, string> = {
  idle: 'Create client assistant',
  connecting: 'Connecting…',
  discovering: 'Discovering pages…',
  reading: 'Reading business info…',
  indexing: 'Preparing knowledge…',
  drafting: 'Preparing assistant…',
  ready: 'Test assistant',
  failed: 'Try again',
}

/**
 * A server action that never returns must not become a spinner that never
 * stops.
 *
 * When a Vercel function exceeds its limit it is killed without a response, so
 * the promise simply never settles — the panel sat on "Connecting…"
 * indefinitely, which reads as a broken product rather than a slow one. This
 * bounds every call so the worst case is an honest error someone can act on.
 */
async function withTimeout<T>(work: Promise<T>, seconds: number, step: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Timed out while ${step}. The site may be slow or unreachable.`)),
          seconds * 1000
        )
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export function useCreateClient() {
  const router = useRouter()
  const [value, setValue] = React.useState('')
  const [phase, setPhase] = React.useState<SetupPhase>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const [createdId, setCreatedId] = React.useState<string | null>(null)
  const [pagesFound, setPagesFound] = React.useState<number | null>(null)

  const busy = phase !== 'idle' && phase !== 'failed' && phase !== 'ready'

  /** The normalised domain, for the progress panel's heading. */
  const parsedDomain = React.useMemo(() => {
    const parsed = normaliseDomain(value)
    return parsed.ok ? parsed.domain : null
  }, [value])

  /**
   * Where a finished setup lands.
   *
   * Not the client overview: for a client created ten seconds ago that page is
   * five zeros and a chart of nothing. The first thing anyone wants after a
   * crawl finishes is to talk to the thing they just built and put their
   * client's colours on it, so it opens Test & customise directly.
   */
  const openTestPanel = React.useCallback(() => {
    if (createdId) router.push(`/settings/${createdId}?tab=appearance`)
  }, [createdId, router])

  const reset = React.useCallback(() => {
    setPhase('idle')
    setError(null)
  }, [])

  const onChange = React.useCallback(
    (next: string) => {
      setValue(next)
      setError((current) => (current ? null : current))
    },
    []
  )

  const submit = React.useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault()
      if (phase === 'ready' && createdId) {
        openTestPanel()
        return
      }
      setError(null)

      const parsed = normaliseDomain(value)
      if (!parsed.ok) {
        setError(parsed.reason)
        setPhase('idle')
        return
      }

      // Each phase corresponds to work that is actually running. The stage
      // labels previously described crawling and indexing that never happened —
      // onIntegrateDomain only creates the workspace — which made the panel a
      // more convincing lie than a plain progress bar would have been.
      setPhase('connecting')
      let created: Awaited<ReturnType<typeof onIntegrateDomain>> | null = null
      try {
        created = await withTimeout(onIntegrateDomain(parsed.domain, ''), 45, 'creating the client')
      } catch (timeoutError) {
        setPhase('failed')
        setError(
          timeoutError instanceof Error ? timeoutError.message : 'That took too long. Try again.'
        )
        return
      }

      if (created?.status !== 200 || !created.id) {
        setPhase('failed')
        setError(created?.message ?? 'Could not add that client. Try another address.')
        return
      }
      setCreatedId(created.id)

      // Real crawl + embed. This is the slow part, and the two labels either
      // side of it bracket a single call rather than reporting sub-steps we
      // cannot see.
      setPhase('discovering')
      let ingest: Awaited<ReturnType<typeof onScrapeWebsiteForDomain>> | null = null
      try {
        ingest = await withTimeout(onScrapeWebsiteForDomain(created.id), 90, 'reading the website')
      } catch (timeoutError) {
        // The client exists either way, so this is the partial-success path:
        // send them onward rather than stranding them on a dead screen.
        setPhase('ready')
        setPagesFound(0)
        setError(
          `Client created, but reading the website took too long. Open the client and import the content manually. ${
            timeoutError instanceof Error ? timeoutError.message : ''
          }`
        )
        return
      }

      if (ingest?.status !== 200) {
        // The client exists and is usable — only the automatic import failed,
        // so this is a partial success, not a dead end.
        setPhase('ready')
        setPagesFound(0)
        setError(
          'message' in (ingest ?? {})
            ? `Client created, but we could not import the website automatically. ${ingest?.message ?? ''}`
            : 'Client created, but the website import failed. You can add sources manually.'
        )
        return
      }

      // The remaining stages all happen inside that one call, so they complete
      // together rather than being animated one at a time for effect.
      setPagesFound('chunksCreated' in ingest ? Number(ingest.chunksCreated ?? 0) : 0)
      setPhase('ready')
    },
    [createdId, openTestPanel, phase, value]
  )

  return {
    value,
    onChange,
    phase,
    error,
    createdId,
    pagesFound,
    parsedDomain,
    busy,
    submit,
    reset,
    openTestPanel,
  }
}
