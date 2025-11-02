import type { Metadata } from 'next'
import NavBar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import PricingSection from '@/components/landing/pricing-section'
import Script from 'next/script'
import FlowDiagram from '@/components/landing/flow-diagram'
import { Check } from 'lucide-react'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default async function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-center flex-col pt-20 md:pt-28 lg:pt-32 pb-12 md:pb-16 gap-6 md:gap-8">

            {/* Main Headline */}
            <div className="text-center space-y-5 md:space-y-6 max-w-4xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-brand-primary leading-[1.15] tracking-tight">
                Turn Website Visitors Into
                <br />
                <span className="bg-main px-4 py-2 rounded-base border-2 border-border inline-block mt-3 text-black">
                  Paying Customers 24/7
                </span>
              </h1>

              <p className="text-brand-primary/65 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
                AI-powered chatbot for e-commerce, agencies, and SMBs. Answer customer questions instantly, recover abandoned carts, qualify leads, and close sales while you sleep.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-brand-primary/75 mt-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                <span className="text-sm font-normal">Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                <span className="text-sm font-normal">Live in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                <span className="text-sm font-normal">No coding needed</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/auth/sign-up" className="mt-2">
              <Button size="lg" className="bg-main text-black font-heading px-10 py-6 text-lg border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                Start for free →
              </Button>
            </Link>

            {/* Dashboard Preview */}
            <div className="mt-10 md:mt-16 relative w-full max-w-5xl">
              <Image
                src="/images/app-ui.png"
                width={1200}
                height={800}
                alt="BookmyLead AI Dashboard"
                className="w-full h-auto object-contain relative z-10 shadow-2xl rounded-2xl border border-brand-base-300/40 bg-white/70 dark:bg-black/30 backdrop-blur-sm p-2"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 bg-brand-base-100/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-brand-primary mb-2">67%</div>
              <div className="text-brand-primary/70 text-sm md:text-base font-medium">Higher conversion rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-brand-primary mb-2">40%</div>
              <div className="text-brand-primary/70 text-sm md:text-base font-medium">Fewer cart abandonments</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-brand-primary mb-2">24/7</div>
              <div className="text-brand-primary/70 text-sm md:text-base font-medium">Customer support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-brand-primary mb-2">5min</div>
              <div className="text-brand-primary/70 text-sm md:text-base font-medium">To go live</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Interactive Flow */}
      <FlowDiagram />

      {/* Features Grid */}
      <section id="features" className="py-24 bg-brand-base-100/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-primary mb-6">
              Built for growing businesses
            </h2>
            <p className="text-brand-primary/70 text-lg md:text-xl max-w-3xl mx-auto">
              Everything you need to sell more, support better, and scale faster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature Cards */}
            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-accent/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-accent/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Recover abandoned carts</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Proactively engage shoppers before they leave. Answer objections, offer help, and guide them to checkout—automatically reducing cart abandonment by up to 40%.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-info/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-info/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Answer product questions instantly</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Your AI knows every product detail, shipping policy, and return procedure. Gives accurate answers in seconds—like your best salesperson, but available 24/7.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-success/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-success/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Book consultations automatically</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Perfect for agencies and service businesses. AI qualifies prospects, books discovery calls, and syncs with your calendar—no back-and-forth emails needed.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-accent/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-accent/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Seamless human handoff</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                AI handles 80% of questions automatically. For complex issues, it notifies your team and hands off with full context—no repeated questions for customers.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-info/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-info/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Track every sale & lead</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                See which conversations turned into sales, what questions customers ask most, and where to optimize. All conversations saved and searchable.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-success/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-success/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Scale across multiple stores</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Perfect for agencies managing client sites or businesses with multiple brands. One dashboard to rule them all—each AI trained on specific products and policies.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-accent/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-accent/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Qualify leads while they browse</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                AI engages visitors naturally, asks qualifying questions, and captures emails at the right moment. No aggressive popups—just helpful conversations that convert.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-info/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-info/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Instant responses that feel human</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Sub-second response times keep customers engaged. Advanced AI streaming makes conversations feel natural—not robotic. Your visitors won&apos;t know they&apos;re talking to AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-brand-accent/10 via-brand-info/10 to-brand-success/10 rounded-3xl p-12 md:p-16 border-2 border-brand-base-300">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-primary mb-6">
              Start converting more visitors today
            </h2>
            <p className="text-brand-primary/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join 500+ e-commerce stores, agencies, and SMBs using AI to boost sales, reduce support costs, and scale without adding headcount.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-main text-black font-heading px-12 py-7 text-xl border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                Get started free →
              </Button>
            </Link>
            <p className="text-brand-primary/60 text-sm mt-6">
              Free forever plan • Live in 5 minutes • No credit card needed
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Footer */}
      <Footer />

      {/* Chatbot Embed - Landing page only */}
      <Script
        id="bml-embed"
        src="https://www.bookmylead.app/embed.min.js"
        strategy="afterInteractive"
        data-domain-id="75975441-fef0-4fa2-8034-cdd69e1a96ff"
        data-app-origin="https://www.bookmylead.app"
        data-margin="24"
        data-size="md"
      />
    </main>
  )
}
