import type { Metadata } from 'next'
import React from 'react'

import { onGetAgencyOverview, onGetClients, onGetRecentActivity } from '@/actions/clients'
import { getTenantContext } from '@/lib/tenant'
import { can } from '@/lib/permissions'
import { client } from '@/lib/prisma'
import AgencyOverview from '@/components/dashboard/agency-overview'
import FirstClientSetup from '@/components/dashboard/first-client-setup'
import AutoUpgradeRedirect from '@/components/dashboard/auto-upgrade-redirect'
import InfoBar from '@/components/infobar'

export const metadata: Metadata = {
  title: 'Overview — ChatDock',
  robots: { index: false, follow: false },
}

/**
 * The agency command center.
 *
 * Two genuinely different screens rather than one that degrades: with no
 * clients, a purposeful first-run setup; with clients, real operational data.
 * Previously a single component flipped a boolean and let the onboarding wizard
 * replace the entire dashboard.
 */
const Page = async () => {
  const ctx = await getTenantContext()
  const [overview, clientList, activity] = await Promise.all([
    onGetAgencyOverview(),
    onGetClients(),
    onGetRecentActivity(),
  ])

  const organization = ctx
    ? await client.organization.findUnique({
        where: { id: ctx.organizationId },
        select: {
          name: true,
          subscription: { select: { plan: { select: { code: true } } } },
        },
      })
    : null

  const clients = clientList.clients
  const canCreate = ctx ? can(ctx.actor, 'createClientWorkspace') : false

  return (
    <>
      {/* Honours ?plan= from the pricing page — only meaningful while on FREE. */}
      <AutoUpgradeRedirect
        currentPlan={(organization?.subscription?.plan?.code ?? 'FREE') as 'FREE'}
      />
      <InfoBar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8">
          {clients.length === 0 ? (
            <FirstClientSetup />
          ) : (
            <AgencyOverview
              organizationName={organization?.name ?? 'Your agency'}
              clients={clients}
              activity={activity.activity}
              totals={
                overview.status === 200
                  ? overview.totals
                  : { clients: 0, assistants: 0, conversations: 0, leads: 0, bookings: 0 }
              }
              usage={overview.status === 200 ? overview.usage : null}
              canCreate={canCreate}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default Page
