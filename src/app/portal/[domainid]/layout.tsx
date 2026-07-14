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
    const domainInfo = await client.domain.findUnique({
      where: {
        id: domainid,
      },
      select: {
        User: {
          select: {
            agencyName: true,
            agencyLogo: true,
            agencyColor: true,
          },
        },
      },
    })

    if (domainInfo?.User) {
      agencyLogo = domainInfo.User.agencyLogo || null
      agencyName = domainInfo.User.agencyName || 'ChatDock'
      agencyColor = domainInfo.User.agencyColor || '#0f172a'
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
