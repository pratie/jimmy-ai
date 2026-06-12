import type { Metadata } from 'next'
import NavBar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PricingSection from '@/components/landing/pricing-section'
import Script from 'next/script'
import HowItWorks from '@/components/landing/how-it-works'
import { Check, ChevronRight, Shield, Zap, Clock, Users, BarChart3, Globe, MessageSquare, ArrowRight, Sparkles, DollarSign, Calendar } from 'lucide-react'
import { Footer } from '@/components/landing/footer'
import InteractivePreviewChat from '@/components/landing/interactive-preview-chat'

export const metadata: Metadata = {
  title: 'ChatDock AI - White-Label Transactional Chatbot Reseller Platform for AI Agencies',
  description:
    'Build, brand, and resell custom RAG chatbots that natively book meetings and close sales. Give your clients a fully white-labeled dashboard under your own domain.',
  alternates: {
    canonical: '/',
  },
}

import { FadeIn } from '@/components/ui/fade-in'
import { SpotlightCard } from '@/components/ui/spotlight-card'

export default async function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative overflow-x-hidden font-sans antialiased">
      {/* 100x Premium Ambient Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-white/[0.02] dark:bg-grid-white/[0.05] bg-[size:40px_40px] opacity-100" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] max-w-7xl h-[800px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px] animate-gradient" />
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-gradient" style={{ animationDelay: '2s' }} />
      </div>

      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 md:pt-60 md:pb-32 overflow-hidden flex flex-col items-center justify-center">
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          
          <FadeIn delay={0.1} direction="up">
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-card/40 backdrop-blur-xl border border-border shadow-soft hover:shadow-glow-primary transition-all duration-500 text-xs font-bold tracking-widest uppercase text-primary cursor-default group">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                ChatDock Reseller Platform
                <span className="text-muted-foreground ml-1 group-hover:text-foreground transition-colors duration-300">v2.0</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <h1 className="text-5xl sm:text-7xl md:text-[6.5rem] font-black tracking-tighter text-foreground mb-8 leading-[1.05] relative z-10">
              The Ultimate AI Chatbot<br />
              <span className="text-gradient-primary">Reseller Platform.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.3} direction="up">
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
              Build, brand, and resell highly custom RAG chatbots that natively book meetings and close sales. 
              <br className="hidden md:block"/> No code required. 100% white-label.
            </p>
          </FadeIn>

          <FadeIn delay={0.4} direction="up">
            <div className="flex justify-center gap-6 mb-20 flex-col sm:flex-row">
              <Link href="/auth/sign-up">
                <Button className="h-16 px-10 bg-foreground text-background hover:bg-foreground/90 text-lg font-bold rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-[1.02]">
                  Start Reselling Free <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" className="h-16 px-10 bg-card/30 backdrop-blur-xl border-border hover:bg-card/60 text-lg font-bold rounded-full transition-all duration-300">
                  View Features
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Works With Integration Bar */}
          <FadeIn delay={0.5} direction="up">
            <div className="flex justify-center mb-24">
              <div className="inline-flex flex-wrap items-center justify-center gap-5 px-8 py-4 rounded-[2rem] bg-card/20 backdrop-blur-3xl border border-white/5 shadow-large text-xs max-w-4xl z-20">
                <span className="font-bold text-muted-foreground uppercase tracking-wider mr-4 text-[11px]">Powered By</span>
                {[
                  { name: 'ChatGPT 4o', icon: '⚡' },
                  { name: 'Claude 3.5', icon: '🧠' },
                  { name: 'Gemini Flash', icon: '✦' },
                  { name: 'PgVector', icon: '💾' }
                ].map((item) => (
                  <span key={item.name} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-foreground hover:bg-white/10 hover:border-white/20 transition-colors cursor-default shadow-sm">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Spotlight Scraper Sandbox */}
          <FadeIn delay={0.6} direction="up">
            <div className="max-w-3xl mx-auto relative group perspective-1000">
              <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-[30px] opacity-40 group-hover:opacity-70 group-hover:blur-[40px] transition duration-700"></div>
              <div className="relative transform-gpu group-hover:rotate-x-[1deg] group-hover:scale-[1.01] transition-all duration-700 ease-out">
                <div className="rounded-t-2xl bg-[#1c1c1e] border border-b-0 border-white/10 p-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  <div className="ml-auto flex bg-[#2c2c2e] px-3 py-1 rounded-md border border-white/5 text-[10px] text-gray-400 font-mono items-center gap-2">
                    <Shield className="w-3 h-3" /> https://your-agency.com/chat
                  </div>
                </div>
                <InteractivePreviewChat />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-border relative bg-card/20 backdrop-blur-lg">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 max-w-6xl mx-auto">
            {[
              { label: 'Avg Booking Increase', value: '+67%' },
              { label: 'Auto-Resolved Tickets', value: '80%' },
              { label: 'SaaS Gross Margin', value: '98%' },
              { label: 'Client Set-Up Time', value: '< 5m' },
            ].map((stat, i) => (
              <FadeIn key={i} delay={0.1 * i} direction="up">
                <div className="text-center group cursor-default">
                  <div className="text-5xl md:text-7xl font-black mb-4 text-foreground tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground group-hover:from-primary group-hover:to-blue-500 transition-all duration-500">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-[11px] font-black uppercase tracking-widest">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Features Grid - Reseller and B2B Agency Focused */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <FadeIn delay={0.2}>
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-primary mb-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                The Reseller Engine
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-[4rem] font-black text-foreground mb-8 tracking-tighter leading-[1.1]">
                Engineered for <span className="text-gradient-primary">high-margin SaaS.</span>
              </h2>
              <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
                Everything you need to deliver, brand, and scale client chatbots under your own company label. No hidden fees.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
            {[
              { title: '100% White-Label Branding', desc: 'Custom logos, tailored color schemes, and custom domains map directly to your brand.', icon: Globe },
              { title: 'Conversational Commerce', desc: 'Natively showcase products and take checkouts directly inside the chatbot window.', icon: DollarSign },
              { title: 'Appointment Booking', desc: 'Integrated slot scheduling allows leads to book meetings without email back-and-forths.', icon: Calendar },
              { title: 'Embed Attribution Toggle', desc: 'Remove all branding footers or white-label them as "Powered by [Your Agency]".', icon: Shield },
              { title: 'Real-Time Human Handoff', desc: 'Let your clients take control of hot chats in real-time when leads require human answers.', icon: Sparkles },
              { title: 'Multi-Tenant Client Portals', desc: 'Invite clients to their own branded dashboard to check booking logs and conversations.', icon: Users },
              { title: 'Conversational Statistics', desc: 'Review daily chats, track qualified leads, and prove concrete ROI to your clients.', icon: BarChart3 },
              { title: 'Sub-Second Streaming', desc: 'Powered by PgVector and Gemini 2.5 Flash Lite for ultra-fast, natural streaming replies.', icon: Zap }
            ].map((feature, i) => (
              <FadeIn key={i} delay={0.1 * (i % 4)} direction="up">
                <SpotlightCard className="h-full p-8 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary shadow-[0_0_15px_rgba(0,113,227,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,113,227,0.4)] transition-all duration-500">
                    <feature.icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </SpotlightCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div className="relative z-10">
        <PricingSection />
      </div>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <FadeIn direction="up">
            <SpotlightCard spotlightColor="rgba(0, 113, 227, 0.15)" className="max-w-5xl mx-auto text-center border-border/50 p-16 md:p-24 shadow-2xl relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

              <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-foreground mb-8 tracking-tighter leading-tight relative z-10">
                Launch Your White-Label<br />Agency Today.
              </h2>
              <p className="text-muted-foreground text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed relative z-10">
                Start reselling custom transactional AI chatbots to your local clients and unlock high-margin recurring MRR.
              </p>
              <div className="relative z-10">
                <Link href="/auth/sign-up">
                  <Button className="h-16 px-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold rounded-full shadow-glow-primary transition-all duration-300 hover:scale-105">
                    Create Reseller Account <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </Link>
                <p className="text-muted-foreground text-sm mt-8 font-bold tracking-wide uppercase">
                  No credit card required • 100 free monthly credits
                </p>
              </div>
            </SpotlightCard>
          </FadeIn>
        </div>
      </section>

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
