import type { Metadata } from 'next'
import InfoBar from '@/components/infobar'
import BillingSettings from '@/components/settings/billing-settings'
import ChangePassword from '@/components/settings/change-password'
import PaymentSuccess from '@/components/settings/payment-success'
import WhiteLabelBranding from '@/components/settings/white-label-form'
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
      <div className="chat-window mx-auto flex h-0 w-full max-w-[1280px] flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 md:px-8 md:py-6">
        {sp.payment === 'success' && (
          <PaymentSuccess
            plan={sp.plan as PlanType}
            subscriptionId={sp.subscription_id}
            status={sp.status}
          />
        )}
        <BillingSettings />
        <WhiteLabelBranding />
        <ChangePassword />
      </div>
    </>
  )
}

export default Page

export const metadata: Metadata = {
  title: 'Settings — ChatDock',
  robots: { index: false, follow: false },
}
