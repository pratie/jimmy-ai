import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowDown, ArrowRight, Check, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react'

import AgencyProblem from '@/components/landing/agency-problem'
import Capabilities from '@/components/landing/capabilities'
import ClientReport from '@/components/landing/client-report'
import Faq from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'
import GroundedAnswers from '@/components/landing/grounded-answers'
import HeroPipeline from '@/components/landing/hero-pipeline'
import IndustryTabs from '@/components/landing/industry-tabs'
import InteractivePreviewChat from '@/components/landing/interactive-preview-chat'
import LaunchSteps from '@/components/landing/launch-steps'
import MarginCalculator from '@/components/landing/margin-calculator'
import PricingSection from '@/components/landing/pricing-section'
import { Reveal } from '@/components/landing/reveal'
import ServiceLayers from '@/components/landing/service-layers'
import StackComparison from '@/components/landing/stack-comparison'
import SelfWidget from '@/components/landing/self-widget'
import StickyCta from '@/components/landing/sticky-cta'
import NavBar from '@/components/navbar'
import { FAQS } from '@/constants/faq'

export const metadata: Metadata = {
  title: 'ChatDock — AI Receptionists Agencies Can Sell to Every Website Client',
  description:
    'Turn every client website into an AI receptionist that answers from approved content, qualifies visitors and books appointments. Launch, brand and manage every client from one agency dashboard.',
  keywords: [
    'AI chatbot platform for agencies',
    'white label AI chatbot for agencies',
    'AI receptionist for local businesses',
    'website chatbot for appointment booking',
    'AI lead capture chatbot',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Turn every client website into an AI receptionist — and a new monthly service',
    description:
      'For web, SEO and lead-generation agencies. Launch a branded assistant that answers from approved content, qualifies visitors and books appointments.',
    url: '/',
    type: 'website',
  },
}

/* Real, verifiable platform support: installation is a single script tag. */
const PLATFORMS = ['WordPress', 'Webflow', 'Wix', 'Shopify', 'Squarespace', 'Framer', 'Custom builds']

const VERTICALS = [
  'Dental practices',
  'Med spas',
  'HVAC companies',
  'Plumbers',
  'Roofers',
  'Law firms',
  'Chiropractors',
  'Fitness studios',
  'Salons',
  'Real-estate teams',
  'Veterinary clinics',
  'Home services',
]

const TRUST_POINTS = ['No code required', 'Test with a real website', '100 free messages']

/** Shared section heading. Server-rendered so the copy is always in the HTML. */
function SectionHeading({
  eyebrow,
  title,
  copy,
  align = 'center',
}: {
  eyebrow: string
  title: string
  copy?: string
  align?: 'center' | 'left'
}) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5B5CE2]">{eyebrow}</p>
      <h2 className="mt-3 font-heading text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-[#101828] sm:text-[38px]">
        {title}
      </h2>
      {copy && <p className="mt-4 text-[16px] leading-7 text-[#667085]">{copy}</p>}
    </Reveal>
  )
}

function VerticalsMarquee() {
  const row = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden || undefined} className="flex shrink-0 animate-marquee items-center">
      {VERTICALS.map((vertical) => (
        <span
          key={vertical}
          className="mx-1.5 flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#E4E7EC] bg-white px-3.5 py-2 text-[13px] font-medium text-[#475467]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A67A]" />
          {vertical}
        </span>
      ))}
    </div>
  )

  return (
    <div className="group relative overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max group-hover:[&>div]:[animation-play-state:paused] motion-reduce:[&>div]:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}

export default function Home() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F8FA] text-[#101828] selection:bg-[#5B5CE2] selection:text-white">
      {/* Scroll-revealed content must never stay hidden without JS */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[#101828] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <NavBar />

      {/* ═══════════════ Section 2 · Hero ═══════════════ */}
      <section id="main-content" className="relative px-5 pb-16 pt-24 sm:px-8 md:pt-32 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(16,24,40,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,24,40,.03)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#E4E7EC] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#475467]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A67A] opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#16A67A]" />
                </span>
                For web, SEO and lead-generation agencies
              </p>
            </Reveal>

            <Reveal delay={70}>
              <h1 className="mt-5 text-balance font-heading text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-[#101828] sm:text-[44px] lg:text-[52px]">
                Turn every client website into an AI receptionist
                <span className="text-[#5B5CE2]">—and a new monthly service.</span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-5 max-w-xl text-[16.5px] leading-8 text-[#667085]">
                Launch a branded assistant that answers from the client&apos;s approved content, qualifies
                visitors and books appointments. Manage every client and every conversation from one agency
                dashboard.
              </p>
            </Reveal>

            <Reveal delay={210}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/sign-up"
                  className="press inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#5B5CE2] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#4A4BD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2"
                >
                  Build a demo for a client <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#demo"
                  className="press inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#E4E7EC] bg-white px-6 text-[15px] font-semibold text-[#101828] transition-colors hover:bg-[#F7F8FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2"
                >
                  Try it on a real website <ArrowDown className="h-4 w-4" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#667085]">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#16A67A]" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <HeroPipeline />
          </Reveal>
        </div>
      </section>

      {/* Roster context — the businesses already on the visitor's client list */}
      <section aria-label="Client industries served" className="border-y border-[#E4E7EC] bg-white py-6">
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#667085]">
          Built for the local businesses already in your client roster
        </p>
        <VerticalsMarquee />
      </section>

      {/* ═══════════════ Section 3 · Immediate credibility ═══════════════ */}
      <section id="demo" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="See it for yourself"
            title="Don’t take our word for it. Test it on a real website."
            copy="Paste your website or a client’s website. ChatDock will create a working preview using the public content it finds — no signup, no card, nothing to install."
          />

          <Reveal delay={100} className="mt-10">
            <InteractivePreviewChat />
          </Reveal>

          {/* Product-driven credibility. No logos, testimonials or user counts —
              none exist yet, and inventing them would be the fastest way to
              lose an agency owner who checks. */}
          <Reveal delay={160} className="mt-8">
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5">
                <ShieldCheck className="h-5 w-5 text-[#5B5CE2]" />
                <h3 className="mt-4 font-heading text-[15px] font-bold tracking-tight text-[#101828]">
                  Answers come from approved content
                </h3>
                <p className="mt-2 text-[13.5px] leading-6 text-[#667085]">
                  The preview above is reading real pages from whatever URL you give it — the same way a
                  client workspace does. What it can&apos;t find, it won&apos;t invent.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5">
                <Sparkles className="h-5 w-5 text-[#5B5CE2]" />
                <h3 className="mt-4 font-heading text-[15px] font-bold tracking-tight text-[#101828]">
                  Installs anywhere you build
                </h3>
                <p className="mt-2 text-[13.5px] leading-6 text-[#667085]">
                  One script tag before the closing body tag. No plugin, no theme edits.
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {PLATFORMS.map((platform) => (
                    <li
                      key={platform}
                      className="rounded-md border border-[#E4E7EC] bg-[#F7F8FA] px-2 py-1 text-[11.5px] font-medium text-[#475467]"
                    >
                      {platform}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5">
                <MessageSquareText className="h-5 w-5 text-[#5B5CE2]" />
                <h3 className="mt-4 font-heading text-[15px] font-bold tracking-tight text-[#101828]">
                  From the founder
                </h3>
                <p className="mt-2 text-[13.5px] leading-6 text-[#667085]">
                  “ChatDock is early and I build it myself, so you won&apos;t find customer logos or
                  testimonials on this page yet — I&apos;m not going to invent them. What you can do is test
                  it on a real site right now, and email me when something breaks.”
                </p>
                <a
                  href="https://cal.com/prathap-reddy-caxwn4/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5B5CE2] transition-colors hover:text-[#4A4BD0]"
                >
                  — Prathap, founder · book 15 minutes <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ Section 4 · The agency problem ═══════════════ */}
      <section className="border-y border-[#E4E7EC] bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Why this sells"
            title="Your clients don’t need another chatbot. They need more captured opportunities."
            copy="Three things make an AI receptionist an easy conversation with a client you already have."
          />
          <div className="mt-12">
            <AgencyProblem />
          </div>
        </div>
      </section>

      {/* ═══════════════ Section 5 · How it works ═══════════════ */}
      <section id="how-it-works" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="How it works"
            title="From client website to working AI receptionist in one afternoon."
            copy="The same four steps for every client you sign — dental practice, plumber or law firm. No custom development at any point."
          />
          <div className="mt-12">
            <LaunchSteps />
          </div>
        </div>
      </section>

      {/* ═══════════════ Section 6 · The productised service ═══════════════ */}
      <section className="border-y border-[#E4E7EC] bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="What you’re selling"
            title="One repeatable service for every website client."
            copy="Four connected layers — what the visitor experiences, what you capture, how each client stays separate, and how you run the whole roster."
          />
          <div className="mt-12">
            <ServiceLayers />
          </div>
        </div>
      </section>

      {/* ═══════════════ Section 7 · Results and retention ═══════════════ */}
      <section id="results" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Keep the retainer"
            title="Don’t tell clients the assistant is running. Show them what it produced."
            copy="This is the screen you open on a monthly review call. Every number answers one question: what did it handle, what did it capture, what should the business fix, and why should they keep paying."
          />
          <div className="mt-12">
            <ClientReport />
          </div>
        </div>
      </section>

      {/* ═══════════════ Section 8 · Revenue opportunity ═══════════════ */}
      <section
        id="for-agencies"
        className="scroll-mt-20 border-y border-[#E4E7EC] bg-white px-5 py-20 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="The agency case"
            title="Turn a website project into an ongoing service."
            copy="You already earned the client’s trust and manage their website. ChatDock gives you an additional service to introduce without hiring an AI team or rebuilding the stack for every account."
          />
          <Reveal delay={100} className="mt-12">
            <MarginCalculator />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ Section 9 · Before and after ═══════════════ */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Before and after"
            title="Stop rebuilding the same chatbot stack for every client."
            copy="The pieces are not the hard part. Keeping nine of them working across a dozen client accounts is."
          />
          <div className="mt-12">
            <StackComparison />
          </div>
        </div>
      </section>

      {/* ═══════════════ Section 10 · Core capabilities ═══════════════ */}
      <section id="product" className="scroll-mt-20 border-y border-[#E4E7EC] bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything between “a visitor had a question” and “the client got a booking.”"
            copy="Grouped by what it does for your agency, not by what it is technically."
          />
          <div className="mt-12">
            <Capabilities />
          </div>
        </div>
      </section>

      {/* ═══════════════ Section 11 · Grounded answers ═══════════════ */}
      <section id="trust" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Answer quality"
            title="Helpful when it knows. Honest when it doesn’t."
            copy="The question every agency owner asks before putting this on a client’s site — answered by showing both branches rather than promising accuracy."
          />
          <div className="mt-12">
            <GroundedAnswers />
          </div>
        </div>
      </section>

      {/* ═══════════════ Section 12 · Industry examples ═══════════════ */}
      <section id="industries" className="scroll-mt-20 border-y border-[#E4E7EC] bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Industry examples"
            title="Built for the local businesses already in your client roster."
            copy="The same assistant, configured for what each kind of business actually gets asked — and what a good lead looks like there."
          />
          <div className="mt-12">
            <IndustryTabs />
          </div>
        </div>
      </section>

      {/* ═══════════════ Section 13 · Pricing ═══════════════ */}
      <PricingSection />

      {/* ═══════════════ Section 14 · Objection handling ═══════════════ */}
      <section id="faq" className="scroll-mt-20 border-t border-[#E4E7EC] px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Questions before you commit"
            title="The things you’d ask on a sales call — answered here instead."
            copy="Including the parts that aren’t built yet."
          />
          <Reveal delay={100} className="mt-10">
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ Section 15 · Final conversion ═══════════════ */}
      <section className="px-5 pb-20 sm:px-8 lg:pb-24">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[#0E1726] px-6 py-16 text-center text-white sm:px-12 lg:py-20">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl font-heading text-[30px] font-bold leading-[1.12] tracking-[-0.025em] sm:text-[44px]">
                A prospect is on one of your clients’ websites right now.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[16.5px] leading-8 text-white/60">
                Build the assistant before your next client conversation. Show a working demo instead of
                explaining another proposal.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/auth/sign-up"
                  className="press inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold text-[#0E1726] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1726]"
                >
                  Build a client demo <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://cal.com/prathap-reddy-caxwn4/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex h-12 items-center justify-center rounded-lg border border-white/20 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1726]"
                >
                  Book a 15-minute walkthrough
                </a>
              </div>
              <p className="mt-6 text-[13px] text-white/40">
                No credit card · Real website · 100 free messages
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
      <StickyCta />

      <Script id="ld-faq" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(faqSchema)}
      </Script>

      {/* ChatDock's own assistant — marketing site only. SelfWidget owns the
          teardown, because the embed appends its iframe outside React's tree
          and would otherwise follow a signed-in user into the dashboard. */}
      {process.env.NEXT_PUBLIC_CHATDOCK_WIDGET_KEY && (
        <SelfWidget widgetKey={process.env.NEXT_PUBLIC_CHATDOCK_WIDGET_KEY} />
      )}
    </main>
  )
}
