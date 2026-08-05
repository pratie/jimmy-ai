import type { Metadata } from 'next'
import React from 'react'

import { onGetClients } from '@/actions/clients'
import { getTenantContext } from '@/lib/tenant'
import { can } from '@/lib/permissions'
import ClientsGrid from '@/components/clients/clients-grid'

export const metadata: Metadata = {
  title: 'Clients — ChatDock',
  robots: { index: false, follow: false },
}

/** The agency roster. Scoped to what the signed-in member may actually see. */
const Page = async () => {
  const [result, ctx] = await Promise.all([onGetClients(), getTenantContext()])
  const canCreate = ctx ? can(ctx.actor, 'createClientWorkspace') : false

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-8">
          <ClientsGrid clients={result.clients} canCreate={canCreate} />
        </div>
      </div>
    </>
  )
}

export default Page
