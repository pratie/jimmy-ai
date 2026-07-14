import type { Metadata } from 'next'
import { onGetAllCampaigns, onGetAllCustomers } from '@/actions/mail'
import EmailMarketing from '@/components/email-marketing'
import InfoBar from '@/components/infobar'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

type Props = {}

export const metadata: Metadata = {
  title: 'Email Marketing — ChatDock',
  robots: { index: false, follow: false },
}

const Page = async (props: Props) => {
  const user = await currentUser()

  if (!user) return null
  const customers = await onGetAllCustomers(user.id)
  const campaigns = await onGetAllCampaigns(user.id)

  return (
    <>
      <InfoBar></InfoBar>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-8">
          <EmailMarketing campaign={campaigns?.campaign!} subscription={customers?.subscription!} domains={customers?.domains!} />
        </div>
      </div>
    </>
  )
}

export default Page
