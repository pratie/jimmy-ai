'use client'
import { Loader } from '@/components/loader'
import { StripeElements } from '@/components/settings/stripe-elements'
import SubscriptionCard from '@/components/settings/subscription-card'
import { Button } from '@/components/ui/button'
import { useSubscriptions } from '@/hooks/billing/use-billing'
import { PlanType } from '@/lib/plans'
import React from 'react'

type Props = {
  plan: PlanType
}

const SubscriptionForm = ({ plan }: Props) => {
  const { loading, onSetPayment, payment, onUpdateToFreeTier } =
    useSubscriptions(plan)

  return (
    <Loader loading={loading}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <SubscriptionCard
            title="FREE"
            description="Perfect if you're just getting started with Corinna AI"
            price="0"
            payment={payment}
            onPayment={onSetPayment}
            id="FREE"
          />

          <SubscriptionCard
            title="STARTER"
            description="Perfect for small businesses and individuals"
            price="19"
            payment={payment}
            onPayment={onSetPayment}
            id="STARTER"
          />

          <SubscriptionCard
            title="PRO"
            description="Advanced features for growing businesses"
            price="49"
            payment={payment}
            onPayment={onSetPayment}
            id="PRO"
          />

          <SubscriptionCard
            title="BUSINESS"
            description="Enterprise-grade solution with unlimited resources"
            price="99"
            payment={payment}
            onPayment={onSetPayment}
            id="BUSINESS"
          />
        </div>
        <StripeElements payment={payment} />
        {payment === 'FREE' && (
          <Button onClick={onUpdateToFreeTier}>
            <Loader loading={loading}>Confirm</Loader>
          </Button>
        )}
      </div>
    </Loader>
  )
}

export default SubscriptionForm
