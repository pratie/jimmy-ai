'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'

import { onDeleteUserDomain } from '@/actions/settings'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * Deleting a client.
 *
 * This lives at the top of the client page because it was previously buried at
 * the foot of a settings tab, behind three clicks, next to an unlabelled Save —
 * which is a strange place to hide the one action that takes a client's widget
 * off their website.
 *
 * Being easy to reach means it must be hard to do by accident, so the
 * confirmation asks the operator to type the client's name. That is deliberate
 * friction, not ceremony: the same screen has a Delete for the *demo* of a
 * prospect and a Delete for a paying client, and the cost of confusing them is
 * a live site losing its assistant mid-conversation.
 *
 * It states real counts rather than a generic warning. "Delete this client?" is
 * easy to click through; "48 conversations and 12 leads" is not.
 */

export type DeleteClientDialogProps = {
  workspaceId: string
  /** Typed back by the operator to confirm. Shown verbatim. */
  clientName: string
  counts: {
    conversations: number
    leads: number
    bookings: number
    passages: number
  }
  /** Where to go once it is gone. The client's own page will 404. */
  redirectTo?: string
}

export default function DeleteClientDialog({
  workspaceId,
  clientName,
  counts,
  redirectTo = '/clients',
}: DeleteClientDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [typed, setTyped] = React.useState('')
  const [deleting, setDeleting] = React.useState(false)

  // Case- and whitespace-insensitive: the point is proving you know which
  // client this is, not transcribing it exactly.
  const confirmed = typed.trim().toLowerCase() === clientName.trim().toLowerCase()

  const lines = [
    counts.conversations > 0 && `${counts.conversations} conversation${counts.conversations === 1 ? '' : 's'}`,
    counts.leads > 0 && `${counts.leads} lead${counts.leads === 1 ? '' : 's'}`,
    counts.bookings > 0 && `${counts.bookings} booking request${counts.bookings === 1 ? '' : 's'}`,
    counts.passages > 0 && `${counts.passages} indexed passage${counts.passages === 1 ? '' : 's'}`,
  ].filter(Boolean) as string[]

  const onDelete = async () => {
    setDeleting(true)
    const res = await onDeleteUserDomain(workspaceId)

    if (res.status === 200) {
      toast({
        title: res.message,
        description: `${clientName} has been removed and its widget is offline.`,
      })
      setOpen(false)
      router.push(redirectTo)
      router.refresh()
    } else {
      toast({
        title: 'Could not delete this client',
        description: 'message' in res ? res.message : undefined,
        variant: 'destructive',
      })
      setDeleting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTyped('')
          setOpen(true)
        }}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>

      <AlertDialog open={open} onOpenChange={(next) => !deleting && setOpen(next)}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-slate-900">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-50">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              </span>
              Delete {clientName}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-[13px] leading-6 text-slate-600">
                <p>
                  Their assistant stops answering immediately. If the embed script is still on{' '}
                  {clientName}, the chat widget disappears from their website.
                </p>

                {lines.length > 0 ? (
                  <p>
                    <span className="font-bold text-slate-900">{lines.join(', ')}</span> will be
                    removed from your dashboard along with it.
                  </p>
                ) : (
                  <p>This client has no conversations or leads yet.</p>
                )}

                <p>You will not be able to undo this from the dashboard.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-1">
            <label
              htmlFor="confirm-client-name"
              className="text-[12px] font-bold text-slate-700"
            >
              Type <span className="font-black text-slate-900">{clientName}</span> to confirm
            </label>
            <input
              id="confirm-client-name"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              disabled={deleting}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
            />
          </div>

          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel
              disabled={deleting}
              className="h-9 rounded-lg border-slate-200 text-[13px] font-bold"
            >
              Keep this client
            </AlertDialogCancel>
            {/* Not AlertDialogAction: that closes the dialog on click, which
                would dismiss it mid-request and hide any failure. */}
            <button
              type="button"
              onClick={onDelete}
              disabled={!confirmed || deleting}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 text-[13px] font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              {deleting ? 'Deleting…' : 'Delete client'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
