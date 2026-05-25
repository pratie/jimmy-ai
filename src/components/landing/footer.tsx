"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-background text-muted-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-10 md:px-8 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 pb-8 md:mb-12 md:pb-12 border-b border-border">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-8 h-8">
                <Image
                  src="/images/logo.png"
                  alt="ChatDock AI Logo"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">ChatDock AI</span>
            </div>
            <p className="text-sm font-medium">Your 24/7 AI Sales Agent.</p>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-foreground">Product</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-foreground">Company</h4>
            <ul className="space-y-2 text-sm font-medium mb-6">
              <li>
                <Link href="/blogs" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
            </ul>

            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground/60">
                Need custom solutions or setup help?
              </p>
              <a
                href="https://cal.com/prathap-reddy-caxwn4/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-foreground hover:underline transition-all"
              >
                Book a demo call
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <a href="https://x.com/prthpdev" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground/40">
          © 2025 ChatDock AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
