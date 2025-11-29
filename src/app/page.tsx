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
import { Check, ChevronRight } from 'lucide-react'
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
    <main className="min-h-screen dark bg-background text-foreground selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <NavBar />

      {/* Hero Section - Linear Style */}
      <section className="relative pt-24 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="glow-effect top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Column */}
            <div className="space-y-8 max-w-2xl lg:max-w-none text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-medium text-slate-300 mx-auto lg:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                New: Multi-Agent Support
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                  <span className="block text-gradient">
                    Your AI <AnimatedAgentType />,
                  </span>
                  <span className="block text-white">Working 24/7</span>
                </h1>
              </div>

              <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed mx-auto lg:mx-0">
                Capture leads, support customers, and close deals—automatically. ChatDock trains on your content to answer questions, book meetings, and qualify prospects 24/7.
              </p>

              {/* CTA and Trust Section */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-6 pt-4">
                <Link href="/auth/sign-up">
                  <Button
                    className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-200 text-base font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                  >
                    Build Your Free Agent <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <div className="flex flex-col gap-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500" />
                    <span>5-minute setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4 text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider opacity-60">Powered by</span>
                <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="flex items-center gap-2">
                    <OpenAIIcon size={16} />
                    <span className="text-xs font-medium">OpenAI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AnthropicIcon size={16} />
                    <span className="text-xs font-medium">Anthropic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GoogleIcon size={16} />
                    <span className="text-xs font-medium">Gemini</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Animated Chat Demo */}
            <div className="relative w-full max-w-[500px] mx-auto lg:mx-0 lg:ml-auto perspective-1000">
              <div className="relative transform transition-transform hover:scale-[1.02] duration-500">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 animate-pulse"></div>
                <div className="relative bg-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <AnimatedChatHero density="cozy" title="ChatDock AI Assistant" />
                </div>

                {/* Floating Dashboard Elements */}
                <div className="hidden lg:block absolute -right-12 top-20 space-y-4">
                  <div className="glass-card p-4 rounded-xl w-48 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-slate-400">Customer Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white">4.9</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < 5 ? 'text-yellow-400' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
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

      {/* Stats Section - Minimalist */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-6xl mx-auto">
            {[
              { label: 'Higher conversion', value: '67%' },
              { label: 'Fewer tickets', value: '40%' },
              { label: 'Customer support', value: '24/7' },
              { label: 'To go live', value: '5min' },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview - Dashboard Screenshot */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              See the dashboard
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Manage chatbots, track conversations, train your knowledge base, and tweak
              advanced AI settings all in one place.
            </p>
          </div>
          <div className="max-w-6xl mx-auto rounded-xl border border-white/10 bg-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
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
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Works with your site + docs
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Bring your content in minutes. No complex setup.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🌐', title: 'Instant Website Training', desc: 'Convert your site into clean, structured knowledge automatically.' },
              { icon: '📄', title: 'Upload Any Document', desc: 'Upload PDFs or paste text to enrich your knowledge base.' },
              { icon: '❓', title: 'FAQs', desc: 'Capture common questions/answers to guide fast resolutions.' },
              { icon: '⚙️', title: 'Guardrails', desc: 'On‑brand tone, strict FAQ mode, and live handoff when needed.' }
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 rounded-xl hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Linear Style */}
      <section id="features" className="py-32 relative">
        <div className="glow-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]" />
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Sales, support, and lead generation—<span className="text-slate-500">in one AI agent</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto">
              Capture more leads, close more deals, and deliver instant support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature Cards */}
            {[
              { title: 'Instant Answers, Zero Wait Time', desc: 'Your AI knows every product detail, shipping policy, and return procedure. Gives accurate answers in seconds, like your best salesperson, but available 24/7.' },
              { title: 'Book consultations automatically', desc: 'Great for support and success teams. Qualify visitors, share a booking link, and notify your team for high‑intent conversations without back‑and‑forth scheduling.' },
              { title: 'Human Handoff When It Matters', desc: 'AI handles 80% of questions automatically. For complex issues, it notifies your team and hands off with full context without repeated questions for customers.' },
              { title: 'Track every sale & lead', desc: 'See which conversations turned into sales, what questions customers ask most, and where to optimize. All conversations saved and searchable.' },
              { title: 'Scale across multiple brands', desc: 'Scale across multiple sites or brands. Manage assistants in one dashboard - each grounded in the right docs and policies.' },
              { title: 'AI search over your docs', desc: 'Answers come from your website and documentation using retrieval‑augmented generation. Keep responses accurate, specific, and on‑brand without manual tagging.' },
              { title: '24/7 self‑service', desc: 'Give customers instant answers any time of day. Reduce ticket volume by letting users help themselves with streaming responses that keep conversations engaging.' },
              { title: 'Live handoff when it matters', desc: 'Switch to a human in real‑time for complex questions or high‑intent visitors. Share a booking link to schedule calls without back‑and‑forth.' }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-xl hover:border-white/20 transition-all duration-300 group">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ChatDock AI - Clean design */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Why ChatDock AI
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Purpose‑built for accurate answers, fast experiences, and seamless handoffs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Accurate by design', desc: 'Retrieval‑augmented generation uses your content to answer without hallucinated guesses.' },
              { title: 'Streamed, fast replies', desc: 'Sub‑second time‑to‑first‑token keeps users engaged with natural, flowing responses.' },
              { title: 'Live agent handoff', desc: 'Escalate to a human instantly for edge cases without losing context.' },
              { title: 'Meetings when needed', desc: 'Built‑in booking link lets qualified users schedule time without email back‑and‑forth.' }
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 rounded-xl">
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA - Clean and professional */}
      <section className="py-32 relative overflow-hidden">
        <div className="glow-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20" />
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center glass-card rounded-3xl p-12 md:p-20 border border-white/10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">
              Stop Answering the Same Questions
            </h2>
            <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Sales and support teams use ChatDock AI to qualify prospects, answer questions instantly, and book more meetings—all while reducing manual workload.
            </p>
            <Link href="/auth/sign-up">
              <Button
                className="h-14 px-10 bg-white text-slate-900 hover:bg-slate-200 text-lg font-semibold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all"
              >
                Build Your Free Agent →
              </Button>
            </Link>
            <p className="text-slate-500 text-sm mt-8 font-medium">
              Free forever plan • Live in 5 minutes • No credit card needed
            </p>
            <div className="mt-8 flex justify-center">
              <a href="https://yourwebsitescore.com/certified-websites/chatdock.io" target="_blank" rel="noopener">
                <img src="https://yourwebsitescore.com/api/badge/chatdock.io" alt="" style={{ height: '54px', width: 'auto' }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Learn more (Blog CTAs) */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              Learn more
            </h2>
            <p className="text-base text-slate-400">
              Deep dives on setup, RAG accuracy, and support automation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { href: '/blogs/how-to-train-an-ai-website-chatbot-on-your-docs', title: 'Train an AI chatbot on your docs', desc: 'Step‑by‑step: connect sources, chunk content, and ensure accurate answers.' },
              { href: '/blogs/ai-chatbot-for-website', title: 'AI chatbot for your website', desc: 'Benefits, setup, and best practices for 24/7 self‑service.' },
              { href: '/blogs/customer-support-ai', title: 'Customer support AI', desc: 'Reduce ticket volume with AI while keeping human handoff seamless.' }
            ].map((blog, i) => (
              <Link key={i} href={blog.href} className="group">
                <div className="glass-card h-full p-8 rounded-xl hover:bg-white/10 transition-colors">
                  <h3 className="font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {blog.desc}
                  </p>
                </div>
              </Link>
            ))}
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
