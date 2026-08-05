import type * as React from 'react'

import { cd } from '@/lib/design-tokens'

/**
 * An empty state names the next action. "No data" alone tells an operator
 * nothing they did not already know from looking at the screen.
 */
export default function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ElementType
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span
        className="grid h-9 w-9 place-items-center rounded-[10px]"
        style={{ backgroundColor: cd.sunken, color: cd.faint }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-[13.5px] font-semibold" style={{ color: cd.ink }}>
        {title}
      </p>
      <p className="mt-1 max-w-xs text-[12.5px] leading-5" style={{ color: cd.muted }}>
        {body}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
