import type { Metadata } from 'next'
import { onGetAllAccountDomains } from '@/actions/settings'
import ConversationWorkspace from '@/components/conversations/workspace'
import InfoBar from '@/components/infobar'
import React from 'react'

type Props = {}

export const metadata: Metadata = {
  title: 'Conversations — ChatDock',
  robots: { index: false, follow: false },
}

const ConversationPage = async (props: Props) => {
  const domains = await onGetAllAccountDomains()
  return (
    <>
      <InfoBar />
      <div className="min-h-0 flex-1 p-4 md:p-6">
        <ConversationWorkspace domains={domains?.domains} />
      </div>
    </>
  )
}

export default ConversationPage
