import type { Metadata } from 'next'
import NavBar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import DashboardImg from '../../public/images/Dashboard.png'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import Link from 'next/link'
import PricingSection from '@/components/landing/pricing-section'
import Script from 'next/script'
import HowItWorks from '@/components/landing/how-it-works'
import { Check } from 'lucide-react'
import { Footer } from '@/components/landing/footer'
import AnimatedChatHero from '@/components/landing/animated-chat-hero'
import { Bebas_Neue } from 'next/font/google'
import { OpenAIIcon, AnthropicIcon, GoogleIcon } from '@/components/icons/provider-icons'
import Marquee from '@/components/ui/marquee'

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' })

export const metadata: Metadata = {
  title: 'ChatDock AI - Your 24/7 AI Sales Agent',
  description:
    'Turn visitors into leads with a 24/7 AI sales agent. Train it on your website and docs to answer questions and book meetings automatically.',
  alternates: {
    canonical: '/',
  },
}

export default async function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />

      {/* Hero Section - Improved spacing and typography */}
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Column - Enhanced text hierarchy */}
            <div className="space-y-8 md:space-y-10 max-w-2xl lg:max-w-none text-center lg:text-left">
              {/* Main Headline - Larger, more impactful */}
              <div className="space-y-6">
                <h1 className={`${bebas.className} text-4xl sm:text-6xl md:text-7xl lg:text-[72px] font-normal text-gray-900 dark:text-white leading-[1.05] tracking-normal`}>
                  <span className="block">
                    Your <span className="text-main">AI Sales Agent</span>,
                  </span>
                  <span className="block">Working 24/7</span>
                </h1>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl max-w-xl leading-[1.8]">
                Turn every visitor into a lead. ChatDock trains on your website and docs to answer questions, capture emails, and book meetings - even while you sleep.
              </p>

              {/* CTA and Trust Section - Better visual weight */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-8 pt-4">
                <Link href="/auth/sign-up">
                  <Button
                    size="lg"
                    className="bg-main hover:bg-mainAccent text-white font-semibold px-10 py-5 text-lg rounded-2xl shadow-shadow hover:shadow-light transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mainAccent"
                  >
                    Build Your Agent →
                  </Button>
                </Link>
                <div className="flex flex-col gap-3 text-base text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-main/15 text-main flex items-center justify-center">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    <span>5-minute setup</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-main/15 text-main flex items-center justify-center">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-col sm:flex-row items-center gap-3 text-gray-500 dark:text-gray-400">
                <span className="text-sm whitespace-nowrap">Powered by</span>
                <div className="relative flex w-full max-w-[300px] items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                  <Marquee pauseOnHover className="[--duration:20s] [--gap:2rem]">
                    <div className="flex items-center gap-2">
                      <OpenAIIcon size={18} className="text-gray-700 dark:text-gray-300" />
                      <span className="text-sm">OpenAI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AnthropicIcon size={18} className="text-gray-700 dark:text-gray-300" />
                      <span className="text-sm">Anthropic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GoogleIcon size={18} className="text-gray-700 dark:text-gray-300" />
                      <span className="text-sm">Google Gemini</span>
                    </div>
                  </Marquee>
                </div>
              </div>
            </div>

            {/* Right Column - Animated Chat Demo */}
            <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto">
              <div className="relative">
                <AnimatedChatHero density="cozy" title="ChatDock AI Assistant" />

                {/* Floating Dashboard Elements */}
                <div className="hidden lg:block absolute -right-16 top-10 space-y-4">
                  {/* Rating Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 w-48 transform -translate-y-12">
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

      {/* Social Proof / Stats - Enhanced visual impact */}
      <section className="py-28 md:py-36 bg-gradient-to-b from-brand-base-100/50 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-extrabold text-brand-primary mb-3 tracking-tighter">67%</div>
              <div className="text-brand-primary/70 text-base md:text-lg font-medium">Higher conversion rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-extrabold text-brand-primary mb-3 tracking-tighter">40%</div>
              <div className="text-brand-primary/70 text-base md:text-lg font-medium">Fewer support tickets</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-extrabold text-brand-primary mb-3 tracking-tighter">24/7</div>
              <div className="text-brand-primary/70 text-base md:text-lg font-medium">Customer support</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-extrabold text-brand-primary mb-3 tracking-tighter">5min</div>
              <div className="text-brand-primary/70 text-base md:text-lg font-medium">To go live</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview - Dashboard Screenshot */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-primary mb-4">
              See the dashboard
            </h2>
            <p className="text-brand-primary/70 text-lg max-w-2xl mx-auto">
              Manage chatbots, track conversations, train your knowledge base, and tweak
              advanced AI settings all in one place.
            </p>
          </div>
          <div className="max-w-5xl mx-auto rounded-3xl border border-border bg-white dark:bg-gray-900 shadow-shadow overflow-hidden">
            <AspectRatio ratio={16 / 9}>
              <Image
                src={DashboardImg}
                alt="ChatDock dashboard screenshot"
                fill
                className="object-contain"
                priority={false}
                sizes="(min-width: 1280px) 1024px, (min-width: 768px) 80vw, 100vw"
              />
            </AspectRatio>
          </div>
        </div>
      </section>

      {/* How It Works - Interactive Flow */}
      <HowItWorks />

      {/* Works with your site + docs - Enhanced spacing */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-primary mb-6">Works with your site + docs</h2>
            <p className="text-lg sm:text-xl text-brand-primary/70 max-w-2xl mx-auto">
              Bring your content in minutes. No complex setup.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-main hover:shadow-lg transition-all flex flex-col items-start gap-3">
              <div className="w-10 h-10 bg-main/20 rounded-lg border border-main flex items-center justify-center">
                <span className="text-xl">🌐</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Website crawl</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Convert your site into clean, structured knowledge automatically.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-main hover:shadow-lg transition-all flex flex-col items-start gap-3">
              <div className="w-10 h-10 bg-main/20 rounded-lg border border-main flex items-center justify-center">
                <span className="text-xl">📄</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">PDFs & docs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload PDFs or paste text to enrich your knowledge base.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-main hover:shadow-lg transition-all flex flex-col items-start gap-3">
              <div className="w-10 h-10 bg-main/20 rounded-lg border border-main flex items-center justify-center">
                <span className="text-xl">❓</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">FAQs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Capture common questions/answers to guide fast resolutions.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-main hover:shadow-lg transition-all flex flex-col items-start gap-3">
              <div className="w-10 h-10 bg-main/20 rounded-lg border border-main flex items-center justify-center">
                <span className="text-xl">⚙️</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Guardrails</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">On‑brand tone, strict FAQ mode, and live handoff when needed.</p>
            </div>
          </div>
        </div>
      </section>







      {/* Features Grid - Enhanced visual hierarchy */}
      <section id="features" className="py-32 md:py-40 bg-gradient-to-b from-transparent via-brand-base-100/30 to-transparent">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-primary mb-8 tracking-tight">
              Built for growing businesses
            </h2>
            <p className="text-brand-primary/70 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Everything you need to sell more, support better, and scale faster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 max-w-6xl mx-auto">
            {/* Feature Cards */}

            <div className="bg-white dark:bg-black/40 p-8 rounded-3xl border-2 border-brand-base-300 hover:border-brand-info/60 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-brand-info/20 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Answer product questions instantly</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Your AI knows every product detail, shipping policy, and return procedure. Gives accurate answers in seconds, like your best salesperson, but available 24/7.
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
                Great for support and success teams. Qualify visitors, share a booking link, and notify your team for high‑intent conversations without back‑and‑forth scheduling.
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
                AI handles 80% of questions automatically. For complex issues, it notifies your team and hands off with full context without repeated questions for customers.
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
              <h3 className="text-xl font-bold text-brand-primary mb-3">Scale across multiple brands</h3>
              <p className="text-brand-primary/70 leading-relaxed">
                Scale across multiple sites or brands. Manage assistants in one dashboard - each grounded in the right docs and policies.
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
                Answers come from your website and documentation using retrieval‑augmented generation. Keep responses accurate, specific, and on‑brand without manual tagging.
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
                Give customers instant answers any time of day. Reduce ticket volume by letting users help themselves with streaming responses that keep conversations engaging.
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
                Switch to a human in real‑time for complex questions or high‑intent visitors. Share a booking link to schedule calls without back‑and‑forth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why ChatDock AI - Better spacing and hierarchy */}
      <section className="py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-primary mb-6">Why ChatDock AI</h2>
            <p className="text-lg sm:text-xl text-brand-primary/70 max-w-2xl mx-auto">
              Purpose‑built for accurate answers, fast experiences, and seamless handoffs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300">
              <h3 className="font-semibold text-brand-primary mb-2">Accurate by design</h3>
              <p className="text-sm text-brand-primary/70">Retrieval‑augmented generation uses your content to answer without hallucinated guesses.</p>
            </div>
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300">
              <h3 className="font-semibold text-brand-primary mb-2">Streamed, fast replies</h3>
              <p className="text-sm text-brand-primary/70">Sub‑second time‑to‑first‑token keeps users engaged with natural, flowing responses.</p>
            </div>
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300">
              <h3 className="font-semibold text-brand-primary mb-2">Live agent handoff</h3>
              <p className="text-sm text-brand-primary/70">Escalate to a human instantly for edge cases without losing context.</p>
            </div>
            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border-2 border-brand-base-300">
              <h3 className="font-semibold text-brand-primary mb-2">Meetings when needed</h3>
              <p className="text-sm text-brand-primary/70">Built‑in booking link lets qualified users schedule time without email back‑and‑forth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA - Enhanced with better spacing */}
      <section className="py-20 md:py-40">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center bg-white/90 dark:bg-gray-900 rounded-3xl p-12 md:p-20 border border-border shadow-shadow">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-primary mb-8 leading-tight">
              Help more customers in less time
            </h2>
            <p className="text-brand-primary/70 text-lg md:text-xl lg:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Support and growth teams use ChatDock AI to deliver instant answers from their content, reduce workload with self‑service, and convert more qualified leads.
            </p>
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-main hover:bg-mainAccent text-white font-semibold px-12 py-6 text-lg md:text-xl rounded-2xl shadow-shadow hover:shadow-light transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mainAccent"
              >
                Get started free →
              </Button>
            </Link>
            <p className="text-brand-primary/60 text-base mt-8">
              Free forever plan • Live in 5 minutes • No credit card needed
            </p>
          </div>
        </div>
      </section>

      {/* Learn more (Blog CTAs) - Better spacing */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-primary mb-4">Learn more</h2>
            <p className="text-lg text-brand-primary/70">Deep dives on setup, RAG accuracy, and support automation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link href="/blogs/how-to-train-an-ai-website-chatbot-on-your-docs" className="group">
              <div className="bg-white dark:bg-gray-900 h-full p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-main hover:shadow-lg transition-all">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-main transition-colors">Train an AI chatbot on your docs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Step‑by‑step: connect sources, chunk content, and ensure accurate answers.</p>
              </div>
            </Link>
            <Link href="/blogs/ai-chatbot-for-website" className="group">
              <div className="bg-white dark:bg-gray-900 h-full p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-main hover:shadow-lg transition-all">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-main transition-colors">AI chatbot for your website</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Benefits, setup, and best practices for 24/7 self‑service.</p>
              </div>
            </Link>
            <Link href="/blogs/customer-support-ai" className="group">
              <div className="bg-white dark:bg-gray-900 h-full p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-main hover:shadow-lg transition-all">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-main transition-colors">Customer support AI</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reduce ticket volume with AI while keeping human handoff seamless.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Chatbot Embed - Landing page only */}
      <Script
        id="46316941-5e6b-4222-adc4-48fc5221012c"
        src="https://www.chatdock.io/embed.min.js"
        strategy="afterInteractive"
        data-app-origin="https://www.chatdock.io"
        data-margin="24"
        data-size="md"
      />
    </main>
  )
}
