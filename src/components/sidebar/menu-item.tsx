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
            'flex items-center gap-2 px-2 py-2 rounded-base my-1 transition-all border font-base',
            current === path
              ? 'bg-main text-white font-heading border-transparent shadow-shadow'
              : 'text-text border-transparent hover:bg-white/60 dark:hover:bg-darkBg hover:border-border hover:shadow-light dark:text-darkText'
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
            'rounded-base p-2 my-1 transition-all border',
            current === path
              ? 'bg-main text-white border-transparent shadow-shadow'
              : 'text-text border-transparent hover:bg-white/60 dark:hover:bg-darkBg hover:border-border hover:shadow-light dark:text-darkText'
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
