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
          className="cursor-pointer animate-fade-in opacity-0 delay-300 fill-mode-forwards text-text/70 hover:text-text dark:text-darkText/70 dark:hover:text-darkText"
          onClick={onExpand}
        />
      </div>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          <p className="text-xs text-text/60 mb-3 font-heading dark:text-darkText/60">MENU</p>
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
                className="flex items-center gap-2 px-2 py-2 w-full rounded-base transition-all border border-transparent hover:border-border hover:bg-white/60 dark:hover:bg-darkBg hover:shadow-light"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-main/15 text-main">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col overflow-hidden flex-1 text-left">
                  <p className="text-sm font-heading text-text truncate dark:text-darkText">
                    {user.fullname}
                  </p>
                  <p className="text-xs text-text/70 truncate dark:text-darkText/70">
                    {user.email}
                  </p>
                </div>
              </button>
              {showDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-bg border border-border rounded-base shadow-shadow overflow-hidden dark:bg-darkBg">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-heading text-text dark:text-darkText">{user.fullname}</p>
                    <p className="text-xs text-text/70 dark:text-darkText/70">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onSignOut()
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-main transition-all text-left font-base"
                  >
                    <LogOut className="w-4 h-4 text-text/80 dark:text-darkText/80" />
                    <span className="text-sm text-text/90 dark:text-darkText/90">Sign out</span>
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
