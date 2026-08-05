import type { Metadata } from 'next'
import React from 'react'

import { onListProspectDemos } from '@/actions/demos'
import DemosWorkspace from '@/components/demos/demos-workspace'

export const metadata: Metadata = {
  title: 'Prospect demos — ChatDock',
  robots: { index: false, follow: false },
}

/**
 * The agency's sales weapon.
 *
 * Point ChatDock at a prospect's website, send them a link to their own
 * assistant answering from their own content, then watch whether they opened
 * it. Everything on this screen serves that loop, so the demos are read on the
 * server and the client component only owns the mutations.
 */
const Page = async () => {
  const result = await onListProspectDemos()

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-8">
          <DemosWorkspace demos={result.demos} />
        </div>
      </div>
    </>
  )
}

export default Page
