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
import AnimatedChatHero from '@/components/landing/animated-chat-hero'

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative pt-8 md:pt-12 lg:pt-16 pb-12 md:pb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">


            {/* Left Column - Text Content */}
            <div className="space-y-6 md:space-y-8 max-w-2xl lg:max-w-none text-center lg:text-left">
              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-[56px] font-bold text-gray-900 dark:text-white leading-[1.1] tracking-[-0.02em]">
                  <span className="block">AI knowledge base</span>
                  <span className="block">
                    and website assistant
                    <span className="relative inline-block">
                      <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none">
                        <path d="M0 8 Q100 2 200 8" stroke="currentColor" strokeWidth="3" fill="none" className="text-main/50" />
                      </svg>
                    </span>
                  </span>
                </h1>
                <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-600 dark:text-gray-400">
                  Answers from your docs
                  <span className="relative inline-block px-2 py-0.5 bg-brand-accent/20 text-brand-accent font-bold rounded ml-1">
                    24/7
                  </span>
                  {' '}• Instant & accurate • Human handoff when needed
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-lg lg:max-w-xl leading-relaxed">
                Reduce tickets and help customers self‑serve with an AI assistant grounded in your website and documentation. Escalate to a human in real‑time, and book meetings when it matters. Built for support and growth teams.
              </p>

              {/* CTA and Trust Section */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-6">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-4 text-base rounded-lg hover:scale-105 transition-transform shadow-lg">
                    Get Started Free →
                  </Button>
                </Link>
                <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                    <span>Live in 5 minutes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Animated Chat Demo */}
            <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto">
              <div className="relative">
                <AnimatedChatHero density="cozy" title="ChatDock Assistant" />

                {/* Floating Dashboard Elements */}
                <div className="hidden lg:block absolute -right-16 top-10 space-y-4">
                  {/* Rating Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 w-48">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">4.9</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Works with your site + docs */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-primary">Works with your site + docs</h2>
            <p className="mt-3 text-brand-primary/70 max-w-2xl mx-auto">
              Bring your content in minutes. No complex setup.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300 flex flex-col items-start gap-3">
              <Image src="/icons/integrations.svg" alt="Website crawl" width={28} height={28} />
              <h3 className="font-semibold text-brand-primary">Website crawl</h3>
              <p className="text-sm text-brand-primary/70">Convert your site into clean, structured knowledge automatically.</p>
            </div>
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300 flex flex-col items-start gap-3">
              <Image src="/icons/documents.svg" alt="PDFs & docs" width={28} height={28} />
              <h3 className="font-semibold text-brand-primary">PDFs & docs</h3>
              <p className="text-sm text-brand-primary/70">Upload PDFs or paste text to enrich your knowledge base.</p>
            </div>
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300 flex flex-col items-start gap-3">
              <Image src="/icons/helpdesk.svg" alt="FAQs" width={28} height={28} />
              <h3 className="font-semibold text-brand-primary">FAQs</h3>
              <p className="text-sm text-brand-primary/70">Capture common questions/answers to guide fast resolutions.</p>
            </div>
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300 flex flex-col items-start gap-3">
              <Image src="/icons/settings.svg" alt="Guardrails" width={28} height={28} />
              <h3 className="font-semibold text-brand-primary">Guardrails</h3>
              <p className="text-sm text-brand-primary/70">On‑brand tone, strict FAQ mode, and live handoff when needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Learn more (Blog CTAs) */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-primary">Learn more</h2>
            <p className="mt-2 text-brand-primary/70">Deep dives on setup, RAG accuracy, and support automation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link href="/blogs/how-to-train-an-ai-website-chatbot-on-your-docs" className="group">
              <div className="bg-white dark:bg-black/40 h-full p-6 rounded-2xl border-2 border-brand-base-300 group-hover:border-brand-accent/60 transition-all">
                <h3 className="font-semibold text-brand-primary mb-2">Train an AI chatbot on your docs</h3>
                <p className="text-sm text-brand-primary/70">Step‑by‑step: connect sources, chunk content, and ensure accurate answers.</p>
              </div>
            </Link>
            <Link href="/blogs/ai-chatbot-for-website" className="group">
              <div className="bg-white dark:bg-black/40 h-full p-6 rounded-2xl border-2 border-brand-base-300 group-hover:border-brand-accent/60 transition-all">
                <h3 className="font-semibold text-brand-primary mb-2">AI chatbot for your website</h3>
                <p className="text-sm text-brand-primary/70">Benefits, setup, and best practices for 24/7 self‑service.</p>
              </div>
            </Link>
            <Link href="/blogs/customer-support-ai" className="group">
              <div className="bg-white dark:bg-black/40 h-full p-6 rounded-2xl border-2 border-brand-base-300 group-hover:border-brand-accent/60 transition-all">
                <h3 className="font-semibold text-brand-primary mb-2">Customer support AI</h3>
                <p className="text-sm text-brand-primary/70">Reduce ticket volume with AI while keeping human handoff seamless.</p>
              </div>
            </Link>
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
              <h3 className="text-xl font-bold text-brand-primary mb-3">AI search over your docs</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Answers come from your website and documentation using retrieval‑augmented generation. Keep responses accurate, specific, and on‑brand—without manual tagging.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-info/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-info/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">24/7 self‑service</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Give customers instant answers any time of day. Reduce ticket volume by letting users help themselves—with streaming responses that keep conversations engaging.
              </p>
            </div>

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-success/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-success/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 12a5 5 0 1010 0 5 5 0 00-10 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Live handoff when it matters</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Switch to a human in real‑time for complex questions or high‑intent visitors. Share a booking link to schedule calls—no back‑and‑forth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why ChatDock */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-primary">Why ChatDock</h2>
            <p className="mt-3 text-brand-primary/70 max-w-2xl mx-auto">
              Purpose‑built for accurate answers, fast experiences, and seamless handoffs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300">
              <h3 className="font-semibold text-brand-primary mb-2">Accurate by design</h3>
              <p className="text-sm text-brand-primary/70">Retrieval‑augmented generation uses your content to answer—no hallucinated guesses.</p>
            </div>
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300">
              <h3 className="font-semibold text-brand-primary mb-2">Streamed, fast replies</h3>
              <p className="text-sm text-brand-primary/70">Sub‑second time‑to‑first‑token keeps users engaged with natural, flowing responses.</p>
            </div>
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300">
              <h3 className="font-semibold text-brand-primary mb-2">Live agent handoff</h3>
              <p className="text-sm text-brand-primary/70">Escalate to a human instantly for edge cases—no context lost.</p>
            </div>
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300">
              <h3 className="font-semibold text-brand-primary mb-2">Meetings when needed</h3>
              <p className="text-sm text-brand-primary/70">Built‑in booking link lets qualified users schedule time without email back‑and‑forth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-brand-accent/10 via-brand-info/10 to-brand-success/10 rounded-3xl p-12 md:p-16 border-2 border-brand-base-300">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-primary mb-6">
              Help more customers in less time
            </h2>
            <p className="text-brand-primary/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Support and growth teams use ChatDock to deliver instant answers from their content, reduce workload with self‑service, and convert more qualified leads.
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
        id="chatdock-embed"
        src="https://www.chatdock.io/embed.min.js"
        strategy="afterInteractive"
        data-domain-id="75975441-fef0-4fa2-8034-cdd69e1a96ff"
        data-app-origin="https://www.chatdock.io"
        data-margin="24"
        data-size="md"
      />
    </main>
  )
}
