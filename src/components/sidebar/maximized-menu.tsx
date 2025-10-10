import { SIDE_BAR_MENU } from '@/constants/menu'
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
    <div className="py-3 px-4 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <Image
          src="/images/logo.svg"
          alt="Logo"
          sizes="100vw"
          className="animate-fade-in opacity-0 delay-300 fill-mode-forwards"
          style={{
            width: '40px',
            height: 'auto',
          }}
          width={0}
          height={0}
        />
        <Menu
          className="cursor-pointer animate-fade-in opacity-0 delay-300 fill-mode-forwards text-brand-primary/70 hover:text-brand-primary"
          onClick={onExpand}
        />
      </div>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          <p className="text-xs text-brand-primary/60 mb-3">MENU</p>
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
        <div className="flex flex-col">
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-2 py-2 w-full hover:bg-brand-base-100 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-brand-primary">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col overflow-hidden flex-1 text-left">
                  <p className="text-sm font-medium text-brand-primary truncate">
                    {user.fullname}
                  </p>
                  <p className="text-xs text-brand-primary/70 truncate">
                    {user.email}
                  </p>
                </div>
              </button>
              {showDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-sm border border-brand-base-300 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-brand-base-300/60">
                    <p className="text-sm font-medium text-brand-primary">{user.fullname}</p>
                    <p className="text-xs text-brand-primary/70">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onSignOut()
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-brand-base-100 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-brand-primary/80" />
                    <span className="text-sm text-brand-primary/90">Sign out</span>
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
