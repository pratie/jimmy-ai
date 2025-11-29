"use client"

import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl z-50 border-b border-slate-200/50 dark:border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clean and minimal */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.svg"
                alt="ChatDock AI"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              ChatDock AI
            </span>
          </Link>

          {/* Nav links - Clean spacing and typography */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Pricing
            </a>
            <Link
              href="/blogs"
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Blog
            </Link>
          </div>

          {/* CTA - Professional and minimal */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-200 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
