import { ArrowRight, Check, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { Reveal } from '@/components/landing/reveal'

const freeIncludes = [
  'Build an agent on a real website',
  '100 free messages to test with',
  'Full workspace & lead inbox',
  'No credit card required',
]

const launchIncludes = [
  'Done-for-you first client setup',
  'Client website and document training',
  'Qualification and appointment flow',
  'Weekly launch-period tuning',
  'Unlimited conversations',
  'Ongoing monitoring and support',
]

export default function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-white px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">Pricing</p>
          <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.03em] text-[#171d3b] sm:text-5xl">
            Try it free. Launch when a client says yes.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#5a6072]">
            Kick the tires on your own website for nothing. When you sign a client, we help you launch the first one so you learn the workflow with a result to show.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Free tier */}
          <Reveal delay={80} className="h-full">
            <div className="flex h-full flex-col rounded-[28px] border border-black/[0.08] bg-[#fafafc] p-8 sm:p-10">
              <p className="text-sm font-bold uppercase tracking-wider text-[#8a8fa5]">Explore</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="font-heading text-5xl font-bold tracking-tight text-[#171d3b]">$0</span>
              </div>
              <p className="mt-3 text-sm text-[#8a8fa5]">Test everything yourself, today</p>
              <div className="mt-8 flex-1 space-y-3.5">
                {freeIncludes.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-[#3c4257]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-black/[0.05] text-[#171d3b]">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/auth/sign-up"
                className="press mt-10 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-black/[0.1] bg-white text-sm font-semibold text-[#171d3b] transition-colors hover:bg-black/[0.03]"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          {/* Agency launch tier */}
          <Reveal delay={160} className="h-full">
            <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[#171d3b] p-8 text-white shadow-[0_40px_100px_-30px_rgba(23,29,59,0.55)] sm:p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#7677f4]/25 blur-[80px]" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-wider text-[#b6b7ff]">Agency launch</p>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#7677f4]/20 px-3 py-1 text-[11px] font-bold text-[#c3c4ff]">
                    <Sparkles className="h-3 w-3" /> Done with you
                  </span>
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <span className="font-heading text-5xl font-bold tracking-tight">$97</span>
                  <span className="pb-1.5 text-sm text-white/50">/ month</span>
                </div>
                <p className="mt-3 text-sm text-white/50">+ $500 one-time setup · we launch your first client with you</p>

                <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
                  {launchIncludes.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>

                <a
                  href="https://cal.com/prathap-reddy-caxwn4/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press mt-10 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7677f4] text-sm font-semibold text-white transition-colors hover:bg-[#696ae6]"
                >
                  Book your launch call <ArrowRight className="h-4 w-4" />
                </a>
                <p className="mt-4 text-center text-xs text-white/40">
                  15 minutes — talk through your client&apos;s use case before committing
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
