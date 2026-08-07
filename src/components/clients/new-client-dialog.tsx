'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Globe, Loader2 } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import SetupPreview from '@/components/dashboard/setup-preview'
import { CTA_LABEL, useCreateClient } from './use-create-client'
import { cd } from '@/lib/design-tokens'

/**
 * Adding the second client, and every one after it.
 *
 * Every "Add a client" control in the product — the overview header, both
 * roster buttons, the sidebar switcher — navigates to `/clients?new=1`. Until
 * now nothing read that parameter, so all four were links that changed the URL
 * and nothing else: creating a client was only possible on the zero-client
 * dashboard, which by definition disappears the moment you have one.
 *
 * Driven by the query parameter rather than by local state, so those existing
 * links keep working untouched and the flow stays shareable and back-button
 * safe.
 */
export default function NewClientDialog() {
  const router = useRouter()
  const params = useSearchParams()
  const open = params.get('new') === '1'

  const {
    value,
    onChange,
    phase,
    error,
    pagesFound,
    parsedDomain,
    busy,
    submit,
    reset,
    openTestPanel,
  } = useCreateClient()
  const inputId = React.useId()
  const errorId = React.useId()

  // Closing mid-crawl would abandon a workspace that has already been created,
  // so the dialog holds while work is in flight. Everything else is dismissable.
  const close = React.useCallback(() => {
    if (busy) return
    // `ready` means a client exists that the roster behind this dialog does not
    // know about yet.
    if (phase === 'ready') router.refresh()
    router.replace('/clients')
  }, [busy, phase, router])

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a client</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_240px]">
          <form onSubmit={submit} noValidate>
            <label
              htmlFor={inputId}
              className="block text-[12.5px] font-semibold text-foreground"
            >
              Client website
            </label>
            <div className="relative mt-1.5">
              <Globe
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
                aria-hidden="true"
              />
              <input
                id={inputId}
                type="text"
                inputMode="url"
                autoComplete="url"
                autoFocus
                disabled={busy}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                placeholder="acmedental.com"
                className="h-11 w-full rounded-[10px] border border-border pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring focus:ring-4 focus:ring-ring/20 disabled:opacity-60"
              />
            </div>
            <p
              id={errorId}
              role={error ? 'alert' : undefined}
              className={`mt-2 min-h-[18px] text-[12px] ${
                error ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {error ?? 'Use the main public domain. No sitemap or technical access needed.'}
            </p>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] px-5 text-[13.5px] font-semibold text-white transition-colors disabled:opacity-70"
              style={{ backgroundColor: cd.accent }}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
              {CTA_LABEL[phase] ?? CTA_LABEL.idle}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="rounded-[12px] border border-border bg-muted/40 p-4">
            <SetupPreview
              phase={phase}
              domain={parsedDomain ?? undefined}
              error={error}
              pagesFound={pagesFound ?? undefined}
              onRetry={reset}
              onTest={openTestPanel}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
