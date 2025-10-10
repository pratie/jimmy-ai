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
            'flex items-center gap-2 px-2 py-2 rounded-lg my-1 transition-colors duration-150 border-2',
            current === path
              ? 'bg-brand-secondary text-brand-primary font-semibold border-brand-base-300 shadow-sm'
              : 'text-brand-primary/70 border-transparent hover:bg-brand-base-100 hover:text-brand-primary'
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
            'rounded-lg p-2 my-1 transition-colors duration-150 border-2',
            current === path
              ? 'bg-brand-secondary text-brand-primary font-semibold border-brand-base-300 shadow-sm'
              : 'text-brand-primary/70 border-transparent hover:bg-brand-base-100 hover:text-brand-primary'
          )}
          href={path ? `/${path}` : '#'}
        >
          {icon}
        </Link>
      )
    default:
      return null
  }
}

export default MenuItem
