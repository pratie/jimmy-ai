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
      className="flex flex-col md:h-screen w-full"
      style={{
        '--primary': agencyColor,
      } as React.CSSProperties}
    >
      <PortalBanner logo={agencyLogo} name={agencyName} />
      <div className="container flex justify-center flex-1 h-0 mt-12 w-full px-4">
        {children}
      </div>
    </div>
  )
}

export default DomainPortalLayout
