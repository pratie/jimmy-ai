import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#0d1321] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5"><span className="relative h-8 w-8 overflow-hidden rounded-lg bg-white"><Image src="/images/logo.png" alt="ChatDock" fill className="object-contain" /></span><span className="font-semibold">ChatDock</span></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/40">The AI delivery workspace for agencies that want to launch faster and show clients what is working.</p>
          </div>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/30">Platform</p><div className="mt-5 space-y-3 text-sm text-white/55"><a className="block hover:text-white" href="#workflow">How it works</a><a className="block hover:text-white" href="#features">Features</a><a className="block hover:text-white" href="#pricing">Pricing</a></div></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/30">Resources</p><div className="mt-5 space-y-3 text-sm text-white/55"><Link className="block hover:text-white" href="/blogs">Blog</Link><a className="block hover:text-white" href="https://cal.com/prathap-reddy-caxwn4/15min" target="_blank" rel="noopener noreferrer">Book a demo</a></div></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/30">Account</p><div className="mt-5 space-y-3 text-sm text-white/55"><Link className="block hover:text-white" href="/auth/sign-in">Sign in</Link><Link className="block hover:text-white" href="/auth/sign-up">Start free</Link><a className="block hover:text-white" href="https://x.com/prthpdev" target="_blank" rel="noopener noreferrer">Contact</a></div></div>
        </div>
        <div className="flex flex-col gap-3 pt-8 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} ChatDock. All rights reserved.</p><p>Built for agencies that deliver.</p></div>
      </div>
    </footer>
  )
}
