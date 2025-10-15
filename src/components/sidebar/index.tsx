'use client'
import useSideBar from '@/context/use-sidebar'
import { cn } from '@/lib/utils'
import React from 'react'
import MaxMenu from './maximized-menu'
import { MinMenu } from './minimized-menu'

type Props = {
  domains:
    | {
        id: string
        name: string
        icon: string
      }[]
    | null
    | undefined
  user?: {
    fullname: string
    email: string | null
  } | null
}

const SideBar = ({ domains, user }: Props) => {
  const { expand, onExpand, page, onSignOut } = useSideBar()

  return (
    <div
      className={cn(
        'bg-bg dark:bg-darkBg h-full w-[60px] fill-mode-forwards fixed md:relative z-40 md:z-auto border-r-2 border-border shadow-shadow',
        expand == undefined && '',
        expand == true
          ? 'animate-open-sidebar'
          : expand == false && 'animate-close-sidebar'
      )}
    >
      {expand ? (
        <MaxMenu
          domains={domains}
          current={page!}
          onExpand={onExpand}
          onSignOut={onSignOut}
          user={user}
        />
      ) : (
        <MinMenu
          domains={domains}
          onShrink={onExpand}
          current={page!}
          onSignOut={onSignOut}
          user={user}
        />
      )}
    </div>
  )
}

export default SideBar
