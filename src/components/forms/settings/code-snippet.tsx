'use client'
import Section from '@/components/section-label'
import { useToast } from '@/components/ui/use-toast'
import { Copy, Loader2, RefreshCw } from 'lucide-react'
import React from 'react'

import { onGetEmbedKey, onRotateEmbedKey } from '@/actions/settings'

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
      <div className="w-full flex items-center gap-3">
        <label className="text-sm">Margin</label>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={margin}
          onChange={(e)=>setMargin(parseInt(e.target.value))}
        >
          <option value={24}>24 px</option>
          <option value={32}>32 px</option>
          <option value={48}>48 px</option>
        </select>
        <label className="text-sm">Bubble</label>
        <select
          className="border rounded-md px-2 py-1 text-sm"
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
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50"
          title="Issues a new key and invalidates this one. The snippet on the client's website must be replaced."
        >
          {loadingKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Rotate key
        </button>
      </div>
      <div className="bg-cream px-6 py-4 rounded-lg relative w-full overflow-x-auto mt-3">
        <Copy
          className="absolute top-5 right-5 text-brand-primary/60 hover:text-brand-primary cursor-pointer"
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
          <code className="text-brand-primary/70">{snippet}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeSnippet
