import InfoBar from '@/components/infobar'
import BillingSettings from '@/components/settings/billing-settings'
import ChangePassword from '@/components/settings/change-password'
import PaymentSuccess from '@/components/settings/payment-success'
import { PlanType } from '@/lib/plans'
import React from 'react'

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    payment?: string
    plan?: string
    subscription_id?: string
    status?: string
  }>
}) => {
  const sp = await searchParams
  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0 flex flex-col gap-10">
        {sp.payment === 'success' && (
          <PaymentSuccess
            plan={sp.plan as PlanType}
            subscriptionId={sp.subscription_id}
            status={sp.status}
          />
        )}
        <BillingSettings />
        <ChangePassword />
      </div>
    </>
  )
}

export default Page
