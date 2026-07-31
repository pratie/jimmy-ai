import { Footer } from '@/components/landing/footer'
import Image from 'next/image'
import Link from 'next/link'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8fa] text-slate-950">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5"><span className="relative h-8 w-8 overflow-hidden rounded-lg bg-slate-100"><Image src="/images/chatdock-mark.png" alt="ChatDock" fill sizes="32px" className="object-contain" /></span><span className="text-sm font-semibold">ChatDock</span><span className="hidden text-xs text-slate-300 sm:inline">/ Resources</span></Link>
          <Link href="/auth/sign-up" className="rounded-xl bg-[#111827] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#252d3d]">Start free</Link>
        </div>
      </header>
      {children}
      <Footer />
    </div>
  )
}
