'use client'

import { ArrowUpRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const close = () => setIsMenuOpen(false)

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#101726]/90 shadow-[0_15px_50px_rgba(0,0,0,.22)] backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" onClick={close}>
            <span className="relative h-8 w-8 overflow-hidden rounded-lg bg-white"><Image src="/images/chatdock-mark.png" alt="ChatDock" fill sizes="32px" className="object-contain" /></span>
            <span className="text-base font-semibold tracking-tight text-white">ChatDock</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a href="#workflow" className="text-sm font-medium text-white/55 transition hover:text-white">How it works</a>
            <a href="#features" className="text-sm font-medium text-white/55 transition hover:text-white">Platform</a>
            <a href="#pricing" className="text-sm font-medium text-white/55 transition hover:text-white">Pricing</a>
            <Link href="/blogs" className="text-sm font-medium text-white/55 transition hover:text-white">Resources</Link>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link href="/auth/sign-in" className="text-sm font-medium text-white/65 hover:text-white">Sign in</Link>
            <Link href="/auth/sign-up" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-white/90">Start free <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>

          <button type="button" aria-label="Toggle navigation" className="grid h-10 w-10 place-items-center rounded-xl text-white md:hidden" onClick={() => setIsMenuOpen(value => !value)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-white/10 px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#workflow" onClick={close} className="text-sm font-medium text-white/65">How it works</a>
              <a href="#features" onClick={close} className="text-sm font-medium text-white/65">Platform</a>
              <a href="#pricing" onClick={close} className="text-sm font-medium text-white/65">Pricing</a>
              <Link href="/blogs" onClick={close} className="text-sm font-medium text-white/65">Resources</Link>
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-white/10 pt-5"><Link href="/auth/sign-in" onClick={close} className="grid h-11 place-items-center rounded-xl border border-white/15 text-sm font-semibold text-white">Sign in</Link><Link href="/auth/sign-up" onClick={close} className="grid h-11 place-items-center rounded-xl bg-white text-sm font-semibold text-[#111827]">Start free</Link></div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
