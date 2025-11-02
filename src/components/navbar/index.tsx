"use client"

import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <nav className="fixed top-0 w-full bg-background z-50 border-b-4 border-foreground">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.svg"
              alt="BookmyLead Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-extrabold text-xl tracking-tight uppercase">BookmyLead</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex gap-12 font-bold uppercase text-sm tracking-widest">
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

          {/* CTA */}
          <Link
            href="/auth/sign-up"
            className="bg-foreground text-background font-bold border-2 border-foreground uppercase text-xs tracking-widest px-6 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
