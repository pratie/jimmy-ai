'use client'
import Section from '@/components/section-label'
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

  return (
    <div className="mt-10 flex flex-col gap-5 items-start">
      <Section
        label="Code snippet"
        message="Paste this in <head> (defer) or before </body> on your site."
      />

      {publishState && (
        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {publishState.assistantStatus === 'published'
              ? 'This assistant is live. The snippet below is answering visitors.'
              : 'This assistant is not live yet — the snippet below will be installed but will not answer.'}
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
      <div className="w-full flex items-center gap-3">
        <label className="text-sm">Margin</label>
        <select
          className="rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
          value={margin}
          onChange={(e)=>setMargin(parseInt(e.target.value))}
        >
          <option value={24}>24 px</option>
          <option value={32}>32 px</option>
          <option value={48}>48 px</option>
        </select>
        <label className="text-sm">Bubble</label>
        <select
          className="rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
          value={size}
          onChange={(e)=>setSize(e.target.value as 'sm'|'md')}
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
        </select>

        <button
          type="button"
          onClick={rotate}
          disabled={loadingKey || !publicKey}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          title="Issues a new key and invalidates this one. The snippet on the client's website must be replaced."
        >
          {loadingKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Rotate key
        </button>
      </div>
      <div className="relative mt-3 w-full overflow-x-auto rounded-xl border border-border bg-muted px-6 py-4">
        <Copy
          className="absolute right-5 top-5 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => {
            if (!publicKey) return
            navigator.clipboard.writeText(snippet)
            toast({
              title: 'Copied to clipboard',
              description: 'You can now paste the code inside your website',
            })
          }}
        />
        <pre className="whitespace-pre text-sm min-w-full">
          <code className="text-foreground">{snippet}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeSnippet
