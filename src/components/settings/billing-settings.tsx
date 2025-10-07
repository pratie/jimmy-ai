import { onGetSubscriptionPlan } from '@/actions/settings'
import React from 'react'
import Section from '../section-label'
import { Card, CardContent, CardDescription } from '../ui/card'
import { Check, CheckCircle2, Plus } from 'lucide-react'
import { pricingCards } from '@/constants/landing-page'
import Modal from '../mondal'
import SubscriptionForm from '../forms/settings/subscription-form'
import Image from 'next/image'
import CancelSubscriptionButton from './cancel-subscription'
import ChangePlan from './change-plan'

type Props = {}

const BillingSettings = async (props: Props) => {
  const plan = await onGetSubscriptionPlan() || 'STANDARD'
  const planFeatures = pricingCards.find(
    (card) => card.title.toUpperCase() === plan?.toUpperCase()
  )?.features || []

  console.log(planFeatures)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <div className="lg:col-span-1">
        <Section
          label="Billing settings"
          message="Add payment information, upgrade and modify your plan."
        />
      </div>
      {plan === 'STANDARD' ? (
        <div className="lg:col-span-2 flex justify-start lg:justify-center ">
          <Modal
            title="Choose A Plan"
            description="Tell us about yourself! What do you do? Let's tailor your experience so it best suits you."
            trigger={
              <Card className="border-dashed bg-cream border-gray-400 w-full cursor-pointer h-[270px] flex justify-center items-center">
                <CardContent className="flex gap-2 items-center">
                  <div className="rounded-full border-2 p-1">
                    <Plus className="text-gray-400" />
                  </div>
                  <CardDescription className="font-semibold">
                    Upgrade Plan
                  </CardDescription>
                </CardContent>
              </Card>
            }
          >
            <SubscriptionForm plan={plan!} />
          </Modal>
        </div>
      ) : (
        <div className="lg:col-span-2" />
      )}
      <div className="lg:col-span-2">
        <h3 className="text-xl font-semibold mb-2">Current Plan</h3>
        <p className="text-sm font-semibold">{plan}</p>
        <div className="flex gap-2 flex-col mt-2">
          {planFeatures.map((feature) => (
            <div
              key={feature}
              className="flex gap-2"
            >
              <CheckCircle2 className="text-muted-foreground" />
              <p className="text-muted-foreground">{feature}</p>
            </div>
          ))}
        </div>
        {plan !== 'STANDARD' && (
          <div className="mt-6">
            <CancelSubscriptionButton />
            <p className="text-xs text-muted-foreground mt-2">
              You will retain access until the end of your billing period.
            </p>
          </div>
        )}
        {plan !== 'STANDARD' && (
          <ChangePlan currentPlan={plan as 'PRO' | 'ULTIMATE' | 'STANDARD'} />
        )}
      </div>
    </div>
  )
}

export default BillingSettings
