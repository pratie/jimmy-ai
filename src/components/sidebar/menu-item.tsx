import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

type Props = {
  size: 'max' | 'min'
  label: string
  icon: JSX.Element
  path?: string
  current?: string
  onSignOut?(): void
}

const MenuItem = ({ size, path, icon, label, current, onSignOut }: Props) => {
  switch (size) {
    case 'max':
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all border font-normal text-sidebar-foreground/80 hover:text-sidebar-foreground text-sm',
            current === path
              ? 'bg-sidebar-muted/70 font-semibold border-sidebar-border/50 text-sidebar-foreground'
              : 'border-transparent hover:bg-sidebar-muted/50'
          )}
          href={path ? `/${path}` : '#'}
        >
          {icon} {label}
        </Link>
      )
    case 'min':
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            'rounded-xl p-2 transition-all border text-sidebar-foreground/70 hover:text-sidebar-foreground flex flex-col items-center gap-1 relative',
            current === path
              ? 'bg-sidebar-muted/70 border-sidebar-border/50 text-sidebar-foreground'
              : 'border-transparent hover:bg-sidebar-muted/60'
          )}
          href={path ? `/${path}` : '#'}
        >
          {icon}
          {current === path && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </Link>
      )
    default:
      return null
  }
}

export default MenuItem
