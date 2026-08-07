import type { Metadata } from 'next'
import React, { Suspense } from 'react'

import { onGetClients } from '@/actions/clients'
import { getTenantContext } from '@/lib/tenant'
import { can } from '@/lib/permissions'
import ClientsGrid from '@/components/clients/clients-grid'
import NewClientDialog from '@/components/clients/new-client-dialog'

export const metadata: Metadata = {
  title: 'Clients — ChatDock',
  robots: { index: false, follow: false },
}

/**
 * Creating a client crawls and embeds a whole website from a server action, and
 * that is far longer than Vercel's 10–15s default — without this the function
 * is killed mid-flight and the dialog waits on a promise that never settles.
 * 60 is the Hobby maximum.
 */
export const maxDuration = 60

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
      {/* Opens on ?new=1, which is where every "Add a client" control in the
          product already pointed. */}
      {canCreate && (
        <Suspense fallback={null}>
          <NewClientDialog />
        </Suspense>
      )}
    </>
  )
}

export default Page
