'use client'
import React from 'react'
import { CardDescription } from '../ui/card'
import { Loader } from '../loader'
import { Button } from '../ui/button'
import { useCompleteSubscriptionPayment, useDodoSubscription } from '@/hooks/billing/use-billing'
import { PlanType } from '@/lib/plans'

type PaymentFormProps = {
  plan: PlanType
  interval?: 'MONTHLY' | 'YEARLY'
}

export const PaymentForm = ({ plan, interval = 'MONTHLY' }: PaymentFormProps) => {
  const { paymentLink, loadForm } = useDodoSubscription(plan, interval)
  const { onRedirectToSubscriptionPayment } = useCompleteSubscriptionPayment(plan)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-semibold text-xl text-black">Payment Method</h2>
        <CardDescription>
          {plan === 'FREE'
            ? 'Free plan - no payment required'
            : 'You will be redirected to Dodo Payments to complete your subscription'
          }
        </CardDescription>
      </div>

      {plan !== 'FREE' && (
        <div className="p-4 bg-brand-accent/10 rounded-lg">
          <p className="text-sm text-brand-primary/70 mb-2">
            🔒 Secure payment processing by Dodo Payments
          </p>
          <p className="text-xs text-brand-primary/60">
            • 3-day free trial included
            • Cancel anytime
            • {interval === 'YEARLY' ? 'Annual billing' : 'Monthly billing'}
          </p>
        </div>
      )}

      <Button
        type="button"
        onClick={() => onRedirectToSubscriptionPayment(paymentLink)}
        disabled={loadForm || (plan !== 'FREE' && !paymentLink)}
      >
        <Loader loading={loadForm}>
          {plan === 'FREE' ? 'Activate Free Plan' : 'Subscribe Now'}
        </Loader>
      </Button>
    </div>
  )
}
