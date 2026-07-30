import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

import { pricingCards } from '@/constants/landing-page'
import { Reveal } from '@/components/landing/reveal'

export default function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-white px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">Pricing</p>
          <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.03em] text-[#171d3b] sm:text-5xl">
            Priced per client workspace. Profitable from client one.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#5a6072]">
            Agencies typically charge each client $300–1,500 a month for this service. Your cost stays a fraction of
            one client&apos;s retainer — and there&apos;s no annual lock-in.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pricingCards.map((card, index) => {
            const isPopular = card.title === 'Pro'
            return (
              <Reveal key={card.title} delay={index * 90} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-[24px] border p-6 transition-all duration-300 ease-out-strong sm:p-7 ${
                    isPopular
                      ? 'border-transparent bg-[#171d3b] text-white shadow-[0_36px_80px_-28px_rgba(23,29,59,0.55)]'
                      : 'border-black/[0.08] bg-[#fafafc] text-[#171d3b] hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(23,29,59,0.18)]'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#7677f4] px-3.5 py-1 text-[11px] font-bold text-white shadow-[0_6px_16px_-4px_rgba(118,119,244,0.7)]">
                      Most popular
                    </span>
                  )}
                  <p className={`text-sm font-bold uppercase tracking-wider ${isPopular ? 'text-[#b6b7ff]' : 'text-[#8a8fa5]'}`}>
                    {card.title}
                  </p>
                  <div className="mt-5 flex items-end gap-1.5">
                    <span className="font-heading text-4xl font-bold tracking-tight">{card.price}</span>
                    <span className={`pb-1 text-sm ${isPopular ? 'text-white/50' : 'text-[#8a8fa5]'}`}>/ {card.duration}</span>
                  </div>
                  <p className={`mt-2 text-[13px] leading-6 ${isPopular ? 'text-white/60' : 'text-[#8a8fa5]'}`}>
                    {card.description}
                  </p>
                  <div className="mt-6 flex-1 space-y-3">
                    {card.features.map((feature) => (
                      <div key={feature} className={`flex items-start gap-2.5 text-[13px] leading-5 ${isPopular ? 'text-white/85' : 'text-[#3c4257]'}`}>
                        <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center ${isPopular ? 'text-emerald-300' : 'text-emerald-600'}`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/auth/sign-up"
                    className={`press mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                      isPopular
                        ? 'bg-[#7677f4] text-white hover:bg-[#696ae6]'
                        : 'border border-black/[0.1] bg-white text-[#171d3b] hover:bg-black/[0.03]'
                    }`}
                  >
                    {card.title === 'Free' ? 'Start free' : `Start with ${card.title}`}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={200}>
          <div className="mt-10 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-[#8a8fa5]">
              Save roughly 40% on yearly billing — switch any time from your workspace.
            </p>
            <a
              href="https://cal.com/prathap-reddy-caxwn4/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5f60d8] transition-colors hover:text-[#4a4bc4]"
            >
              Want us to launch your first client with you? Book a 15-minute call <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
