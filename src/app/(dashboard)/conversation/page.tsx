import type { Metadata } from 'next'
import { onGetAllAccountDomains } from '@/actions/settings'
import ConversationMenu from '@/components/conversations'
import Messenger from '@/components/conversations/messenger'
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
        <div className="mx-auto flex h-full max-w-[1280px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.07)]">
          <div className="hidden w-[340px] shrink-0 overflow-y-auto border-r border-slate-200 md:block">
            <ConversationMenu domains={domains?.domains} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Messenger />
          </div>
        </div>
      </div>
    </>
  )
}

export default ConversationPage
