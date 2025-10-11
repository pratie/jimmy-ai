import { onGetAllAccountDomains } from '@/actions/settings'
import ConversationMenu from '@/components/conversations'
import Messenger from '@/components/conversations/messenger'
import InfoBar from '@/components/infobar'
import { Separator } from '@/components/ui/separator'
import React from 'react'

type Props = {}

const ConversationPage = async (props: Props) => {
  const domains = await onGetAllAccountDomains()
  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-80 md:min-w-[320px] border-r border-brand-base-300 overflow-y-auto">
        <ConversationMenu domains={domains?.domains} />
      </div>

      <Separator orientation="vertical" className="hidden md:block" />
      <div className="w-full flex flex-col flex-1 overflow-hidden">
        <div className="px-3 md:px-5">
          <InfoBar />
        </div>
        <Messenger />
      </div>
    </div>
  )
}

export default ConversationPage
