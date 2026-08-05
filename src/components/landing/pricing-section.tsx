'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator, Check, Info } from 'lucide-react'

import { PLAN_LIMITS, PLAN_PRICES, type PlanType } from '@/lib/plans'
import { LANDING_EVENTS, track } from '@/lib/analytics'
import { Reveal } from '@/components/landing/reveal'

/**
 * Section 13 — pricing.
 *
 * Prices and every limit are read from src/lib/plans.ts, the same module the
 * billing and settings surfaces use, so this section cannot drift from what a
 * customer is actually charged or actually allowed.
 *
 * Each plan is framed by the agency's stage rather than by feature tiering,
 * and no limit is hidden — including the one that matters most: what happens
 * when the message allowance runs out.
 */

type Billing = 'monthly' | 'yearly'

const PLANS: {
  plan: PlanType
  name: string
  stage: string
  copy: string
  cta: string
  recommended?: boolean
}[] = [
  {
    plan: 'FREE',
    name: 'Free',
    stage: 'Win the first client',
    copy: 'Use a real website, build a working assistant and test the complete flow before you sell anything.',
    cta: 'Start free',
  },
  {
    plan: 'STARTER',
    name: 'Starter',
    stage: 'Launch the first paid client',
    copy: 'For an agency introducing the service to one client and proving it produces leads.',
    cta: 'Start with Starter',
  },
  {
    plan: 'PRO',
    name: 'Pro',
    stage: 'Run a growing client roster',
    copy: 'For agencies with several live client workspaces who want the widget to carry no ChatDock branding.',
    cta: 'Start with Pro',
    recommended: true,
  },
  {
    plan: 'BUSINESS',
    name: 'Business',
    stage: 'Scale the offer',
    copy: 'For agencies making the AI receptionist a standard line item on every website retainer.',
    cta: 'Start with Business',
  },
]

const BRANDING: Record<PlanType, string> = {
  FREE: 'ChatDock badge on widget',
  STARTER: 'ChatDock badge on widget',
  PRO: 'Remove ChatDock branding',
  BUSINESS: 'Remove ChatDock branding',
}

const SUPPORT: Record<PlanType, string> = {
  FREE: 'Email support',
  STARTER: 'Email support',
  PRO: 'Email support',
  BUSINESS: 'Priority support',
}

const fmtLimit = (value: number) => (value === Infinity ? 'Unlimited' : value.toLocaleString())

function planRows(plan: PlanType) {
  const limits = PLAN_LIMITS[plan]
  return [
    `${fmtLimit(limits.domains)} client ${limits.domains === 1 ? 'workspace' : 'workspaces'}`,
    `${limits.messageCredits.toLocaleString()} messages / month`,
    `${limits.knowledgeBaseMB} MB knowledge base`,
    `${fmtLimit(limits.trainingSources)} training sources`,
    BRANDING[plan],
    SUPPORT[plan],
  ]
}

export default function PricingSection() {
  const [billing, setBilling] = React.useState<Billing>('monthly')
  const sectionRef = React.useRef<HTMLElement | null>(null)

  // One pricing_viewed event per page load, when the section actually appears.
  React.useEffect(() => {
    const node = sectionRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          track(LANDING_EVENTS.pricingViewed)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="pricing" className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5B5CE2]">Pricing</p>
          <h2 className="mt-3 font-heading text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-[#101828] sm:text-[38px]">
            Priced per client workspace, not per conversation.
          </h2>
          <p className="mt-4 text-[16px] leading-7 text-[#667085]">
            Start free on a real website. Move up only when you have a client paying you for the service.
          </p>
        </Reveal>

        {/* Billing toggle */}
        <Reveal delay={80} className="mt-8 flex justify-center">
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="inline-flex rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] p-1"
          >
            {(['monthly', 'yearly'] as Billing[]).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={billing === option}
                onClick={() => setBilling(option)}
                className={`rounded-md px-4 py-2 text-[13px] font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] ${
                  billing === option ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085]'
                }`}
              >
                {option}
                {option === 'yearly' && (
                  <span className="ml-1.5 rounded bg-[#ECFDF3] px-1.5 py-0.5 text-[10.5px] font-bold text-[#0B6E51]">
                    save up to 50%
                  </span>
                )}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((entry, index) => {
            const prices = PLAN_PRICES[entry.plan]
            const yearlyTotal = prices.yearly
            const shown =
              billing === 'yearly' && yearlyTotal > 0 ? Math.round(yearlyTotal / 12) : prices.monthly
            const featured = entry.recommended

            return (
              <Reveal key={entry.plan} delay={index * 80} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-5 sm:p-6 ${
                    featured
                      ? 'border-[#5B5CE2] bg-[#0E1726] text-white shadow-[0_16px_44px_-20px_rgba(16,24,40,0.5)]'
                      : 'border-[#E4E7EC] bg-white'
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-2.5 left-5 rounded-full bg-[#5B5CE2] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white">
                      Recommended
                    </span>
                  )}

                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      featured ? 'text-white/45' : 'text-[#667085]'
                    }`}
                  >
                    {entry.name}
                  </p>
                  <p
                    className={`mt-1.5 font-heading text-[16px] font-bold tracking-tight ${
                      featured ? 'text-white' : 'text-[#101828]'
                    }`}
                  >
                    {entry.stage}
                  </p>

                  <div className="mt-4 flex items-end gap-1">
                    <span className="font-heading text-[34px] font-bold leading-none tracking-tight">
                      ${shown}
                    </span>
                    <span className={`pb-1 text-[13px] ${featured ? 'text-white/50' : 'text-[#667085]'}`}>
                      / month
                    </span>
                  </div>
                  <p className={`mt-1.5 text-[11.5px] ${featured ? 'text-white/45' : 'text-[#667085]'}`}>
                    {billing === 'yearly' && yearlyTotal > 0
                      ? `Billed $${yearlyTotal} yearly`
                      : prices.monthly === 0
                        ? 'Free forever · no card required'
                        : 'Billed monthly · cancel any time'}
                  </p>

                  <p
                    className={`mt-4 border-t pt-4 text-[13px] leading-6 ${
                      featured ? 'border-white/10 text-white/65' : 'border-[#E4E7EC] text-[#667085]'
                    }`}
                  >
                    {entry.copy}
                  </p>

                  <ul className="mt-4 flex-1 space-y-2.5">
                    {planRows(entry.plan).map((row) => (
                      <li
                        key={row}
                        className={`flex items-start gap-2 text-[12.5px] leading-5 ${
                          featured ? 'text-white/85' : 'text-[#475467]'
                        }`}
                      >
                        <Check
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                            featured ? 'text-[#4ADE9E]' : 'text-[#16A67A]'
                          }`}
                        />
                        {row}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/sign-up"
                    onClick={() => track(LANDING_EVENTS.planSelected, { plan: entry.plan })}
                    className={`press mt-6 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      featured
                        ? 'bg-white text-[#0E1726] hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-[#0E1726]'
                        : 'border border-[#E4E7EC] bg-white text-[#101828] hover:bg-[#F7F8FA] focus-visible:ring-[#5B5CE2]'
                    }`}
                  >
                    {entry.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* The limit people usually find out about later — stated up front instead */}
        <Reveal delay={200} className="mt-6">
          <div className="rounded-xl border border-[#E4E7EC] bg-[#F7F8FA] p-4 sm:p-5">
            <p className="flex items-start gap-2 text-[13px] leading-6 text-[#475467]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#667085]" />
              <span>
                <strong className="font-semibold text-[#101828]">
                  What happens at the message limit:
                </strong>{' '}
                the assistant stops replying to new visitors until the allowance resets on your next
                30-day cycle, or until you upgrade. There is no automatic overage charge and no surprise
                invoice. Messages are pooled across all of your client workspaces rather than allocated
                per client.
              </span>
            </p>
          </div>
        </Reveal>

        <Reveal delay={240} className="mt-6 flex flex-col items-center gap-3 text-center">
          <a
            href="#for-agencies"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#5B5CE2] transition-colors hover:text-[#4A4BD0]"
          >
            <Calculator className="h-4 w-4" />
            Work out your margin at your own prices
          </a>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/auth/sign-up"
              onClick={() => track(LANDING_EVENTS.planSelected, { plan: 'FREE' })}
              className="press inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5B5CE2] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#4A4BD0]"
            >
              Build the first demo free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://cal.com/prathap-reddy-caxwn4/15min"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track(LANDING_EVENTS.walkthroughBooked, { location: 'pricing' })}
              className="press inline-flex h-11 items-center justify-center rounded-lg border border-[#E4E7EC] bg-white px-6 text-[14px] font-semibold text-[#101828] transition-colors hover:bg-[#F7F8FA]"
            >
              Talk through your first client
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
