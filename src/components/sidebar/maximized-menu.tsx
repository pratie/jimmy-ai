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
    <div className="py-4 px-5 flex flex-col h-full text-sidebar-foreground">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 animate-fade-in opacity-0 delay-300 fill-mode-forwards">
          <div className="relative w-8 h-8">
            <Image
              src="/images/logo.png"
              alt="Logo"
              fill
              className="object-contain rounded-lg"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">ChatDock AI</span>
        </div>
        <Menu
          className="cursor-pointer animate-fade-in opacity-0 delay-300 fill-mode-forwards text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={onExpand}
        />
      </div>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          <p className="text-xs text-sidebar-foreground/60 mb-3 font-semibold tracking-[0.08em]">MENU</p>
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
                className="flex items-center gap-2 px-2 py-2 w-full rounded-lg transition-all border border-transparent text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-muted"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sidebar-muted/70 text-sidebar-foreground">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col overflow-hidden flex-1 text-left">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {user.fullname}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user.email}
                  </p>
                </div>
              </button>
              {showDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-sidebar/95 backdrop-blur border border-sidebar-border rounded-lg shadow-large overflow-hidden">
                  <div className="px-4 py-3 border-b border-sidebar-border">
                    <p className="text-sm font-semibold text-sidebar-foreground">{user.fullname}</p>
                    <p className="text-xs text-sidebar-foreground/60">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onSignOut()
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-sidebar-muted transition-all text-left font-normal text-sidebar-foreground/95"
                  >
                    <LogOut className="w-4 h-4 text-sidebar-foreground/70" />
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
