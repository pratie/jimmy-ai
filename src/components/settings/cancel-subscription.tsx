'use client'

import React, { useState, useTransition } from 'react'
import { Button } from '../ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { onCancelSubscription } from '@/actions/dodo'
import { useRouter } from 'next/navigation'
import { useToast } from '../ui/use-toast'
import { Loader2 } from 'lucide-react'

export const CancelSubscriptionButton = () => {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await onCancelSubscription({ atPeriodEnd: true })
      if (res?.status === 200) {
        toast({ title: 'Cancellation scheduled', description: 'Your subscription will remain active until the end of the billing period.' })
        setOpen(false)
        router.refresh()
      } else {
        toast({ title: 'Cancellation failed', description: 'Please try again or contact support.', variant: 'destructive' })
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Cancel Subscription</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel at period end?</AlertDialogTitle>
          <AlertDialogDescription>
            You will keep access until the end of your current billing cycle. This action schedules cancellation and can be reversed by contacting support or re-subscribing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep Plan</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...</> : 'Confirm Cancellation'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CancelSubscriptionButton

