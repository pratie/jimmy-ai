import { onGetSubscriptionPlan } from '@/actions/settings'
import React from 'react'
import Section from '../section-label'
import { CheckCircle2, CreditCard } from 'lucide-react'
import { pricingCards } from '@/constants/landing-page'
import UpgradePlanModal from './upgrade-plan-modal'
import CancelSubscriptionButton from './cancel-subscription'
import ChangePlan from './change-plan'

type Props = {}

const BillingSettings = async (props: Props) => {
  const plan = await onGetSubscriptionPlan() || 'FREE'
  const planFeatures = pricingCards.find(
    (card) => card.title.toUpperCase() === plan?.toUpperCase()
  )?.features || []

  return (
    <section className="grid gap-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_24px_rgba(15,23,42,.035)] lg:grid-cols-[220px_minmax(0,1fr)] md:p-7">
      <div>
        <Section
          label="Billing settings"
          message="Plan, usage, and subscription controls."
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Current plan</p><h3 className="mt-1 text-xl font-semibold text-slate-950">{plan}</h3></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm"><CreditCard className="h-4 w-4" /></span></div>
          <div className="mt-5 space-y-2.5">
          {planFeatures.map((feature) => (
            <div key={feature} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <p>{feature}</p>
            </div>
          ))}
          {!planFeatures.length && <p className="text-xs leading-5 text-slate-500">Start with one agent and upgrade when you need more client capacity.</p>}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          {plan === 'FREE' ? <UpgradePlanModal currentPlan={plan as any} /> : <><ChangePlan currentPlan={plan as 'STARTER' | 'PRO' | 'BUSINESS'} /><div className="mt-5 border-t border-slate-200 pt-5"><CancelSubscriptionButton /><p className="mt-2 text-xs text-slate-500">Access remains active until the end of the billing period.</p></div></>}
        </div>
      </div>
    </section>
  )
}

export default BillingSettings
