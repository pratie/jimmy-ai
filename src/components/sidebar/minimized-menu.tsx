import { SIDE_BAR_MENU, SIDE_BAR_MENU_SECONDARY } from '@/constants/menu'

import React, { useState } from 'react'

import { LogOut, User, Menu } from 'lucide-react'
import MenuItem from './menu-item'
import DomainMenu from './domain-menu'

type MinMenuProps = {
  onShrink(): void
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

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  domains,
  user,
}: MinMenuProps) => {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="p-3 flex flex-col items-center h-full text-sidebar-foreground">
      <button
        onClick={onShrink}
        className="animate-fade-in opacity-0 delay-300 fill-mode-forwards cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg bg-sidebar-muted/50 hover:bg-sidebar-muted transition-all"
      >
        <Menu className="w-5 h-5 text-sidebar-foreground" />
      </button>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem
              size="min"
              {...menu}
              key={key}
              current={current}
            />
          ))}
          <DomainMenu
            min
            domains={domains}
          />
        </div>
        <div className="flex flex-col items-center gap-3">
          {SIDE_BAR_MENU_SECONDARY.map((menu, key) => (
            <MenuItem
              size="min"
              {...menu}
              key={`secondary-${key}`}
              current={current}
            />
          ))}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-sidebar-muted hover:bg-sidebar-muted/80 transition"
              >
                <User className="w-5 h-5 text-sidebar-foreground" />
              </button>
              {showDropdown && (
                <div className="absolute bottom-full left-full ml-2 mb-0 bg-sidebar/95 backdrop-blur border border-sidebar-border rounded-lg shadow-large overflow-hidden w-48">
                  <div className="px-4 py-3 border-b border-sidebar-border">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{user.fullname}</p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onSignOut()
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-sidebar-muted transition-colors text-left text-sidebar-foreground/95"
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
