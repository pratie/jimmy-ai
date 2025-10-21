import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <>
      <div className="w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center text-2xl tracking-tighter text-brand-primary">
              <Image
                src="/images/logo.svg"
                alt="Logo"
                sizes="100vw"
                style={{ width: '50px', height: 'auto' }}
                width={0}
                height={0}
              />
            </div>

            {/* Nav links */}
            <ul className="hidden md:flex items-center gap-6 text-sm text-brand-primary/70 font-medium">
              <li>
                <a
                  href="#features"
                  className="hover:text-brand-primary hover:underline decoration-brand-accent decoration-2 underline-offset-4 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-brand-primary hover:underline decoration-brand-accent decoration-2 underline-offset-4 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="hover:text-brand-primary hover:underline decoration-brand-accent decoration-2 underline-offset-4 transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>

            {/* CTA */}
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-base bg-main text-black font-heading border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
            >
              Start Automating Now
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-brand-base-300" />
    </>
  )
}

export default NavBar
