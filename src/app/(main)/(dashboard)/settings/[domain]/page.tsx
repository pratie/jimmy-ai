import { onGetCurrentDomainInfo } from '@/actions/settings'
import SettingsForm from '@/components/forms/settings/form'
import InfoBar from '@/components/infobar'
import { redirect } from 'next/navigation'
import React from 'react'

/**
 * Same ceiling as the dashboard, for the same reason: the knowledge panel on
 * this page triggers crawl and re-index actions that take far longer than
 * Vercel's 10–15s default. Without it those actions are killed mid-run and the
 * UI is left waiting on a promise nothing will ever settle.
 */
export const maxDuration = 60

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
      <div className="w-full flex-1 h-0 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-5 py-7 md:px-8">
          <SettingsForm
            plan={domain.subscription?.plan!}
            chatBot={activeDomain.chatBot as never}
            id={activeDomain.id}
            name={activeDomain.name}
            trainingSourcesUsed={activeDomain.trainingSourcesUsed}
            knowledgeBaseSizeMB={activeDomain.knowledgeBaseSizeMB}
          />
          {/* Products section temporarily disabled - will be re-enabled in 2 weeks */}
          {/* <ProductTable
            id={activeDomain.id}
            products={activeDomain.products || []}
          /> */}
        </div>
      </div>
    </>
  )
}

export default DomainSettingsPage
