import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { cd } from '@/lib/design-tokens'

/**
 * One agency-level number.
 *
 * Every card states the window it covers, because "leads: 12" without a
 * timeframe is not a fact. There is deliberately no percentage-change chip:
 * the product has weeks of history at most, and a fabricated "+14%" is the
 * fastest way to lose an operator's trust in every other number on the page.
 */
export default function MetricCard({
  label,
  value,
  timeframe,
  href,
  hint,
}: {
  label: string
  value: string | number
  timeframe: string
  href?: string
  hint?: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-medium" style={{ color: cd.muted }}>
          {label}
        </p>
        {href && (
          <ArrowUpRight
            className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: cd.faint }}
          />
        )}
      </div>
      <p
        className="mt-2 text-[26px] font-semibold leading-none tabular-nums tracking-[-0.02em]"
        style={{ color: cd.ink }}
      >
        {value}
      </p>
      <p className="mt-2 text-[11.5px]" style={{ color: cd.faint }}>
        {hint ?? timeframe}
      </p>
    </>
  )

  const className = 'group block rounded-[12px] border p-4 transition-colors'
  const style = { borderColor: cd.line, backgroundColor: cd.surface }

  return href ? (
    <Link href={href} className={`${className} hover:border-[${cd.lineStrong}]`} style={style}>
      {body}
    </Link>
  ) : (
    <div className={className} style={style}>
      {body}
    </div>
  )
}
