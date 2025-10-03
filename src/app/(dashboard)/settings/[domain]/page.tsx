import { onGetCurrentDomainInfo } from '@/actions/settings'
import BotTrainingForm from '@/components/forms/settings/bot-training'
import SettingsForm from '@/components/forms/settings/form'
import InfoBar from '@/components/infobar'
import ChatbotPreview from '@/components/settings/chatbot-preview'
import { redirect } from 'next/navigation'
import React from 'react'

const DomainSettingsPage = async (
  { params }: { params: Promise<{ domain: string }> }
) => {
  const { domain: domainParam } = await params
  const domain = await onGetCurrentDomainInfo(domainParam)
  if (!domain || !domain.domains.length) {
    redirect('/dashboard')
  }

  const activeDomain = domain.domains[0]

  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        <SettingsForm
          plan={domain.subscription?.plan!}
          chatBot={activeDomain.chatBot}
          id={activeDomain.id}
          name={activeDomain.name}
        />
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Preview</h3>
            <a
              href={`/preview/${activeDomain.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline text-primary"
            >
              Open full preview ↗
            </a>
          </div>
          <ChatbotPreview domainId={activeDomain.id} />
        </div>
        <BotTrainingForm id={activeDomain.id} />
        {/* Products section temporarily disabled - will be re-enabled in 2 weeks */}
        {/* <ProductTable
          id={activeDomain.id}
          products={activeDomain.products || []}
        /> */}
      </div>
    </>
  )
}

export default DomainSettingsPage
