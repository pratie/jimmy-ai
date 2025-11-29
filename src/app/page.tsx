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
import { OpenAIIcon, AnthropicIcon, GoogleIcon } from '@/components/icons/provider-icons'
import Marquee from '@/components/ui/marquee'
import AnimatedAgentType from '@/components/landing/animated-agent-type'

export const metadata: Metadata = {
  title: 'ChatDock AI - Your 24/7 AI Agent for Sales, Support & Lead Gen',
  description:
    'AI agent that handles sales, support, and lead generation automatically. Train it on your content to answer questions, book meetings, and qualify prospects 24/7.',
  alternates: {
    canonical: '/',
  },
}

export default async function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />

      {/* Hero Section - Professional B2B design */}
      <section className="relative overflow-hidden pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Column - Clean typography hierarchy */}
            <div className="space-y-6 md:space-y-8 max-w-2xl lg:max-w-none text-center lg:text-left">
              {/* Main Headline - Professional and clear */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                  <span className="block">
                    Your AI <span className="text-blue-600 dark:text-blue-500"><AnimatedAgentType /></span>,
                  </span>
                  <span className="block">Working 24/7</span>
                </h1>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
                Capture leads, support customers, and close deals—automatically. ChatDock trains on your content to answer questions, book meetings, and qualify prospects 24/7.
              </p>

              {/* CTA and Trust Section */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-6 pt-2">
                <Link href="/auth/sign-up">
                  <Button
                    className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white px-8 py-3 text-base font-medium rounded-lg shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  >
                    Get started →
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

      {/* Social Proof / Stats - Clean and professional */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-2">67%</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium">Higher conversion rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-2">40%</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium">Fewer support tickets</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-2">24/7</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium">Customer support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-2">5min</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium">To go live</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview - Dashboard Screenshot */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              See the dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Manage chatbots, track conversations, train your knowledge base, and tweak
              advanced AI settings all in one place.
            </p>
          </div>
          <div className="max-w-6xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
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

      {/* Works with your site + docs */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Works with your site + docs
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Bring your content in minutes. No complex setup.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col items-start gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-xl">🌐</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Website crawl</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Convert your site into clean, structured knowledge automatically.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col items-start gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-xl">📄</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">PDFs & docs</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Upload PDFs or paste text to enrich your knowledge base.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col items-start gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-xl">❓</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">FAQs</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Capture common questions/answers to guide fast resolutions.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col items-start gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚙️</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Guardrails</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">On‑brand tone, strict FAQ mode, and live handoff when needed.</p>
            </div>
          </div>
        </div>
      </section>







      {/* Features Grid - Professional B2B design */}
      <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-transparent via-slate-50 dark:via-slate-900/30 to-transparent">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Sales, support, and lead generation—in one AI agent
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-3xl mx-auto">
              Capture more leads, close more deals, and deliver instant support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature Cards */}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Answer product questions instantly</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your AI knows every product detail, shipping policy, and return procedure. Gives accurate answers in seconds, like your best salesperson, but available 24/7.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Book consultations automatically</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Great for support and success teams. Qualify visitors, share a booking link, and notify your team for high‑intent conversations without back‑and‑forth scheduling.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Seamless human handoff</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                AI handles 80% of questions automatically. For complex issues, it notifies your team and hands off with full context without repeated questions for customers.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Track every sale & lead</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                See which conversations turned into sales, what questions customers ask most, and where to optimize. All conversations saved and searchable.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Scale across multiple brands</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Scale across multiple sites or brands. Manage assistants in one dashboard - each grounded in the right docs and policies.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI search over your docs</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Answers come from your website and documentation using retrieval‑augmented generation. Keep responses accurate, specific, and on‑brand without manual tagging.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">24/7 self‑service</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Give customers instant answers any time of day. Reduce ticket volume by letting users help themselves with streaming responses that keep conversations engaging.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 12a5 5 0 1010 0 5 5 0 00-10 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Live handoff when it matters</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Switch to a human in real‑time for complex questions or high‑intent visitors. Share a booking link to schedule calls without back‑and‑forth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why ChatDock AI - Clean design */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Why ChatDock AI
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Purpose‑built for accurate answers, fast experiences, and seamless handoffs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Accurate by design</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Retrieval‑augmented generation uses your content to answer without hallucinated guesses.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Streamed, fast replies</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sub‑second time‑to‑first‑token keeps users engaged with natural, flowing responses.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Live agent handoff</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Escalate to a human instantly for edge cases without losing context.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Meetings when needed</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Built‑in booking link lets qualified users schedule time without email back‑and‑forth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA - Clean and professional */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center bg-white dark:bg-slate-900 rounded-2xl p-12 md:p-16 border border-slate-200 dark:border-slate-800">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Convert more leads. Support more customers.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg mb-8 max-w-2xl mx-auto">
              Sales and support teams use ChatDock AI to qualify prospects, answer questions instantly, and book more meetings—all while reducing manual workload.
            </p>
            <Link href="/auth/sign-up">
              <Button
                className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white px-8 py-3 text-base font-medium rounded-lg shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                Get started free →
              </Button>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-6">
              Free forever plan • Live in 5 minutes • No credit card needed
            </p>
          </div>
        </div>
      </section>

      {/* Learn more (Blog CTAs) */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Learn more
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Deep dives on setup, RAG accuracy, and support automation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/blogs/how-to-train-an-ai-website-chatbot-on-your-docs" className="group">
              <div className="bg-white dark:bg-slate-900 h-full p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Train an AI chatbot on your docs
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Step‑by‑step: connect sources, chunk content, and ensure accurate answers.
                </p>
              </div>
            </Link>
            <Link href="/blogs/ai-chatbot-for-website" className="group">
              <div className="bg-white dark:bg-slate-900 h-full p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  AI chatbot for your website
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Benefits, setup, and best practices for 24/7 self‑service.
                </p>
              </div>
            </Link>
            <Link href="/blogs/customer-support-ai" className="group">
              <div className="bg-white dark:bg-slate-900 h-full p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Customer support AI
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Reduce ticket volume with AI while keeping human handoff seamless.
                </p>
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
