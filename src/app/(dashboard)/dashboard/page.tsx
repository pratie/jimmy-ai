import type { Metadata } from 'next'
import AutoUpgradeRedirect from '@/components/dashboard/auto-upgrade-redirect'
import {
  getUserConversations,
  getUserClients,
  getUserAppointments,
  getUserPlanInfo,
} from '@/actions/dashboard'
import { onGetAllAccountDomains } from '@/actions/settings'
import DashboardCard from '@/components/dashboard/cards'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import InfoBar from '@/components/infobar'
import CalIcon from '@/icons/cal-icon'
import PersonIcon from '@/icons/person-icon'
import { MessageSquare } from 'lucide-react'
import React from 'react'
import AddDomainCTA from '@/components/onboarding/add-domain-cta'

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

  // Calculate conversion rates
  const leadsConversionRate = conversations && conversations > 0 && leads
    ? Math.round((leads / conversations) * 100)
    : 0
  const appointmentsConversionRate = leads && leads > 0 && appointments
    ? Math.round((appointments / leads) * 100)
    : 0

  return (
    <>
      <AutoUpgradeRedirect currentPlan={plan?.plan as any} />
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        {!domains?.domains?.length && (
          <div className="mb-6">
            <AddDomainCTA />
          </div>
        )}
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            value={conversations || 0}
            title="Conversations"
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <DashboardCard
            value={leads || 0}
            title="Leads Captured"
            icon={<PersonIcon />}
            percentage={leadsConversionRate}
          />
          <DashboardCard
            value={appointments || 0}
            title="Appointments"
            icon={<CalIcon />}
            percentage={appointmentsConversionRate}
          />
          </div>
        </div>
        <div className="w-full py-10">
          <div className="mx-auto max-w-5xl px-4">
            <div className="relative bg-bg dark:bg-darkBg rounded-base border-2 border-border shadow-shadow p-6">
              <div className="mb-6">
                <h2 className="font-heading text-xl text-text dark:text-darkText">Plan Usage</h2>
                <p className="text-sm text-text/70 dark:text-darkText/70 mt-1">
                  A detailed overview of your metrics, usage, customers and more
                </p>
              </div>
              <PlanUsage
                plan={plan?.plan!}
                messageCredits={plan?.messageCredits || 0}
                messagesUsed={plan?.messagesUsed || 0}
                domains={plan?.domains || 0}
                clients={leads || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
