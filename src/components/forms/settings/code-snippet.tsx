'use client'
import { useToast } from '@/components/ui/use-toast'
import { Copy, Loader2, RefreshCw } from 'lucide-react'
import React from 'react'

import {
  onGetAssistantPublishState,
  onGetEmbedKey,
  onRotateEmbedKey,
  type PublishableStatus,
} from '@/actions/settings'
import PublishToggle from '@/components/clients/publish-toggle'

type Props = {
  id: string
}

/**
 * The install snippet.
 *
 * Carries `data-key`, a rotatable AssistantDeployment public key. It used to
 * carry the workspace's database id in the script tag's `id` attribute, which
 * meant the embed code was a permanent, un-revocable credential published on
 * the client's own website — and anyone who read the page source had it.
 */
const CodeSnippet = ({ id }: Props) => {
  const { toast } = useToast()
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

  const [margin, setMargin] = React.useState(24)
  const [size, setSize] = React.useState<'sm'|'md'>('md')
  const [publicKey, setPublicKey] = React.useState<string | null>(null)
  const [loadingKey, setLoadingKey] = React.useState(true)

  const [publishState, setPublishState] = React.useState<{
    assistantStatus: PublishableStatus
    canPublish: boolean
  } | null>(null)

  // Copying the snippet is the moment someone believes the widget works. If the
  // assistant is still a draft it will 403 on every visitor, so the state has to
  // be visible right here rather than one screen away.
  React.useEffect(() => {
    let cancelled = false
    onGetAssistantPublishState(id).then((res) => {
      if (cancelled) return
      if (res.status === 200 && res.assistantStatus) {
        setPublishState({
          assistantStatus: res.assistantStatus,
          canPublish: res.canPublish === true,
        })
      }
    })
    return () => {
      cancelled = true
    }
  }, [id])

  React.useEffect(() => {
    let cancelled = false
    onGetEmbedKey(id)
      .then((res) => {
        if (cancelled) return
        if (res.status === 200 && 'publicKey' in res) setPublicKey(res.publicKey ?? null)
        else toast({ title: 'Could not load the embed key', description: 'message' in res ? res.message : undefined, variant: 'destructive' })
      })
      .finally(() => !cancelled && setLoadingKey(false))
    return () => { cancelled = true }
  }, [id, toast])

  const rotate = async () => {
    setLoadingKey(true)
    const res = await onRotateEmbedKey(id)
    if (res.status === 200 && 'publicKey' in res) {
      setPublicKey(res.publicKey ?? null)
      toast({ title: 'Key rotated', description: res.message })
    } else {
      toast({ title: 'Could not rotate the key', variant: 'destructive' })
    }
    setLoadingKey(false)
  }

  const snippet = publicKey
    ? `<script defer src="${appUrl}/embed.min.js" data-key="${publicKey}" data-app-origin="${appUrl}" data-margin="${margin}" data-size="${size}"></script>`
    : 'Loading your embed key…'

  const SELECT =
    'rounded-md border border-border bg-card px-2 py-1 text-[12px] font-medium text-foreground outline-none transition-colors duration-150 focus:border-ring'

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {publishState && (
        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
          <p className="min-w-0 flex-1 text-[11.5px] leading-5 text-muted-foreground">
            {publishState.assistantStatus === 'published'
              ? 'Live. The snippet below is answering visitors.'
              : 'Not live yet — the snippet installs, but the assistant will not answer.'}
          </p>
          <PublishToggle
            workspaceId={id}
            status={publishState.assistantStatus}
            canPublish={publishState.canPublish}
            compact
            onChanged={(next) =>
              setPublishState((s) => (s ? { ...s, assistantStatus: next } : s))
            }
          />
        </div>
      )}

      <div className="relative w-full min-w-0 overflow-hidden rounded-lg border border-border bg-muted">
        <button
          type="button"
          aria-label="Copy the snippet"
          className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-md bg-card/90 text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[color,transform] duration-150 hover:text-foreground active:scale-[0.94] disabled:opacity-50 motion-reduce:active:scale-100"
          disabled={!publicKey}
          onClick={() => {
            if (!publicKey) return
            navigator.clipboard.writeText(snippet)
            toast({
              title: 'Copied',
              description: 'Paste it into the site’s HTML.',
            })
          }}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <pre className="overflow-x-auto px-3 py-3 pr-12 text-[11.5px] leading-5">
          <code className="text-foreground">{snippet}</code>
        </pre>
      </div>
      <p className="text-[11px] leading-4 text-muted-foreground/70">
        Goes in <code className="font-mono">&lt;head&gt;</code> or just before{' '}
        <code className="font-mono">&lt;/body&gt;</code>. It stays current on its own.
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-3">
        <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          Margin
          <select className={SELECT} value={margin} onChange={(e) => setMargin(parseInt(e.target.value))}>
            <option value={24}>24 px</option>
            <option value={32}>32 px</option>
            <option value={48}>48 px</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          Bubble
          <select className={SELECT} value={size} onChange={(e) => setSize(e.target.value as 'sm' | 'md')}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
          </select>
        </label>

        <button
          type="button"
          onClick={rotate}
          disabled={loadingKey || !publicKey}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-semibold text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:opacity-50"
          title="Issues a new key and invalidates this one. The snippet on the client's website must be replaced."
        >
          {loadingKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Rotate key
        </button>
      </div>
    </div>
  )
}

export default CodeSnippet
