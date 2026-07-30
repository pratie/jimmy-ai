'use client'

import { ArrowUpRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

const LINKS = [
  { href: '#demo', label: 'Live demo' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'What you get' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
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

  const close = () => setIsMenuOpen(false)

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <div
        className={`mx-auto max-w-6xl overflow-hidden rounded-2xl border transition-all duration-300 ease-out-strong ${
          scrolled || isMenuOpen
            ? 'border-black/[0.07] bg-white/85 shadow-[0_12px_40px_-12px_rgba(23,29,59,0.18)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4 sm:px-5">
          <Link href="/" className="flex items-center gap-2.5 press" onClick={close}>
            <span className="relative h-8 w-8 overflow-hidden rounded-lg bg-white shadow-[0_2px_8px_rgba(23,29,59,0.12)]">
              <Image src="/images/chatdock-mark.png" alt="ChatDock" fill sizes="32px" className="object-contain" />
            </span>
            <span className="text-base font-bold tracking-tight text-[#171d3b]">ChatDock</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#5a6072] transition-colors hover:bg-black/[0.04] hover:text-[#171d3b]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/auth/sign-in"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#5a6072] transition-colors hover:text-[#171d3b]"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="press inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#171d3b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#242c52]"
            >
              Start free <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            className="grid h-10 w-10 place-items-center rounded-xl text-[#171d3b] md:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out-strong md:hidden"
          style={{ gridTemplateRows: isMenuOpen ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 border-t border-black/[0.06] px-5 py-4">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-[#5a6072]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-black/[0.06] pt-4">
                <Link
                  href="/auth/sign-in"
                  onClick={close}
                  className="grid h-11 place-items-center rounded-xl border border-black/[0.09] text-sm font-semibold text-[#171d3b]"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={close}
                  className="grid h-11 place-items-center rounded-xl bg-[#171d3b] text-sm font-semibold text-white"
                >
                  Start free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
