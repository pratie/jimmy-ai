'use client'

import { ArrowRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

import { trackCta } from '@/lib/analytics'

/**
 * Marketing navigation.
 *
 * Six links, deliberately: the IA maps to the buying questions an agency owner
 * asks in order — what is it, how do I ship it, what's in it for my agency,
 * what does it cost, can I see it, where do I read more. Anything beyond that
 * belongs in the footer.
 */
const LINKS = [
  { href: '/#product', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#for-agencies', label: 'For agencies' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#demo', label: 'Demo' },
  { href: '/blogs', label: 'Resources' },
]

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile sheet is open.
  React.useEffect(() => {
    if (!isMenuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isMenuOpen])

  const close = () => setIsMenuOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-2.5 sm:px-5 sm:pt-3">
      <nav
        aria-label="Main"
        className={`mx-auto max-w-6xl rounded-xl border transition-all duration-300 ease-out-strong ${
          scrolled || isMenuOpen
            ? 'border-[#E4E7EC] bg-white/90 shadow-[0_4px_24px_-8px_rgba(16,24,40,0.14)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div
          className={`flex items-center justify-between px-3 transition-all duration-300 ease-out-strong sm:px-4 ${
            scrolled ? 'h-12' : 'h-14'
          }`}
        >
          <Link href="/" className="press flex shrink-0 items-center gap-2" onClick={close}>
            <span className="relative h-7 w-7 overflow-hidden rounded-md bg-white ring-1 ring-[#E4E7EC]">
              <Image src="/images/chatdock-mark.png" alt="" fill sizes="28px" className="object-contain" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-[#101828]">ChatDock</span>
          </Link>

          <ul className="hidden items-center lg:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-[#667085] transition-colors hover:text-[#101828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden shrink-0 items-center gap-1 lg:flex">
            <Link
              href="/auth/sign-in"
              className="rounded-lg px-3 py-2 text-[13.5px] font-medium text-[#667085] transition-colors hover:text-[#101828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              onClick={() => trackCta('navbar', 'Build a client demo')}
              className="press inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#5B5CE2] px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#4A4BD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2"
            >
              Build a client demo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            className="grid h-10 w-10 place-items-center rounded-lg text-[#101828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] lg:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out-strong lg:hidden"
          style={{ gridTemplateRows: isMenuOpen ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="border-t border-[#E4E7EC] px-3 py-3">
              <ul className="flex flex-col">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className="block rounded-lg px-2 py-3 text-[15px] font-medium text-[#344054]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid gap-2 border-t border-[#E4E7EC] pt-3">
                <Link
                  href="/auth/sign-up"
                  onClick={() => {
                    trackCta('navbar_mobile', 'Build a client demo')
                    close()
                  }}
                  className="grid h-12 place-items-center rounded-lg bg-[#5B5CE2] text-[15px] font-semibold text-white"
                >
                  Build a client demo
                </Link>
                <Link
                  href="/auth/sign-in"
                  onClick={close}
                  className="grid h-12 place-items-center rounded-lg border border-[#E4E7EC] text-[15px] font-semibold text-[#101828]"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
