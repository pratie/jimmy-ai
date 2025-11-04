"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-foreground text-background border-t-4 border-background">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12 pb-12 border-b-2 border-background">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.svg"
                alt="ChatDock Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-extrabold uppercase text-lg">ChatDock</span>
            </div>
            <p className="text-sm font-bold">AI knowledge base & website assistant.</p>
          </div>

          <div>
            <h4 className="font-black mb-4 uppercase text-sm tracking-widest">Product</h4>
            <ul className="space-y-2 text-sm font-bold">
              <li>
                <a href="#features" className="hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:underline">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-4 uppercase text-sm tracking-widest">Company</h4>
            <ul className="space-y-2 text-sm font-bold">
              <li>
                <Link href="/blogs" className="hover:underline">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-4 uppercase text-sm tracking-widest">Legal</h4>
            <ul className="space-y-2 text-sm font-bold">
              <li>
                <a href="https://x.com/snow_stark17" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm font-black uppercase tracking-widest">
          © 2025 ChatDock. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
