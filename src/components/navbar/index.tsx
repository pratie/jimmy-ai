"use client"

import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-50 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clean and minimal */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/logo.svg"
              alt="ChatDock AI"
              width={32}
              height={32}
              className="w-8 h-8 transition-transform group-hover:scale-105"
            />
            <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
              ChatDock AI
            </span>
          </Link>

          {/* Nav links - Clean spacing and typography */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              Pricing
            </a>
            <Link
              href="/blogs"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              Blog
            </Link>
          </div>

          {/* CTA - Professional and minimal */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 shadow-sm"
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
