import Image from 'next/image'
import React from 'react'

type Props = {
  logo?: string | null
  name?: string | null
}

export const PortalBanner = ({ logo, name }: Props) => {
  return (
    <header className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <span className="relative h-9 w-9 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Image src={logo || '/images/chatdock-mark.png'} alt="" fill sizes="36px" className="object-contain" />
        </span>
        <div><p className="text-sm font-semibold text-slate-900">{name || 'ChatDock'}</p><p className="mt-0.5 text-[10px] text-slate-400">Secure client portal</p></div>
      </div>
    </header>
  )
}
