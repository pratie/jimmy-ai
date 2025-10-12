'use client'
import { Loader } from '@/components/loader'
import { StripeElements } from '@/components/settings/stripe-elements'
import SubscriptionCard from '@/components/settings/subscription-card'
import { Button } from '@/components/ui/button'
import { useSubscriptions } from '@/hooks/billing/use-billing'
import { PlanType } from '@/lib/plans'
import React, { useState } from 'react'
import clsx from 'clsx'

type Props = {
  plan: PlanType
}

const SubscriptionForm = ({ plan }: Props) => {
  const { loading, onSetPayment, payment, onUpdateToFreeTier } =
    useSubscriptions(plan)
  const [isYearly, setIsYearly] = useState(false)

  // Pricing data
  const pricingData = {
    FREE: { monthly: '0', yearly: '0', monthlyEquivalent: '0' },
    STARTER: { monthly: '19', yearly: '134', monthlyEquivalent: '11' },
    PRO: { monthly: '49', yearly: '348', monthlyEquivalent: '29' },
    BUSINESS: { monthly: '99', yearly: '708', monthlyEquivalent: '59' },
  }

  return (
    <Loader loading={loading}>
      <div className="flex flex-col gap-5">
        {/* Monthly/Yearly Toggle */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className={clsx('text-sm font-semibold', !isYearly ? 'text-primary' : 'text-muted-foreground')}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-7 w-12 items-center rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          >
            <span
              className={clsx(
                'inline-block h-5 w-5 transform rounded-full bg-primary transition-transform',
                isYearly ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
          <span className={clsx('text-sm font-semibold', isYearly ? 'text-primary' : 'text-muted-foreground')}>
            Yearly
            <span className="ml-2 text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
              Save up to 40%
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <SubscriptionCard
            title="FREE"
            description="Perfect if you&apos;re just getting started with BookmyLead"
            price={isYearly ? pricingData.FREE.yearly : pricingData.FREE.monthly}
            payment={payment}
            onPayment={onSetPayment}
            id="FREE"
          />

          <SubscriptionCard
            title="STARTER"
            description={isYearly ? `$${pricingData.STARTER.monthlyEquivalent}/mo • Billed $${pricingData.STARTER.yearly}/year` : 'Perfect for small businesses and individuals'}
            price={isYearly ? pricingData.STARTER.monthlyEquivalent : pricingData.STARTER.monthly}
            payment={payment}
            onPayment={onSetPayment}
            id="STARTER"
          />

          <SubscriptionCard
            title="PRO"
            description={isYearly ? `$${pricingData.PRO.monthlyEquivalent}/mo • Billed $${pricingData.PRO.yearly}/year` : 'Advanced features for growing businesses'}
            price={isYearly ? pricingData.PRO.monthlyEquivalent : pricingData.PRO.monthly}
            payment={payment}
            onPayment={onSetPayment}
            id="PRO"
          />

          <SubscriptionCard
            title="BUSINESS"
            description={isYearly ? `$${pricingData.BUSINESS.monthlyEquivalent}/mo • Billed $${pricingData.BUSINESS.yearly}/year` : 'Enterprise-grade solution with unlimited resources'}
            price={isYearly ? pricingData.BUSINESS.monthlyEquivalent : pricingData.BUSINESS.monthly}
            payment={payment}
            onPayment={onSetPayment}
            id="BUSINESS"
          />
        </div>
        <StripeElements payment={payment} interval={isYearly ? 'YEARLY' : 'MONTHLY'} />
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
