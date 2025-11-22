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
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-main to-blue-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            <span className="relative flex items-center gap-2">
              <span className="hidden sm:inline text-sm">Start Free</span>
              <span className="sm:hidden text-xs">Start</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
