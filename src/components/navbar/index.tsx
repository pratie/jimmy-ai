"use client"

import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-xl z-50 border-b border-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Responsive sizing */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/images/logo.svg"
              alt="ChatDock AI Logo"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
            />
            <span className="font-extrabold text-base sm:text-lg md:text-xl tracking-tight">
              <span className="text-main">C</span>hatDock AI
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
            className="bg-main text-white font-semibold rounded-full text-[10px] sm:text-xs tracking-wider sm:tracking-tight px-3 py-2 sm:px-6 sm:py-2.5 shadow-shadow hover:shadow-light transition-all whitespace-nowrap"
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
