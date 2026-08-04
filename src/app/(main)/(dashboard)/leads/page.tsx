import type { Metadata } from 'next'
import React from 'react'

import { onGetAllCustomers } from '@/actions/mail'
import InfoBar from '@/components/infobar'
import LeadsTable from '@/components/leads/leads-table'

export const metadata: Metadata = {
  title: 'Leads — ChatDock',
  robots: { index: false, follow: false },
}

/**
 * Leads across every client the signed-in member may see.
 *
 * Replaces the old /email-marketing route, which the sidebar already labelled
 * "Leads". The bulk-campaign machinery behind that page is gone: those
 * addresses belong to clients' end customers, who never opted into email from
 * the agency — let alone from ChatDock.
 */
const Page = async () => {
  const result = await onGetAllCustomers()

  return (
    <>
      <InfoBar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-8">
          <LeadsTable leads={result.customer} />
        </div>
      </div>
    </>
  )
}

export default Page
