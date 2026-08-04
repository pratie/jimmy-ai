import { client } from '@/lib/prisma'
import { PortalBanner } from '@/components/portal/banner'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: Promise<{ domainid: string }>
}

const DomainPortalLayout = async ({ children, params }: Props) => {
  const { domainid } = await params

  let agencyLogo = null
  let agencyName = 'ChatDock'
  let agencyColor = '#0f172a'

  try {
    // Fetch the domain and the user's white-label settings
    // Agency branding moved from User to Organization — where a paying tenant's
    // brand actually belongs.
    const workspace = await client.clientWorkspace.findUnique({
      where: { id: domainid },
      select: {
        organization: { select: { name: true, logoUrl: true, primaryColor: true } },
      },
    })

    if (workspace?.organization) {
      agencyLogo = workspace.organization.logoUrl || null
      agencyName = workspace.organization.name || 'ChatDock'
      agencyColor = workspace.organization.primaryColor || '#0f172a'
    }
  } catch (error) {
    console.error('Error fetching portal white label settings:', error)
  }

  return (
    <div 
      className="flex min-h-screen w-full flex-col bg-[#f4f5f7] text-slate-950"
      style={{
        '--portal-accent': agencyColor,
      } as React.CSSProperties}
    >
      <PortalBanner logo={agencyLogo} name={agencyName} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </div>
    </div>
  )
}

export default DomainPortalLayout
