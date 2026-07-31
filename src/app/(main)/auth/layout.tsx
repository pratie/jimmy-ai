import AuthThemeEnforcer from '@/components/auth/theme-enforcer'
import { currentUser } from '@clerk/nextjs/server'
import { Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef0f4] p-3 sm:p-5 lg:p-7">
      <AuthThemeEnforcer />
      <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden bg-[#111827] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#7677f4]/20 blur-[100px]" />
          <Link href="/" className="relative flex items-center gap-2.5"><span className="relative h-9 w-9 overflow-hidden rounded-xl bg-white"><Image src="/images/chatdock-mark.png" alt="ChatDock" fill sizes="36px" className="object-contain" /></span><span className="text-base font-semibold">ChatDock</span></Link>
          <div className="relative max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aaaaff]">Agency delivery, organized</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white xl:text-5xl">From client website to working AI agent.</h2>
            <p className="mt-5 text-sm leading-7 text-white/50">Set up, test, install, and manage every client experience from one calm workspace.</p>
            <div className="mt-9 space-y-4">{['Train on approved client content', 'Capture leads and booked meetings', 'Manage every agent from one inbox'].map(item => <div key={item} className="flex items-center gap-3 text-sm text-white/70"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-emerald-300"><Check className="h-3.5 w-3.5" /></span>{item}</div>)}</div>
          </div>
          <p className="relative text-xs text-white/30">No code required to create your first agent.</p>
        </aside>

        <section className="flex min-h-[640px] min-w-0 items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden"><span className="relative h-8 w-8 overflow-hidden rounded-lg bg-slate-100"><Image src="/images/chatdock-mark.png" alt="ChatDock" fill sizes="32px" className="object-contain" /></span><span className="font-semibold text-slate-900">ChatDock</span></Link>
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
