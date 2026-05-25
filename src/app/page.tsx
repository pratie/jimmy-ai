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

export default async function Home() {
  return (
    <main className="dark min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative overflow-x-hidden font-sans antialiased">
      {/* Faint Premium Grid Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-white/[0.005] bg-[size:60px_60px]" />

      {/* Restrained Premium Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-25%] left-[25%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-52 md:pb-32 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">

          {/* Glowing Minimalist Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Agency Reseller Platform
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-foreground mb-6 leading-[1.03]">
            The White-Label Transactional<br />
            <span className="bg-gradient-to-b from-foreground via-foreground/70 to-muted-foreground bg-clip-text text-transparent">AI Chatbot Platform.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed font-normal">
            Build, brand, and resell custom RAG chatbots that natively book meetings and close sales. Give your clients a fully white-labeled customer portal under your own custom domain. No code required.
          </p>

          {/* Spotlight Scraper Sandbox */}
          <div className="max-w-2xl mx-auto relative group">
            {/* Elegant deep blue focus shadow */}
            <div className="absolute -inset-1.5 bg-primary/5 rounded-[2.2rem] blur-[15px] opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative">
              <InteractivePreviewChat />
            </div>
          </div>
        </div>
      </section>

      {/* Niche Targets / Proof */}
      <section className="py-16 border-b border-border relative">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Optimized for high-ticket local business verticals
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
            {['Dental Services', 'Medical Clinics', 'Legal Consultancies', 'Home Contractors', 'E-Commerce Stores'].map((niche) => (
              <div key={niche} className="hover:text-foreground transition-colors duration-300 cursor-default">
                {niche}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-b border-border relative">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              { label: 'Increase Bookings', value: '+67%' },
              { label: 'Auto-Resolved Tickets', value: '80%' },
              { label: 'SaaS Gross Margin', value: '98%' },
              { label: 'Client Set-Up Time', value: '< 5m' },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className="text-5xl md:text-6xl font-semibold mb-3 text-foreground tracking-tight">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Dynamic Data Sourcing */}
      <section className="py-28 relative border-t border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-4">
              Knowledge Base
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-bold text-foreground mb-4 tracking-tight">
              Dynamic scraping, instant embeddings
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Train client bots in seconds using our multi-channel RAG engine.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🌐', title: 'Deep URL Scraping', desc: 'Paste any website link. We automatically discover subpages and extract structured text.' },
              { icon: '📄', title: 'Document Ingestion', desc: 'Upload client documents (PDFs, DOCX, TXT) to instantly load specific policies.' },
              { icon: '❓', title: 'Active FAQs', desc: 'Input custom question/answer guardrails for highly predictable, on-brand responses.' },
              { icon: '🛡️', title: 'Advanced Guardrails', desc: 'Tweak brand tone, control temperature limits, or toggle strict FAQ mode.' }
            ].map((item, i) => (
              <div key={i} className="bg-card/40 border border-border p-6 rounded-2xl hover:bg-card/60 hover:border-border/80 transition-all duration-300 backdrop-blur-2xl group">
                <div className="w-12 h-12 bg-white/[0.03] border border-border rounded-xl flex items-center justify-center mb-4 text-2xl group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Reseller and B2B Agency Focused */}
      <section id="features" className="py-32 border-t border-b border-border relative">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">

          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-4">
              Reseller Platform
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-bold text-foreground mb-6 tracking-tight leading-tight">
              Engineered for high-margin SaaS revenue
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Everything you need to deliver, brand, and scale client chatbots under your own company label.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
              <div key={i} className="group relative p-6 bg-card/40 border border-border rounded-2xl hover:border-border/80 hover:bg-card/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-border flex items-center justify-center mb-5 text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                  <feature.icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ChatDock Section */}
      <section className="py-28 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-4">
              Our Edge
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-bold text-foreground mb-4 tracking-tight">
              Why agencies choose ChatDock
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Purpose-built to deliver conversions, low operational costs, and high gross margins.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'High-Ticket Value', desc: 'Avoid basic Q&A bots. Deliver conversational pipelines that natively book meetings and close invoices.' },
              { title: 'Ultra-Low Cost Base', desc: 'Leverage hyper-optimized API endpoints so supporting thousands of chats costs pennies.' },
              { title: 'Dynamic Style Sync', desc: 'Sync widget and dashboard designs with your agency colors in one click.' },
              { title: 'Zero Operations Overhead', desc: 'Our scraper and PgVector embedding engines handle the engineering so you can focus on sales.' }
            ].map((item, i) => (
              <div key={i} className="bg-card/40 border border-border p-6 rounded-2xl backdrop-blur-2xl hover:bg-card/60 hover:border-border/80 transition-all duration-300">
                <h3 className="font-bold text-foreground mb-2 text-base">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden border-t border-border">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center border border-border rounded-3xl p-12 md:p-20 bg-card/40 backdrop-blur-2xl relative overflow-hidden shadow-large">
            <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-8 tracking-tight leading-tight">
              Launch Your White-Label<br />Agency Business Today
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Start reselling custom transactional AI chatbots to your local clients and unlock high-margin recurring MRR.
            </p>
            <Link href="/auth/sign-up">
              <Button
                className="h-14 px-12 bg-foreground text-background hover:bg-foreground/90 text-lg font-bold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.06)] transition-all duration-300"
              >
                Create Reseller Account <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-muted-foreground text-xs mt-8 font-medium">
              ✓ No credit card required • ✓ Fully brandable under your domain • ✓ 100 free monthly credits included
            </p>
          </div>
        </div>
      </section>

      {/* Learn more (Blog Articles) */}
      <section className="py-24 border-t border-border relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">
              Agency Masterclass
            </h2>
            <p className="text-base text-muted-foreground">
              Deep dives on reseller setups, transactional RAG workflows, and conversion metrics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { href: '/blogs/how-to-train-an-ai-website-chatbot-on-your-docs', title: 'Scaling Agency Recurring Revenue', desc: 'A step-by-step masterclass on pricing, packaging, and delivering high-ticket custom bots.' },
              { href: '/blogs/ai-chatbot-for-website', title: 'Transactional Bot Setups', desc: 'How to configure native e-commerce checkouts and calendars inside your client widgets.' },
              { href: '/blogs/customer-support-ai', title: 'Building Bulletproof RAG', desc: 'Ensure accurate, hallucination-free answers using our PgVector crawl engines.' }
            ].map((blog, i) => (
              <Link key={i} href={blog.href} className="group">
                <div className="bg-card/40 border border-border h-full p-8 rounded-2xl hover:border-border/80 hover:bg-card/60 transition-all duration-300">
                  <h3 className="font-bold text-foreground mb-3 text-lg group-hover:text-primary transition-colors">
                    {[...Array(5)].map((_, starIndex) => (
                      <svg key={starIndex} className="w-3.5 h-3.5 inline-block mr-0.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1">{blog.title}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
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
