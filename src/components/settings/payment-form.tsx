'use client'
import React from 'react'
import { CardDescription } from '../ui/card'
import { Loader } from '../loader'
import { Button } from '../ui/button'
import { useCompleteSubscriptionPayment, useDodoSubscription } from '@/hooks/billing/use-billing'

type PaymentFormProps = {
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
}

export const PaymentForm = ({ plan }: PaymentFormProps) => {
  const { paymentLink, loadForm } = useDodoSubscription(plan)
  const { onRedirectToSubscriptionPayment } = useCompleteSubscriptionPayment(plan)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-semibold text-xl text-black">Payment Method</h2>
        <CardDescription>
          {plan === 'STANDARD'
            ? 'Free plan - no payment required'
            : 'You will be redirected to Dodo Payments to complete your subscription'
          }
        </CardDescription>
      </div>

      {plan !== 'STANDARD' && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            🔒 Secure payment processing by Dodo Payments
          </p>
          <p className="text-xs text-gray-500">
            • 3-day free trial included
            • Cancel anytime
            • Monthly billing
          </p>
        </div>
      )}

      <Button
        type="button"
        onClick={() => onRedirectToSubscriptionPayment(paymentLink)}
        disabled={loadForm || (plan !== 'STANDARD' && !paymentLink)}
      >
        <Loader loading={loadForm}>
          {plan === 'STANDARD' ? 'Activate Free Plan' : 'Subscribe Now'}
        </Loader>
      </Button>
    </div>
  )
}
