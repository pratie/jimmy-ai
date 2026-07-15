import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

const included = [
  'Done-for-you first client setup',
  'Client website and document training',
  'Qualification and appointment flow',
  'Weekly launch-period tuning',
  'Unlimited conversations',
  'Ongoing monitoring and support',
]

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">For your first client launch</p>
          <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Deliver the first result with us beside you.</h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">We’ll help train, launch, and tune the first client agent so your agency can learn the workflow and own the relationship.</p>
          <Link href="/auth/sign-up" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#5f60d8]">Or explore the platform free <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[#dfe2e9] bg-[#f6f7fa] shadow-[0_30px_80px_rgba(17,24,39,.08)]">
          <div className="grid md:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-[#171d2b] p-8 text-white sm:p-10">
              <span className="rounded-full bg-[#8586f7]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#b6b7ff]">Agency launch</span>
              <div className="mt-9 flex items-end gap-2"><span className="text-5xl font-semibold tracking-tight">$97</span><span className="pb-1 text-sm text-white/45">/ month</span></div>
              <p className="mt-3 text-sm text-white/45">$500 one-time setup</p>
              <a href="https://cal.com/prathap-reddy-caxwn4/15min" target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#7778f4] text-sm font-semibold text-white transition hover:bg-[#696ae6]">Book your launch call</a>
              <p className="mt-4 text-center text-[11px] text-white/35">Talk through your use case before committing</p>
            </div>
            <div className="p-8 sm:p-10">
              <p className="text-sm font-semibold text-slate-900">Everything needed for the first launch</p>
              <div className="mt-7 space-y-4">{included.map(item => <div key={item} className="flex items-start gap-3 text-sm text-slate-600"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-3 w-3" /></span>{item}</div>)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
