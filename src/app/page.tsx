import NavBar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import PricingSection from '@/components/landing/pricing-section'
import { Check } from 'lucide-react'

export default async function Home() {
  return (
    <main className="landing-gradient min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-center flex-col pt-24 md:pt-32 pb-16 gap-8">

            {/* Main Headline */}
            <div className="text-center space-y-6 max-w-5xl">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-brand-primary leading-[1.1] tracking-tight">
                AI agents that turn
                <br />
                <span className="bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#6366f1]" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                  visitors into customers
                </span>
              </h1>

              <p className="text-brand-primary/70 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
                Train an AI agent on your company data. It captures leads, answers questions, and books meetings 24/7—while you focus on growing your business.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-brand-primary/80">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={3} />
                </div>
                <span className="text-sm md:text-base font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={3} />
                </div>
                <span className="text-sm md:text-base font-medium">Setup in under 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={3} />
                </div>
                <span className="text-sm md:text-base font-medium">100 messages free</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-12 py-7 text-xl rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-primary hover:shadow-brand-primary/50">
                Start for free →
              </Button>
            </Link>

            {/* Dashboard Preview */}
            <div className="mt-12 relative w-full max-w-6xl">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/20 via-brand-info/20 to-brand-success/20 blur-3xl -z-10"></div>
              <Image
                src="/images/app-ui.png"
                width={1200}
                height={800}
                alt="BookmyLead AI Dashboard"
                className="w-full h-auto object-contain relative z-10 drop-shadow-2xl rounded-3xl border-4 border-brand-base-300/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm p-3"
                priority
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
              <div className="text-4xl md:text-6xl font-extrabold text-brand-primary mb-2">3.2x</div>
              <div className="text-brand-primary/70 text-sm md:text-base font-medium">Conversion increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-brand-primary mb-2">24/7</div>
              <div className="text-brand-primary/70 text-sm md:text-base font-medium">Always available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-brand-primary mb-2">70%</div>
              <div className="text-brand-primary/70 text-sm md:text-base font-medium">Fewer support tickets</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-brand-primary mb-2">&lt;2min</div>
              <div className="text-brand-primary/70 text-sm md:text-base font-medium">Setup time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-transparent" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-primary mb-6">
              How it works
            </h2>
            <p className="text-brand-primary/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Get your AI agent up and running in minutes. No technical knowledge required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#f5d9d9] rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="text-3xl font-bold text-brand-primary">1</span>
              </div>
              <div className="bg-white dark:bg-black/40 backdrop-blur-md p-10 pt-12 rounded-3xl border-2 border-brand-base-300 h-full">
                <div className="w-16 h-16 bg-[#f5d9d9] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-brand-primary mb-4">Train your AI</h3>
                <p className="text-brand-primary/70 text-base leading-relaxed">
                  Upload your website URL, documents, or FAQs. Our AI learns everything about your business in seconds.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#d9d9f5] rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="text-3xl font-bold text-brand-primary">2</span>
              </div>
              <div className="bg-white dark:bg-black/40 backdrop-blur-md p-10 pt-12 rounded-3xl border-2 border-brand-base-300 h-full">
                <div className="w-16 h-16 bg-[#d9d9f5] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-brand-primary mb-4">Customize</h3>
                <p className="text-brand-primary/70 text-base leading-relaxed">
                  Set your brand voice, colors, and behavior. Choose between sales mode, support mode, or FAQ mode.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#d9f5e5] rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="text-3xl font-bold text-brand-primary">3</span>
              </div>
              <div className="bg-white dark:bg-black/40 backdrop-blur-md p-10 pt-12 rounded-3xl border-2 border-brand-base-300 h-full">
                <div className="w-16 h-16 bg-[#d9f5e5] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-brand-primary mb-4">Deploy & grow</h3>
                <p className="text-brand-primary/70 text-base leading-relaxed">
                  Copy one line of code to your website. Your AI agent starts capturing leads immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-brand-base-100/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-primary mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-brand-primary/70 text-lg md:text-xl max-w-3xl mx-auto">
              Built for founders who want results, not complexity
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
              <h3 className="text-xl font-bold text-brand-primary mb-3">24/7 lead capture</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Never miss another opportunity. Your AI works around the clock to qualify leads and schedule meetings.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-info/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-info/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Trained on your data</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Answers questions with your company knowledge. Handles objections, shares pricing, and closes deals.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-success/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-success/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Appointment booking</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Automatically syncs with your calendar. Books meetings instantly without the back-and-forth emails.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-accent/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-accent/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Live chat handoff</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                AI handles simple questions. When it needs you, it hands off seamlessly with full conversation history.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-info/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-info/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Real-time analytics</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                See every conversation, track conversion rates, and optimize your AI with actionable insights.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-success/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-success/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Multi-domain support</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Manage multiple websites from one dashboard. Each with its own AI trained on specific data.
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
              Ready to grow on autopilot?
            </h2>
            <p className="text-brand-primary/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join hundreds of founders using AI agents to capture more leads, close more deals, and scale faster.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-12 py-7 text-xl rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start for free →
              </Button>
            </Link>
            <p className="text-brand-primary/60 text-sm mt-6">
              No credit card required • Setup in 2 minutes • 100 messages free
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />
    </main>
  )
}
