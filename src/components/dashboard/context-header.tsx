import type * as React from 'react'

import { cd } from '@/lib/design-tokens'

/**
 * The contextual header for a dashboard page.
 *
 * Replaces the route-mapped BreadCrumb, which derived its title from the URL
 * segment and so announced "Agency overview" above a first-run setup screen —
 * and, once the overview gained its own heading, produced two competing page
 * titles on the same screen.
 *
 * Context is stated in words (`scope`), not left to be inferred from whichever
 * item a dropdown happens to have selected.
 */
export default function ContextHeader({
  scope,
  title,
  supporting,
  action,
}: {
  /** Where the user is: "Sneakyguy SaaS · all clients", or a client name. */
  scope: string
  title: string
  supporting?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {/* Raised from cd.faint — the scope line is how a user knows whether
            they are looking at every client or just one, so it has to be
            legible at a glance rather than decorative. */}
        <p className="truncate text-[12.5px] font-medium" style={{ color: cd.muted }}>
          {scope}
        </p>
        <h1
          className="mt-0.5 text-[26px] font-semibold leading-tight tracking-[-0.02em]"
          style={{ color: cd.ink }}
        >
          {title}
        </h1>
        {supporting && (
          <p className="mt-1.5 max-w-xl text-[13.5px] leading-6" style={{ color: cd.muted }}>
            {supporting}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
