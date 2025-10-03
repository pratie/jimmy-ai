import { onGetCurrentDomainInfo } from '@/actions/settings'
import SettingsForm from '@/components/forms/settings/form'
import InfoBar from '@/components/infobar'
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
      <div className="w-full flex-1 h-0 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4">
          <SettingsForm
            plan={domain.subscription?.plan!}
            chatBot={activeDomain.chatBot}
            id={activeDomain.id}
            name={activeDomain.name}
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
