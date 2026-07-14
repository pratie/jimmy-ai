import ChatbotPreview from '@/components/settings/chatbot-preview'
import { client } from '@/lib/prisma'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Agent preview — ChatDock',
  robots: { index: false, follow: false },
}

export default async function PreviewPage({ params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params
  if (!domainId || typeof domainId !== 'string') redirect('/dashboard')

  const domain = await client.domain.findUnique({ where: { id: domainId }, select: { name: true } })
  if (!domain) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"><ArrowLeft className="h-3.5 w-3.5" /> Back to workspace</Link>
            <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Test {domain.name}</h1>
            <p className="mt-2 text-sm text-slate-500">Review the visitor experience before sharing install code with your client.</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:self-auto"><ShieldCheck className="h-4 w-4" /> Private preview · not indexed</div>
        </div>
        <ChatbotPreview domainId={domainId} />
      </div>
    </main>
  )
}
