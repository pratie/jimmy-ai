import { SIDE_BAR_MENU } from '@/constants/menu'

import React, { useState } from 'react'

import { LogOut, User } from 'lucide-react'
import { MenuLogo } from '@/icons/menu-logo'
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
    email: string
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
    <div className="p-3 flex flex-col items-center h-full">
      <span className="animate-fade-in opacity-0 delay-300 fill-mode-forwards cursor-pointer">
        <MenuLogo onClick={onShrink} />
      </span>
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
        <div className="flex flex-col items-center">
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 hover:opacity-90 transition-opacity"
              >
                <User className="w-5 h-5 text-white" />
              </button>
              {showDropdown && (
                <div className="absolute bottom-full left-full ml-2 mb-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden w-48">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.fullname}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onSignOut()
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Sign out</span>
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
