'use client'

import React from 'react'
import { FadeIn } from '@/components/ui/fade-in'
import { SpotlightCard } from '@/components/ui/spotlight-card'

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-transparent">

      {/* Decorative background glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">

        {/* Section Header */}
        <FadeIn direction="up">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-bold tracking-widest uppercase text-primary mb-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
              ✨ Product Flow
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground mb-6">
              Launch your AI Agent in <span className="text-gradient-primary">under 5 minutes</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A simple, self-serve flow built to turn anonymous website traffic into qualified meetings and paying customers.
            </p>
          </div>
        </FadeIn>

        {/* 4-Column Modern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">

          {/* Card 1: Train AI */}
          <FadeIn delay={0.1} direction="up" className="h-full">
            <SpotlightCard className="p-6 flex flex-col justify-between h-full min-h-[380px] group">
            <div>
              {/* Dynamic SVG 1: Crawler/Data flow */}
              <div className="h-28 w-full bg-background/40 rounded-2xl border border-border/50 flex items-center justify-center overflow-hidden mb-6 relative group-hover:bg-background/60 transition-colors duration-300">
                <svg className="w-full h-full p-4" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Central database node */}
                  <rect x="85" y="35" width="30" height="30" rx="6" className="fill-muted/20 stroke-muted" strokeWidth="1.5" />
                  <g>
                    <line x1="90" y1="45" x2="110" y2="45" className="stroke-muted" strokeWidth="1.5" />
                    <line x1="90" y1="50" x2="110" y2="50" className="stroke-muted" strokeWidth="1.5" />
                    <line x1="90" y1="55" x2="110" y2="55" className="stroke-muted" strokeWidth="1.5" />
                  </g>

                  {/* Web page node */}
                  <rect x="20" y="38" width="24" height="24" rx="4" className="fill-background stroke-border" strokeWidth="1.5" />
                  <circle cx="28" cy="46" r="2" className="fill-muted-foreground" />
                  <line x1="34" y1="46" x2="40" y2="46" className="stroke-muted-foreground/50" strokeWidth="1.5" />
                  <line x1="28" y1="52" x2="38" y2="52" className="stroke-muted-foreground/50" strokeWidth="1.5" />

                  {/* PDF/Doc node */}
                  <rect x="156" y="38" width="24" height="24" rx="4" className="fill-background stroke-border" strokeWidth="1.5" />
                  <line x1="162" y1="46" x2="174" y2="46" className="stroke-muted-foreground/50" strokeWidth="1.5" />
                  <line x1="162" y1="51" x2="174" y2="51" className="stroke-muted-foreground/50" strokeWidth="1.5" />
                  <line x1="162" y1="56" x2="170" y2="56" className="stroke-muted-foreground/50" strokeWidth="1.5" />

                  {/* Connecting streams with animations */}
                  <path d="M 44 50 L 85 50" className="stroke-border" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="M 156 50 L 115 50" className="stroke-border" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Flowing particles */}
                  <circle r="2.5" className="fill-foreground animate-flow-left" />
                  <circle r="2.5" className="fill-foreground animate-flow-right" />
                </svg>

                {/* Glowing border outline */}
                <div className="absolute inset-0 border border-border rounded-2xl transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                1. Train Your AI Instantly
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter your website URL or upload files. Our RAG engine crawls, structures, and builds a customized knowledge base in seconds.
              </p>
            </div>

            <div className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mt-4">
              Step 01 / Scraper
            </div>
          </SpotlightCard>
          </FadeIn>

          {/* Card 2: Customize */}
          <FadeIn delay={0.2} direction="up" className="h-full">
            <SpotlightCard className="p-6 flex flex-col justify-between h-full min-h-[380px] group">
            <div>
              {/* Dynamic SVG 2: Customization dials */}
              <div className="h-28 w-full bg-background/40 rounded-2xl border border-border/50 flex items-center justify-center overflow-hidden mb-6 relative group-hover:bg-background/60 transition-colors duration-300">
                <svg className="w-full h-full p-4" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer container */}
                  <rect x="30" y="25" width="140" height="50" rx="8" className="fill-background stroke-border" strokeWidth="1.5" />

                  {/* Mock toggle 1 */}
                  <rect x="45" y="38" width="24" height="12" rx="6" className="fill-muted" />
                  <circle cx="51" cy="44" r="4" className="fill-muted-foreground animate-toggle-shift" />
                  <text x="45" y="63" className="fill-muted-foreground font-mono" fontSize="7" fontWeight="bold">SALES</text>

                  {/* Mock slider 2 */}
                  <line x1="85" y1="44" x2="115" y2="44" className="stroke-border" strokeWidth="3" strokeLinecap="round" />
                  <line x1="85" y1="44" x2="103" y2="44" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="103" cy="44" r="5" className="fill-background stroke-foreground animate-slider-wobble" strokeWidth="1.5" />
                  <text x="85" y="63" className="fill-muted-foreground font-mono" fontSize="7" fontWeight="bold">TEMP: 0.7</text>

                  {/* Mock toggle 3 */}
                  <rect x="131" y="38" width="24" height="12" rx="6" className="fill-foreground" />
                  <circle cx="147" cy="44" r="4" className="fill-background" />
                  <text x="127" y="63" className="fill-foreground font-mono" fontSize="7" fontWeight="bold">SUPPORT</text>
                </svg>

                {/* Glowing border outline */}
                <div className="absolute inset-0 border border-border rounded-2xl transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                2. Customize & Guardrail
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set your bot&apos;s mode (Sales, Support, or Qualifier). Adjust the brand voice, define qualification questions, and style the widget theme.
              </p>
            </div>

            <div className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mt-4">
              Step 02 / Guardrails
            </div>
          </SpotlightCard>
          </FadeIn>

          {/* Card 3: Embed */}
          <FadeIn delay={0.3} direction="up" className="h-full">
            <SpotlightCard className="p-6 flex flex-col justify-between h-full min-h-[380px] group">
            <div>
              {/* Dynamic SVG 3: Script embedding */}
              <div className="h-28 w-full bg-background/40 rounded-2xl border border-border/50 flex items-center justify-center overflow-hidden mb-6 relative group-hover:bg-background/60 transition-colors duration-300">
                <svg className="w-full h-full p-4" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Code box */}
                  <rect x="25" y="25" width="150" height="50" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />

                  {/* Typing code script snippet */}
                  <text x="35" y="44" className="fill-muted-foreground font-mono text-[6px]">&lt;script src=&quot;https://chatdock.io/embed.js&quot;&gt;&lt;/script&gt;</text>
                  <text x="35" y="54" className="fill-foreground font-mono text-[6px]">&lt;chat-dock-widget</text>
                  <text x="45" y="64" className="fill-emerald-500 font-mono text-[6px]">data-app-id=&quot;9e4a3b-ff2b-...&quot;</text>
                  <text x="35" y="70" className="fill-foreground font-mono text-[6px]">&gt;&lt;/chat-dock-widget&gt;</text>

                  {/* Pulsing circular code wave */}
                  <circle cx="160" cy="50" r="18" className="stroke-primary/25 animate-ripple-wave" strokeWidth="1.5" />
                  <circle cx="160" cy="50" r="28" className="stroke-primary/10 animate-ripple-wave-delayed" strokeWidth="1.5" />

                  <circle cx="160" cy="50" r="4" className="fill-primary animate-pulse" />
                </svg>

                {/* Glowing border outline */}
                <div className="absolute inset-0 border border-border rounded-2xl transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                3. Embed in One Click
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Copy and paste one simple line of HTML code into your website. Works instantly on Webflow, WordPress, Shopify, Next.js, or any custom build.
              </p>
            </div>

            <div className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mt-4">
              Step 03 / Embed
            </div>
          </SpotlightCard>
          </FadeIn>

          {/* Card 4: Convert */}
          <FadeIn delay={0.4} direction="up" className="h-full">
            <SpotlightCard className="p-6 flex flex-col justify-between h-full min-h-[380px] group">
            <div>
              {/* Dynamic SVG 4: Conversion & Chat bubbles */}
              <div className="h-28 w-full bg-background/40 rounded-2xl border border-border/50 flex items-center justify-center overflow-hidden mb-6 relative group-hover:bg-background/60 transition-colors duration-300">
                <svg className="w-full h-full p-4" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Chat bubbles */}
                  <rect x="25" y="20" width="105" height="24" rx="12" className="fill-background stroke-border" strokeWidth="1.5" />
                  <text x="37" y="34" className="fill-foreground font-sans" fontSize="7" fontWeight="bold">Ready to book a meeting? 😉</text>

                  <rect x="85" y="52" width="90" height="24" rx="12" className="fill-primary" />
                  <text x="97" y="66" className="fill-primary-foreground font-sans" fontSize="7" fontWeight="bold">Yes, calendar shared! 📅</text>

                  {/* Pulsing badge */}
                  <circle cx="18" cy="18" r="4" className="fill-emerald-500 animate-ping-slow" />
                  <circle cx="18" cy="18" r="3" className="fill-emerald-500" />
                </svg>

                {/* Glowing border outline */}
                <div className="absolute inset-0 border border-border rounded-2xl transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                4. Qualify Leads 24/7
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your bot captures emails, qualifies prospects, and books meetings. If a complex issue arises, it alerts you in real time to chat live.
              </p>
            </div>

            <div className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mt-4">
              Step 04 / Conversion
            </div>
          </SpotlightCard>
          </FadeIn>

        </div>

      </div>

      {/* Fully self-contained CSS Keyframes for beautiful SVG animations */}
      <style jsx>{`
        @keyframes flowLeft {
          0% { cx: 44; cy: 50; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { cx: 85; cy: 50; opacity: 0; }
        }
        @keyframes flowRight {
          0% { cx: 156; cy: 50; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { cx: 115; cy: 50; opacity: 0; }
        }
        @keyframes ripple {
          0% { r: 6; opacity: 0.8; }
          100% { r: 35; opacity: 0; }
        }
        @keyframes toggleShift {
          0%, 100% { cx: 51; }
          50% { cx: 63; }
        }
        @keyframes sliderWobble {
          0%, 100% { cx: 103; }
          50% { cx: 110; }
        }
        @keyframes pingSlow {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .animate-flow-left {
          animation: flowLeft 2.4s infinite linear;
        }
        .animate-flow-right {
          animation: flowRight 2.4s infinite linear 1.2s;
        }
        .animate-ripple-wave {
          animation: ripple 3s infinite cubic-bezier(0.1, 0.8, 0.3, 1);
        }
        .animate-ripple-wave-delayed {
          animation: ripple 3s infinite cubic-bezier(0.1, 0.8, 0.3, 1) 1.5s;
        }
        .animate-toggle-shift {
          animation: toggleShift 4s infinite ease-in-out;
        }
        .animate-slider-wobble {
          animation: sliderWobble 6s infinite ease-in-out;
        }
        .animate-ping-slow {
          transform-origin: 18px 18px;
          animation: pingSlow 2s infinite cubic-bezier(0.1, 0.8, 0.3, 1);
        }
      `}</style>
    </section>
  )
}
