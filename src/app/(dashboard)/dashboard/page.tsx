import type { Metadata } from 'next'
import AutoUpgradeRedirect from '@/components/dashboard/auto-upgrade-redirect'
import {
  getUserConversations,
  getUserClients,
  getUserAppointments,
  getUserPlanInfo,
} from '@/actions/dashboard'
import { onGetAllAccountDomains } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import React from 'react'
import DashboardContent from '@/components/dashboard/dashboard-content'

type Props = {}

export const metadata: Metadata = {
  title: 'Dashboard — ChatDock',
  robots: { index: false, follow: false },
}

const Page = async (props: Props) => {
  const conversations = await getUserConversations()
  const leads = await getUserClients()
  const appointments = await getUserAppointments()
  const plan = await getUserPlanInfo()
  const domains = await onGetAllAccountDomains()

  // Safely extract domains array or fallback
  const allDomainsList = domains?.domains || []

  return (
    <>
      <AutoUpgradeRedirect currentPlan={plan?.plan as any} />
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        <DashboardContent
          conversations={conversations || 0}
          leads={leads || 0}
          appointments={appointments || 0}
          plan={plan}
          domains={allDomainsList}
        />
      </div>
    </>
  )
}

export default Page
