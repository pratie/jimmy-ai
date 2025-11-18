import { SIDE_BAR_MENU, SIDE_BAR_MENU_SECONDARY } from '@/constants/menu'
import { LogOut, Menu, User } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import DomainMenu from './domain-menu'
import MenuItem from './menu-item'

type Props = {
  onExpand(): void
  current: string
  onSignOut(): void
  domains:
    | {
        id: string
        name: string
        icon: string | null
      }[]
    | null
    | undefined
  user?: {
    fullname: string
    email: string | null
  } | null
}

const MaxMenu = ({ current, domains, onExpand, onSignOut, user }: Props) => {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="py-4 px-5 flex flex-col h-full text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 animate-fade-in opacity-0 delay-300 fill-mode-forwards">
          <Image
            src="/images/logo.svg"
            alt="Logo"
            sizes="100vw"
            style={{ width: '40px', height: 'auto' }}
            width={0}
            height={0}
          />
          <span className="text-lg font-semibold tracking-tight">ChatDock AI</span>
        </div>
        <Menu
          className="cursor-pointer animate-fade-in opacity-0 delay-300 fill-mode-forwards text-white/70 hover:text-white"
          onClick={onExpand}
        />
      </div>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          <p className="text-xs text-white mb-3 font-heading tracking-[0.08em]">MENU</p>
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem
              size="max"
              {...menu}
              key={key}
              current={current}
            />
          ))}
          <DomainMenu domains={domains} />
        </div>
        <div className="flex flex-col gap-3">
          {SIDE_BAR_MENU_SECONDARY.map((menu, key) => (
            <MenuItem
              size="max"
              {...menu}
              key={`secondary-${key}`}
              current={current}
            />
          ))}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-2 py-2 w-full rounded-base transition-all border border-transparent text-white/80 hover:text-white hover:bg-white/10"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col overflow-hidden flex-1 text-left">
                  <p className="text-sm font-heading text-white truncate">
                    {user.fullname}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {user.email}
                  </p>
                </div>
              </button>
              {showDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur border border-white/40 rounded-base shadow-shadow overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/30">
                    <p className="text-sm font-heading text-brand-primary">{user.fullname}</p>
                    <p className="text-xs text-brand-primary/70">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onSignOut()
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-brand-base-100 transition-all text-left font-base text-brand-primary"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MaxMenu
