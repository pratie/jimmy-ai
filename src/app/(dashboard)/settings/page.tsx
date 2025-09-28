import InfoBar from '@/components/infobar'
import BillingSettings from '@/components/settings/billing-settings'
import ChangePassword from '@/components/settings/change-password'
import DarkModetoggle from '@/components/settings/dark-mode'
import PaymentSuccess from '@/components/settings/payment-success'
import React from 'react'

type Props = {
  searchParams: {
    payment?: string
    plan?: string
    subscription_id?: string
    status?: string
  }
}

const Page = ({ searchParams }: Props) => {
  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0 flex flex-col gap-10">
        {searchParams.payment === 'success' && (
          <PaymentSuccess
            plan={searchParams.plan as 'STANDARD' | 'PRO' | 'ULTIMATE'}
            subscriptionId={searchParams.subscription_id}
            status={searchParams.status}
          />
        )}
        <BillingSettings />
        <DarkModetoggle />
        <ChangePassword />
      </div>
    </>
  )
}

export default Page
