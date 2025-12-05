"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10 md:px-8 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 pb-8 md:mb-12 md:pb-12 border-b border-slate-200 dark:border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.svg"
                alt="ChatDock AI Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">ChatDock AI</span>
            </div>
            <p className="text-sm font-medium">Your 24/7 AI Sales Agent.</p>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-900 dark:text-white">Product</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-900 dark:text-white">Company</h4>
            <ul className="space-y-2 text-sm font-medium mb-6">
              <li>
                <Link href="/blogs" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>

            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
                Need custom solutions or setup help?
              </p>
              <a
                href="mailto:rishi@chatdock.io"
                className="text-sm font-bold text-slate-900 dark:text-white hover:underline transition-all"
              >
                Reach out at rishi@chatdock.io
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-900 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <a href="https://x.com/prthpdev" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm font-medium uppercase tracking-widest opacity-60">
          © 2025 ChatDock AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
