'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, PauseCircle, Rocket } from 'lucide-react'

import { onSetAssistantStatus, type PublishableStatus } from '@/actions/settings'
import { useToast } from '@/components/ui/use-toast'

/**
 * The publish switch.
 *
 * This is the control that decides whether the embed snippet on a client's
 * website answers or returns 403 — so it says what will happen in the world
 * ("Go live" / "Take offline"), not what it writes to a column.
 *
 * The optimistic state is deliberate: the round trip is a single row update,
 * and a status badge that lags behind the click reads as a failure. It is
 * reverted on any non-200.
 */

const LABEL: Record<PublishableStatus, { badge: string; tone: string }> = {
  published: { badge: 'Live', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  paused: { badge: 'Paused', tone: 'bg-muted text-muted-foreground ring-border' },
  draft: { badge: 'Not published', tone: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
}

export default function PublishToggle({
  workspaceId,
  status,
  canPublish,
  compact = false,
  onChanged,
}: {
  workspaceId: string
  status: PublishableStatus
  canPublish: boolean
  compact?: boolean
  /** Lets a parent that renders its own copy for the state stay in step. */
  onChanged?: (next: PublishableStatus) => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [current, setCurrent] = React.useState<PublishableStatus>(status)
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => setCurrent(status), [status])

  const isLive = current === 'published'
  const label = LABEL[current] ?? LABEL.draft

  const change = async (next: PublishableStatus) => {
    const previous = current
    setCurrent(next)
    onChanged?.(next)
    setPending(true)

    const res = await onSetAssistantStatus(workspaceId, next)

    if (res.status === 200) {
      // The warning rides along as the description rather than a destructive
      // toast: the publish succeeded, and colouring it like a failure would
      // teach people to ignore real failures.
      toast({
        title: res.message,
        description: 'warning' in res && res.warning ? res.warning : undefined,
      })
      router.refresh()
    } else {
      setCurrent(previous)
      onChanged?.(previous)
      toast({
        title: 'Could not change the status',
        description: 'message' in res ? res.message : undefined,
        variant: 'destructive',
      })
    }

    setPending(false)
  }

  if (!canPublish) {
    return (
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${label.tone}`}>
        {label.badge}
      </span>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {!compact && (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${label.tone}`}>
          {label.badge}
        </span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => change(isLive ? 'paused' : 'published')}
        title={
          isLive
            ? 'Stops the widget answering on the client’s website. Nothing is deleted.'
            : 'Makes the installed widget start answering on the client’s website.'
        }
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-bold transition-colors disabled:opacity-60 ${
          isLive
            ? 'border border-border bg-card text-foreground hover:bg-muted'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isLive ? (
          <PauseCircle className="h-3.5 w-3.5" />
        ) : (
          <Rocket className="h-3.5 w-3.5" />
        )}
        {isLive ? 'Take offline' : 'Go live'}
      </button>
    </div>
  )
}
