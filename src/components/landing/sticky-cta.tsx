'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { trackCta } from '@/lib/analytics'

/**
 * Mobile-only sticky CTA.
 *
 * Appears once the hero has scrolled past and hides again over the closing
 * section, so it never sits on top of the CTA it duplicates. Reserves its own
 * space via a safe-area-aware inset rather than overlaying content.
 */
export default function StickyCta() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.9
      const nearBottom =
        window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 900
      setVisible(past && !nearBottom)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4E7EC] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg transition-transform duration-300 ease-out-strong lg:hidden"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(120%)' }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 text-[12px] leading-4 text-[#667085]">
          Free plan · no card
          <br />
          <span className="text-[#101828]">100 messages to test</span>
        </p>
        <Link
          href="/auth/sign-up"
          tabIndex={visible ? 0 : -1}
          onClick={() => trackCta('sticky_mobile', 'Build a client demo')}
          className="press inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-[#5B5CE2] px-5 text-[14px] font-semibold text-white"
        >
          Build a client demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
