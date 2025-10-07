'use client'

import React, { useMemo, useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { onChangeSubscriptionPlan } from '@/actions/dodo'
import { useToast } from '../ui/use-toast'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  currentPlan: 'STANDARD' | 'PRO' | 'ULTIMATE'
}

const ChangePlan = ({ currentPlan }: Props) => {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [targetPlan, setTargetPlan] = useState<'PRO' | 'ULTIMATE'>(
    currentPlan === 'PRO' ? 'ULTIMATE' : 'PRO'
  )

  const plansAvailable = useMemo(() => {
    const items: { id: 'PRO' | 'ULTIMATE'; label: string; desc: string }[] = [
      { id: 'PRO', label: 'Professional ($19.99/mo)', desc: 'Balanced features and price' },
      { id: 'ULTIMATE', label: 'Unlimited ($34.99/mo)', desc: 'All features unlocked' },
    ]
    return items
  }, [])

  const onSubmit = () => {
    startTransition(async () => {
      const res = await onChangeSubscriptionPlan(targetPlan)
      if (res?.status === 200) {
        toast({ title: 'Plan changed', description: 'Your subscription plan was updated successfully.' })
        window.location.reload()
      } else {
        toast({ title: 'Failed to change plan', description: res?.message || 'Please try again later.', variant: 'destructive' })
      }
    })
  }

  // Don’t render for free plan (handled elsewhere)
  if (currentPlan === 'STANDARD') return null

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Change Plan</CardTitle>
        <CardDescription>Switch between paid tiers. Proration is applied automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 block">Select new plan</Label>
          <RadioGroup
            className="space-y-3"
            value={targetPlan}
            onValueChange={(v) => setTargetPlan(v as 'PRO' | 'ULTIMATE')}
          >
            {plansAvailable.map((p) => (
              <div key={p.id} className={cn('flex items-center justify-between rounded-md border p-3', targetPlan === p.id && 'border-primary')}>
                <div>
                  <Label htmlFor={`plan-${p.id}`} className="font-medium">{p.label}</Label>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <RadioGroupItem id={`plan-${p.id}`} value={p.id} />
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button type="button" onClick={onSubmit} disabled={isPending}>
          {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...</>) : 'Change Plan'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default ChangePlan
