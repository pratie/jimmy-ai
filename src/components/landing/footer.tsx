import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#10142b] px-5 py-14 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="relative h-8 w-8 overflow-hidden rounded-lg bg-white">
                <Image src="/images/chatdock-mark.png" alt="ChatDock" fill sizes="32px" className="object-contain" />
              </span>
              <span className="font-bold tracking-tight">ChatDock</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/45">
              Turn every client website into a 24/7 assistant that answers questions, captures leads, and books
              appointments — managed from one agency dashboard.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Product</p>
            <div className="mt-5 space-y-3 text-sm text-white/60">
              <Link className="block transition-colors hover:text-white" href="/#demo">Live demo</Link>
              <Link className="block transition-colors hover:text-white" href="/#how-it-works">How it works</Link>
              <Link className="block transition-colors hover:text-white" href="/#pricing">Pricing</Link>
              <Link className="block transition-colors hover:text-white" href="/#faq">FAQ</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Resources</p>
            <div className="mt-5 space-y-3 text-sm text-white/60">
              <Link className="block transition-colors hover:text-white" href="/blogs">Blog</Link>
              <a
                className="block transition-colors hover:text-white"
                href="https://cal.com/prathap-reddy-caxwn4/15min"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a demo
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Account</p>
            <div className="mt-5 space-y-3 text-sm text-white/60">
              <Link className="block transition-colors hover:text-white" href="/auth/sign-in">Sign in</Link>
              <Link className="block transition-colors hover:text-white" href="/auth/sign-up">Start free</Link>
              <a
                className="block transition-colors hover:text-white"
                href="https://x.com/prthpdev"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ChatDock. All rights reserved.</p>
          <p>Built for agencies that deliver.</p>
        </div>
      </div>
    </footer>
  )
}
