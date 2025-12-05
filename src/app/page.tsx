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
import { Check, ChevronRight, Shield, Zap, Clock, Users, BarChart3, Globe, MessageSquare, ArrowRight } from 'lucide-react'
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
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-slate-200 selection:text-slate-900">
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <NavBar />

      {/* Hero Section - Centered Minimalist 'Google Antigravity' Style */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white dark:bg-slate-950">
        {/* Subtle Particle/Confetti Background (Monochrome) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Custom SVG Particles for 'Antigravity' feel */}
          <svg className="absolute w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="particles" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" className="fill-slate-400" opacity="0.4" />
                <circle cx="60" cy="40" r="1" className="fill-slate-500" opacity="0.3" />
                <circle cx="30" cy="70" r="1.5" className="fill-slate-300" opacity="0.4" />
                <circle cx="90" cy="20" r="1" className="fill-slate-400" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#particles)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          {/* Logo/Badge Centered */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-transparent text-sm font-medium text-slate-600 dark:text-slate-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600 dark:bg-slate-400"></span>
              </span>
              ChatDock AI
            </div>
          </div>

          {/* Main Headline - Centered, Massive, Bold */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1]">
            Experience automated<br />
            <span className="text-slate-900 dark:text-white">customer success</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-normal">
            Stop losing leads while you sleep. We train, customize, and deploy a smart AI agent for your business. 100% Done-For-You.
          </p>

          {/* Buttons - Centered Pill Style */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:rishi@chatdock.io">
              <Button
                className="h-14 px-8 bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-lg font-medium rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Your Free Demo
              </Button>
            </a>
            <a href="#features">
              <Button
                variant="outline"
                className="h-14 px-8 bg-slate-100 text-slate-900 border-none hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 text-lg font-medium rounded-full transition-all"
              >
                Explore use cases
              </Button>
            </a>
          </div>

          {/* Chat Demo - Floating Below (Optional, usually reference doesn't have it immediately, but good for context) */}
          <div className="mt-20 relative w-full max-w-[500px] mx-auto lg:mx-0 lg:ml-auto perspective-1000">
            <div className="relative transform transition-transform hover:scale-[1.02] duration-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-gray-200 dark:from-slate-800 dark:to-gray-800 rounded-2xl blur opacity-20 animate-pulse"></div>
              <div className="relative bg-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <AnimatedChatHero density="cozy" title="ChatDock AI Assistant" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 border-b border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Trusted by growing teams worldwide
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Placeholder logos - replace with actual customer logos */}
            {['TechCorp', 'StartupXYZ', 'AgencyPro', 'SaaS Inc', 'Digital Co'].map((company) => (
              <div key={company} className="text-xl font-bold text-slate-400 dark:text-slate-500">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Minimalist / Monochrome */}
      <section className="py-20 border-b border-slate-100 dark:border-white/5">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              { label: 'Higher conversion', value: '67%' },
              { label: 'Fewer tickets', value: '40%' },
              { label: 'Customer support', value: '24/7' },
              { label: 'To go live', value: '5min' },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className="text-5xl md:text-6xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview - Dashboard Screenshot */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              See the dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Manage chatbots, track conversations, train your knowledge base, and tweak
              advanced AI settings all in one place.
            </p>
          </div>
          <div className="max-w-6xl mx-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Works with your site + docs
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
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
              <div key={i} className="glass-card-light dark:glass-card p-6 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              We handle the tech,<span className="text-slate-500"> you get the results</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xl max-w-3xl mx-auto">
              Our experts build, train, and manage your AI agent so you don&apos;t have to lift a finger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Feature Cards - Minimalist */}
            {[
              { title: 'Trained on Your Data', desc: 'We curate your knowledge base from your website and docs. Accurate, on-brand responses.', icon: Shield },
              { title: 'Deflect 80% of Tickets', desc: 'Answer repetitive questions instantly. Zero wait time for customers.', icon: MessageSquare },
              { title: 'Qualify & Book Meetings', desc: 'Capture emails, qualify prospects, and schedule demos automatically.', icon: Users },
              { title: 'Monthly Optimization', desc: 'We review your chat logs and tweak the AI for better results.', icon: Zap },
              { title: '24/7 Availability', desc: 'Give customers instant answers at 2 AM. Always on, always ready.', icon: Clock },
              { title: 'Human Handoff', desc: 'Get notified in real-time for complex issues. Jump in when needed.', icon: ArrowRight },
              { title: 'Real-Time Analytics', desc: 'See which questions are asked most and where you lose customers.', icon: BarChart3 },
              { title: 'Multi-Channel Ready', desc: 'Deploy on your website, apps, WhatsApp and more.', icon: Globe }
            ].map((feature, i) => (
              <div key={i} className="group relative p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl hover:border-slate-400 dark:hover:border-white/30 transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-5 text-slate-900 dark:text-white group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
                  <feature.icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Why ChatDock AI
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
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
              <div key={i} className="glass-card-light dark:glass-card p-6 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA - Minimalist */}
      <section className="py-32 relative overflow-hidden bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center border border-slate-200 dark:border-white/10 rounded-2xl p-12 md:p-20 bg-slate-50/50 dark:bg-white/[0.02]">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">
              Stop Answering the<br />Same Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Let AI handle the routine. You focus on growing your business.
            </p>
            <a href="mailto:rishi@chatdock.io">
              <Button
                className="h-14 px-12 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-lg font-medium rounded-full shadow-sm hover:shadow-md transition-all"
              >
                Get Your Free Demo <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <p className="text-slate-500 text-sm mt-8 font-medium">
              ✓ Expert setup included • ✓ Results in 24 hours • ✓ No risk
            </p>
            <div className="mt-8 flex justify-center opacity-80 hover:opacity-100 transition-opacity">
              <a href="https://yourwebsitescore.com/certified-websites/chatdock.io" target="_blank" rel="noopener">
                <img src="https://yourwebsitescore.com/api/badge/chatdock.io" alt="" style={{ height: '54px', width: 'auto' }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Learn more (Blog CTAs) */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              Learn more
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
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
                <div className="glass-card-light dark:glass-card h-full p-8 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {[...Array(5)].map((_, starIndex) => (
                      <svg key={starIndex} className={`w-3 h-3 inline-block mr-0.5 ${starIndex < 5 ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    {blog.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
      {/* Leadsy Pixel - Landing Page Only */}
      <Script
        id="vtag-ai-js"
        async
        src="https://r2.leadsy.ai/tag.js"
        data-pid="19yiPsmzWcmPcmZmm"
        data-version="062024"
        strategy="afterInteractive"
      />
    </main>
  )
}
