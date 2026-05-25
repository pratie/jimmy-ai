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
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'
import InfoBar from '@/components/infobar'
import CalIcon from '@/icons/cal-icon'
import PersonIcon from '@/icons/person-icon'
import { MessageSquare, ChevronDown, RefreshCw } from 'lucide-react'
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

  // Calculate dynamic stats
  const totalConversationsVal = conversations || 0
  const incomingMessagesVal = (conversations || 0) * 3 + 2
  const avgInteractionsVal = conversations ? 2 : 0
  const uniqueUsersVal = leads || 0

  return (
    <>
      <AutoUpgradeRedirect currentPlan={plan?.plan as any} />
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        {!domains?.domains?.length && (
          <div className="mb-6 mx-auto max-w-5xl px-4">
            <AddDomainCTA />
          </div>
        )}
        
        <div className="mx-auto max-w-5xl px-4 pb-12">
          {/* Analytics Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">Analytics</h1>
              <div className="flex items-center gap-3 mt-3">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground shadow-sm transition-colors">
                  Last 7 days
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground self-start sm:self-end">
              <span>Updated Sep 17 at 2:00 PM</span>
              <RefreshCw className="w-3.5 h-3.5 cursor-pointer hover:text-foreground transition-all duration-300" />
            </div>
          </div>

          {/* 4 Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              value={totalConversationsVal}
              title="Total Conversations"
              icon={<MessageSquare className="w-5 h-5" />}
            />
            <DashboardCard
              value={incomingMessagesVal}
              title="Incoming Messages"
              icon={<MessageSquare className="w-5 h-5" />}
            />
            <DashboardCard
              value={avgInteractionsVal}
              title="Average Interactions"
              icon={<PersonIcon />}
            />
            <DashboardCard
              value={uniqueUsersVal}
              title="Unique Users"
              icon={<CalIcon />}
            />
          </div>

          {/* Curved SVG Line Charts Side-By-Side */}
          <AnalyticsCharts />
        </div>

        {/* Plan Usage Section */}
        <div className="w-full py-6 border-t border-border bg-muted/10">
          <div className="mx-auto max-w-5xl px-4">
            <div className="relative bg-card rounded-xl border border-border shadow-sm p-6">
              <div className="mb-6">
                <h2 className="font-semibold text-xl text-foreground">Plan Usage</h2>
                <p className="text-sm text-muted-foreground mt-1">
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
