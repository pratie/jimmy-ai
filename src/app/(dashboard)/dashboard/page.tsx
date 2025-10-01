import {
  getUserConversations,
  getUserClients,
  getUserAppointments,
  getUserPlanInfo,
  getUserTransactions,
} from '@/actions/dashboard'
import { onGetAllAccountDomains } from '@/actions/settings'
import DashboardCard from '@/components/dashboard/cards'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import InfoBar from '@/components/infobar'
import { Separator } from '@/components/ui/separator'
import CalIcon from '@/icons/cal-icon'
import EmailIcon from '@/icons/email-icon'
import PersonIcon from '@/icons/person-icon'
import { TransactionsIcon } from '@/icons/transactions-icon'
import { MessageSquare } from 'lucide-react'
import React from 'react'
import AddDomainCTA from '@/components/onboarding/add-domain-cta'

type Props = {}

const Page = async (props: Props) => {
  const conversations = await getUserConversations()
  const leads = await getUserClients()
  const appointments = await getUserAppointments()
  const plan = await getUserPlanInfo()
  const transactions = await getUserTransactions()
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
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        {!domains?.domains?.length && (
          <div className="mb-6">
            <AddDomainCTA />
          </div>
        )}
        <div className="flex gap-5 flex-wrap">
          <DashboardCard
            value={conversations || 0}
            title="Conversations"
            icon={<MessageSquare />}
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
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 py-10">
          <div>
            <div>
              <h2 className="font-bold text-2xl">Plan Usage</h2>
              <p className="text-sm font-light">
                A detailed overview of your metrics, usage, customers and more
              </p>
            </div>
            <PlanUsage
              plan={plan?.plan!}
              credits={plan?.credits || 0}
              domains={plan?.domains || 0}
              clients={leads || 0}
            />
          </div>
          <div className="flex flex-col">
            <div className="w-full flex justify-between items-start mb-5">
              <div className="flex gap-3 items-center">
                <TransactionsIcon />
                <p className="font-bold">Recent Transactions</p>
              </div>
              <p className="text-sm">See more</p>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Dodo Payments Integration Active</p>
                <p className="text-sm text-gray-400">Transaction history will appear here once Dodo Payments API is fully integrated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
