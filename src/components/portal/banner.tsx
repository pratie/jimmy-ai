import Image from 'next/image'
import React from 'react'

type Props = {
  logo?: string | null
  name?: string | null
}

export const PortalBanner = ({ logo, name }: Props) => {
  return (
    <div className="w-full bg-muted flex justify-center py-5">
      <Image
        src={logo || '/images/logo.svg'}
        alt={name || 'Logo'}
        sizes="100vw"
        style={{
          width: logo ? '120px' : '60px',
          height: 'auto',
          maxHeight: '48px',
          objectFit: 'contain',
        }}
        width={0}
        height={0}
      />
    </div>
  )
}
