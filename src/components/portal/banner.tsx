import Image from 'next/image'
import React from 'react'

export const PortalBanner = () => {
  return (
    <div className="w-full bg-muted flex justify-center py-5">
      <Image
        src="/images/logo.svg"
        alt="Logo"
        sizes="100vw"
        style={{
          width: '60px',
          height: 'auto',
        }}
        width={0}
        height={0}
      />
    </div>
  )
}
