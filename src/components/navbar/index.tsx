"use client"

import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <nav className="fixed top-0 w-full bg-background z-50 border-b-4 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Responsive sizing */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/images/logo.svg"
              alt="Chatdock AI Logo"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
            />
            <span className="font-extrabold text-base sm:text-lg md:text-xl tracking-tight">
              Chatdock AI
            </span>
          </div>

          {/* Nav links - Hidden on mobile */}
          <div className="hidden lg:flex gap-8 xl:gap-12 font-bold uppercase text-sm tracking-widest">
            <a href="#features" className="hover:underline">
              Features
            </a>
            <a href="#pricing" className="hover:underline">
              Pricing
            </a>
            <Link href="/blogs" className="hover:underline">
              Blog
            </Link>
          </div>

          {/* CTA - Responsive padding and text */}
          <Link
            href="/auth/sign-up"
            className="bg-foreground text-background font-bold border-2 border-foreground uppercase text-[10px] sm:text-xs tracking-wider sm:tracking-widest px-3 py-2 sm:px-6 sm:py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all whitespace-nowrap"
          >
            <span className="hidden sm:inline">Start Free</span>
            <span className="sm:hidden">Start</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
