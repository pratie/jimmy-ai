"use client"

import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-xl z-50 border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clean and minimal */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="ChatDock AI"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              ChatDock AI
            </span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
            >
              Pricing
            </a>
            <Link
              href="/blogs"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
            >
              Blog
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <a
              href="https://cal.com/prathap-reddy-caxwn4/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all duration-200 shadow-glow"
            >
              Book Demo
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-4">
            <a
              href="#features"
              className="block text-base font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block text-base font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <Link
              href="/blogs"
              className="block text-base font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Link
                href="/auth/sign-in"
                className="block text-center text-base font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
              <a
                href="https://cal.com/prathap-reddy-caxwn4/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-5 py-3 text-base font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Demo
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar
