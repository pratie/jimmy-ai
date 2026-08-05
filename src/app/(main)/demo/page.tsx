import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import DemoSandbox from '@/components/landing/demo-sandbox'

/**
 * The demo lives on its own route rather than inside a homepage card so the
 * chat has room to be used properly and the workspace readout has room to
 * exist at all. `?url=` lets the homepage hand off a site the visitor already
 * typed, so they are not asked to enter it twice.
 */
export const metadata: Metadata = {
  title: 'Try ChatDock on any website — live demo',
  description:
    'Paste any website and ChatDock builds a working AI receptionist from its public pages. No signup, no card, nothing to install.',
  // A demo keyed to an arbitrary URL is not a page worth indexing, and every
  // ?url= variant would be a near-duplicate of the last.
  robots: { index: false, follow: true },
}

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>
}) {
  const { url } = await searchParams

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <header className="sticky top-0 z-30 border-b border-[#E4E7EC] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            {/* Not logo.svg — that file is an <svg> wrapping <image href="…png">,
                which browsers refuse to resolve inside an <img>, so it renders
                blank. The PNG is what the navbar uses. */}
            <Image src="/images/chatdock-mark.png" alt="" width={26} height={26} className="rounded-md" />
            <span className="font-heading text-[15px] font-extrabold tracking-tight text-[#101828]">
              ChatDock
            </span>
          </Link>
          <span className="hidden rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[11px] font-semibold text-[#475467] sm:block">
            Live demo
          </span>
          <Link
            href="/auth/sign-up"
            className="press ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#101828] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0E1726]"
          >
            Start free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <DemoSandbox initialUrl={url?.trim() || undefined} />
    </main>
  )
}
