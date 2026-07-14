import type { Metadata } from 'next'
import { ArrowLeft, Link2Off } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Portal — ChatDock',
  description: 'This portal URL is used for appointment and checkout links shared in chat conversations.',
  robots: { index: false, follow: false },
}

export default async function PortalIndex({ params }: { params: Promise<{ domainid: string }> }) {
  await params
  return (
    <main className="flex min-h-[420px] w-full items-center justify-center">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_14px_40px_rgba(15,23,42,.06)]">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><Link2Off className="h-5 w-5" /></span>
        <h1 className="mt-5 text-xl font-semibold text-slate-950">This link is incomplete</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Return to the conversation and use the full booking or payment link shared by the assistant.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600"><ArrowLeft className="h-3.5 w-3.5" /> Return to homepage</Link>
      </div>
    </main>
  )
}
