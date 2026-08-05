import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { onGetClientOverview } from '@/actions/clients'
import ClientOverview from '@/components/clients/client-overview'
import InfoBar from '@/components/infobar'

export const metadata: Metadata = {
  title: 'Client — ChatDock',
  robots: { index: false, follow: false },
}

/**
 * A single client's overview.
 *
 * A workspace belonging to another organization, or one this member is not
 * assigned to, 404s rather than 403s — a "forbidden" would confirm the id
 * exists, which is information the caller has not earned.
 */
const Page = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await params
  const data = await onGetClientOverview(workspaceId)

  if (data.status !== 200) notFound()

  return (
    <>
      <InfoBar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-8">
          <ClientOverview data={data} />
        </div>
      </div>
    </>
  )
}

export default Page
