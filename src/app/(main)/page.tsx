import type { Metadata } from 'next'
import type * as React from 'react'
import Link from 'next/link'
import Script from 'next/script'
import {
  ArrowDown,
  ArrowRight,
  CalendarCheck2,
  Check,
  Globe2,
  Inbox,
  MessageSquareText,
  Palette,
  Rocket,
  ShieldCheck,
  Target,
  UsersRound,
} from 'lucide-react'

import Faq from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'
import HeroDemo from '@/components/landing/hero-demo'
import InteractivePreviewChat from '@/components/landing/interactive-preview-chat'
import PricingSection from '@/components/landing/pricing-section'
import { Reveal } from '@/components/landing/reveal'
import { StatCounter } from '@/components/landing/stat-counter'
import NavBar from '@/components/navbar'

export const metadata: Metadata = {
  title: 'ChatDock — Client AI Chatbots for Agencies',
  description:
    'Give every client website a 24/7 assistant that answers questions, captures leads, and books appointments. Launch client-branded chatbots and manage them all from one agency dashboard.',
  alternates: { canonical: '/' },
}

const VERTICALS = [
  'Dental clinics',
  'Med spas',
  'Plumbers',
  'HVAC companies',
  'Law firms',
  'Fitness studios',
  'Salons',
  'Roofers',
  'Chiropractors',
  'Real estate teams',
  'Vet clinics',
  'Home cleaners',
]

const STEPS = [
  {
    number: '1',
    time: '~2 minutes',
    icon: Globe2,
    title: 'Paste the client’s website',
    description:
      'ChatDock reads the site and learns every service, price, and policy on it. Add PDFs or docs if you want it to know more.',
  },
  {
    number: '2',
    time: '~10 minutes',
    icon: Palette,
    title: 'Make it theirs',
    description:
      'Set the client’s logo, colors, and greeting. Choose the questions that qualify a good lead — and what a “booked appointment” means for that business.',
  },
  {
    number: '3',
    time: '~5 minutes',
    icon: Rocket,
    title: 'Put it live and watch',
    description:
      'Copy one line of code onto the site. From then on, every conversation, captured lead, and booking shows up in your dashboard.',
  },
]

const FEATURES = [
  {
    icon: Palette,
    title: 'Their brand, not ours',
    copy: 'Logo, colors, and tone match each client’s website so the assistant feels like part of their team.',
  },
  {
    icon: ShieldCheck,
    title: 'Answers from approved content only',
    copy: 'It learns from the client’s site and your documents — and says “let me take your details” instead of guessing when it doesn’t know.',
  },
  {
    icon: Target,
    title: 'Asks the questions that matter',
    copy: 'Name, phone, and whatever qualifies a real lead for that business — collected naturally inside the conversation.',
  },
  {
    icon: CalendarCheck2,
    title: 'Turns chats into appointments',
    copy: 'Serious visitors get guided from “how much does it cost?” to a booked time on the calendar.',
  },
  {
    icon: Inbox,
    title: 'Every conversation in one inbox',
    copy: 'See chats across all clients in one place and step in personally when a valuable lead shows up.',
  },
  {
    icon: UsersRound,
    title: 'A separate workspace per client',
    copy: 'Knowledge, branding, leads, and bookings never mix. Add the next client without rebuilding anything.',
  },
]

const COMPARISON = [
  ['Launching an agent', 'Crawler + prompt tool + widget, stitched by hand', 'One guided setup per client'],
  ['Checking quality', 'Scattered test chats and screenshots', 'Private test chat before going live'],
  ['Daily operations', 'A different inbox and login per client', 'One agency dashboard for everything'],
  ['Client reporting', 'Screenshots pasted into a slide deck', 'Conversations, leads & bookings — ready to show'],
]

function VerticalsMarquee() {
  const items = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden || undefined} className="flex shrink-0 animate-marquee items-center">
      {VERTICALS.map((vertical) => (
        <span
          key={vertical}
          className="mx-3 flex items-center gap-2 whitespace-nowrap rounded-full border border-black/[0.07] bg-white px-4 py-2 text-sm font-medium text-[#5a6072]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#7677f4]" />
          {vertical}
        </span>
      ))}
    </div>
  )

  return (
    <div className="group relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="flex w-max group-hover:[&>div]:[animation-play-state:paused] motion-reduce:animate-none">
        {items(false)}
        {items(true)}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfbfd] text-[#171d3b] selection:bg-[#7677f4] selection:text-white">
      {/* If JS is unavailable, never leave scroll-revealed content hidden */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <NavBar />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden px-5 pb-24 pt-28 sm:px-8 md:pt-36 lg:pb-28">
        {/* Backdrop */}
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(23,29,59,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(23,29,59,.035)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute left-1/2 top-[-220px] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[#7677f4]/15 blur-[120px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-xs font-semibold text-[#5a6072] shadow-[0_2px_10px_rgba(23,29,59,0.05)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                For agencies that manage client websites
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-5 text-balance font-heading text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-[58px]">
                Give every client’s website a{' '}
                <span className="relative whitespace-nowrap text-[#5f60d8]">
                  receptionist
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-[#7677f4]/40"
                    viewBox="0 0 300 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      className="draw-underline"
                      pathLength={1}
                      d="M2 9C60 3 150 2 298 7"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{' '}
                that never sleeps.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-5 max-w-xl text-balance text-[17px] leading-8 text-[#5a6072] lg:mx-0">
                ChatDock adds a friendly assistant to any website you manage. It answers visitors’ questions from the
                client’s own content, saves their details, and books the appointment — while you run every client from
                one dashboard.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/auth/sign-up"
                  className="press inline-flex items-center gap-2 rounded-xl bg-[#7677f4] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-8px_rgba(118,119,244,0.6)] transition-colors hover:bg-[#696ae6]"
                >
                  Build your first assistant free <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#demo"
                  className="press inline-flex items-center gap-2 rounded-xl border border-black/[0.1] bg-white px-7 py-3.5 text-sm font-semibold text-[#171d3b] transition-colors hover:bg-black/[0.03]"
                >
                  See it work, live <ArrowDown className="h-4 w-4" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[#8a8fa5] lg:justify-start">
                {['No coding needed', 'Live in an afternoon', '100 free messages to test'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="relative">
            <HeroDemo />
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── Verticals marquee ─────────────────── */}
      <section className="border-y border-black/[0.06] bg-[#f6f7fb] py-8">
        <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#8a8fa5]">
          Works for the businesses your clients run
        </p>
        <VerticalsMarquee />
      </section>

      {/* ─────────────────── Live sandbox demo ─────────────────── */}
      <section id="demo" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">Don’t take our word for it</p>
            <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Paste a real website. Meet its assistant.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5a6072]">
              This is the fastest way to understand what you’d be selling. Try it with your own site — or a client’s —
              and ask it anything a customer would.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <InteractivePreviewChat />
          </Reveal>
        </div>
      </section>

      {/* ───────────────────── How it works ───────────────────── */}
      <section id="how-it-works" className="scroll-mt-24 bg-white px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">How it works</p>
              <h2 className="mt-4 max-w-xl font-heading text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
                From a client’s website to a working assistant in an afternoon.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="max-w-xl text-lg leading-8 text-[#5a6072]">
                No custom builds, no stack of disconnected tools. The same three steps for every client you sign —
                dental practice, plumber, or law firm.
              </p>
            </Reveal>
          </div>

          <div className="relative mt-16 grid gap-5 lg:grid-cols-3">
            {/* Connecting line draws itself as the steps appear (desktop) */}
            <Reveal className="absolute left-[16%] right-[16%] top-12 hidden lg:block">
              <div className="draw-line border-t-2 border-dashed border-[#7677f4]/25" />
            </Reveal>
            {STEPS.map((step, index) => (
              <Reveal key={step.number} delay={index * 120} className="relative">
                <article className="group h-full rounded-[24px] border border-black/[0.07] bg-[#fbfbfd] p-7 transition-all duration-300 ease-out-strong hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(23,29,59,0.18)] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7677f4] font-heading text-lg font-bold text-white shadow-[0_8px_20px_-6px_rgba(118,119,244,0.6)]">
                      {step.number}
                    </span>
                    <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-semibold text-[#8a8fa5]">
                      {step.time}
                    </span>
                  </div>
                  <h3 className="mt-8 font-heading text-xl font-bold tracking-tight sm:text-2xl">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[#5a6072]">{step.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── Features ─────────────────────── */}
      <section id="features" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">What you get</p>
            <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Everything between “visitor had a question” and “client got a booking.”
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-6">
            {/* Bento cell: brand — three client widgets, one platform */}
            <Reveal className="lg:col-span-4">
              <div className="group h-full rounded-[24px] border border-black/[0.07] bg-white p-7 transition-all duration-300 ease-out-strong hover:-translate-y-1 hover:border-[#7677f4]/30 hover:shadow-[0_24px_60px_-20px_rgba(23,29,59,0.15)] sm:p-8">
                <div className="grid gap-7 sm:grid-cols-[1fr_240px] sm:items-center">
                  <div>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef0ff] text-[#5f60d8] transition-colors duration-300 group-hover:bg-[#7677f4] group-hover:text-white">
                      <Palette className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 font-heading text-lg font-bold tracking-tight">{FEATURES[0].title}</h3>
                    <p className="mt-2.5 text-[15px] leading-7 text-[#5a6072]">{FEATURES[0].copy}</p>
                  </div>
                  <div aria-hidden="true" className="rounded-2xl bg-[#f6f7fb] p-4">
                    {[
                      ['Northstar Dental', '#7677f4', 'ml-0'],
                      ['Luma Fitness', '#10b981', 'ml-5'],
                      ['Aster & Co.', '#f59e0b', 'ml-10'],
                    ].map(([name, color, offset], i) => (
                      <div
                        key={name}
                        className={`${offset} ${i > 0 ? 'mt-2.5' : ''} flex w-fit items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-transform duration-300 ease-out-strong group-hover:translate-x-1`}
                        style={{ backgroundColor: color as string, transitionDelay: `${i * 60}ms` }}
                      >
                        <span className="relative grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[9px] font-bold">
                          {(name as string)[0]}
                          <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        </span>
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {[FEATURES[1], FEATURES[2]].map((feature, index) => (
              <Reveal key={feature.title} delay={100 + index * 100} className="lg:col-span-2">
                <div className="group h-full rounded-[24px] border border-black/[0.07] bg-white p-7 transition-all duration-300 ease-out-strong hover:-translate-y-1 hover:border-[#7677f4]/30 hover:shadow-[0_24px_60px_-20px_rgba(23,29,59,0.15)] sm:p-8">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef0ff] text-[#5f60d8] transition-colors duration-300 group-hover:bg-[#7677f4] group-hover:text-white">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 font-heading text-lg font-bold tracking-tight">{feature.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-7 text-[#5a6072]">{feature.copy}</p>
                </div>
              </Reveal>
            ))}

            {/* Bento cell: inbox — conversations become leads and bookings */}
            <Reveal delay={100} className="lg:col-span-4">
              <div className="group h-full rounded-[24px] border border-black/[0.07] bg-white p-7 transition-all duration-300 ease-out-strong hover:-translate-y-1 hover:border-[#7677f4]/30 hover:shadow-[0_24px_60px_-20px_rgba(23,29,59,0.15)] sm:p-8">
                <div className="grid gap-7 sm:grid-cols-[1fr_260px] sm:items-center">
                  <div>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef0ff] text-[#5f60d8] transition-colors duration-300 group-hover:bg-[#7677f4] group-hover:text-white">
                      <Inbox className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 font-heading text-lg font-bold tracking-tight">{FEATURES[4].title}</h3>
                    <p className="mt-2.5 text-[15px] leading-7 text-[#5a6072]">{FEATURES[4].copy}</p>
                  </div>
                  <div aria-hidden="true" className="space-y-2 rounded-2xl bg-[#f6f7fb] p-3.5">
                    {[
                      ['S', 'Sarah M.', 'Can I book Thursday?', 'Booked', '#059669', '#d1fae5'],
                      ['J', 'James K.', 'How much is a repair?', 'New lead', '#5f60d8', '#e5e6ff'],
                      ['P', 'Priya R.', 'Do you take walk-ins?', 'Replying', '#8a8fa5', '#eef0f4'],
                    ].map(([initial, name, snippet, badge, badgeColor, badgeBg]) => (
                      <div key={name as string} className="flex items-center gap-2.5 rounded-xl border border-black/[0.05] bg-white px-3 py-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#eef0ff] text-[10px] font-bold text-[#5f60d8]">
                          {initial}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-bold text-[#171d3b]">{name}</span>
                          <span className="block truncate text-[10px] text-[#9aa0b5]">{snippet}</span>
                        </span>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold"
                          style={{ color: badgeColor as string, backgroundColor: badgeBg as string }}
                        >
                          {badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {[FEATURES[3], FEATURES[5]].map((feature, index) => (
              <Reveal key={feature.title} delay={200 + index * 100} className="lg:col-span-3">
                <div className="group h-full rounded-[24px] border border-black/[0.07] bg-white p-7 transition-all duration-300 ease-out-strong hover:-translate-y-1 hover:border-[#7677f4]/30 hover:shadow-[0_24px_60px_-20px_rgba(23,29,59,0.15)] sm:p-8">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef0ff] text-[#5f60d8] transition-colors duration-300 group-hover:bg-[#7677f4] group-hover:text-white">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 font-heading text-lg font-bold tracking-tight">{feature.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-7 text-[#5a6072]">{feature.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── Before / after table ────────────────── */}
      <section className="bg-white px-5 py-24 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">Why agencies switch</p>
            <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              The next client shouldn’t mean another custom build.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[#5a6072]">
              Most agencies duct-tape a crawler, a prompt tool, a chat widget, an inbox, and a spreadsheet — for every
              single client. ChatDock replaces the pile with one repeatable workflow.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-[24px] border border-black/[0.08] bg-[#fbfbfd]">
              <div className="grid grid-cols-[0.8fr_1fr_1fr] border-b border-black/[0.06] bg-black/[0.02] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8fa5] sm:px-7">
                <span>Task</span>
                <span>The duct-tape way</span>
                <span className="text-[#5f60d8]">With ChatDock</span>
              </div>
              {COMPARISON.map(([area, before, after], rowIndex) => (
                <div
                  key={area}
                  className="stagger-item grid grid-cols-1 gap-3 border-b border-black/[0.05] px-5 py-5 last:border-0 sm:grid-cols-[0.8fr_1fr_1fr] sm:gap-5 sm:px-7"
                  style={{ '--stagger-delay': `${200 + rowIndex * 110}ms` } as React.CSSProperties}
                >
                  <p className="text-sm font-semibold text-[#171d3b]">{area}</p>
                  <p className="text-[13px] leading-6 text-[#9aa0b5] sm:line-through sm:decoration-[#d9dbe6]">{before}</p>
                  <p className="flex items-start gap-2 text-[13px] font-medium leading-6 text-[#3c4257]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {after}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── Results / retention proof ──────────────── */}
      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-[#171d3b] text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-14">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b6b7ff]">Keep the retainer</p>
              <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
                Don’t tell clients “the bot is live.” Show what it caught.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
                Every conversation, captured lead, and booked appointment is logged per client. Open the workspace in
                your monthly review and walk through exactly what the assistant produced — that’s what renews retainers.
              </p>
              <Link
                href="/auth/sign-up"
                className="press mt-9 inline-flex items-center gap-2 text-sm font-semibold text-white"
              >
                Explore the dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          <div className="relative min-h-[420px] bg-[#1e2547] p-7 sm:p-10">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(137,138,255,.45)_0,transparent_55%)]" />
            <Reveal delay={150} className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <MessageSquareText className="h-4 w-4 text-[#b6b7ff]" /> Northstar Dental
                    </p>
                    <p className="mt-1 text-xs text-white/40">Monthly client summary</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                    Assistant live
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    [426, 'Conversations'],
                    [58, 'Leads captured'],
                    [21, 'Appointments'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-black/20 p-4">
                      <p className="font-heading text-2xl font-bold sm:text-3xl">
                        <StatCounter value={value as number} />
                      </p>
                      <p className="mt-1 text-[10px] text-white/45">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-black/20 p-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/45">From visitor to appointment</span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      ['Visitors', '100%', 0],
                      ['Started chatting', '41%', 120],
                      ['Became leads', '14%', 240],
                      ['Booked a time', '5%', 360],
                    ].map(([label, width, delay]) => (
                      <div
                        key={label as string}
                        className="grid grid-cols-[110px_1fr_36px] items-center gap-3 text-[11px] text-white/45"
                      >
                        <span>{label}</span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="grow-bar block h-full rounded-full bg-[#8586f7]"
                            style={
                              {
                                '--bar-width': width,
                                '--bar-delay': `${(delay as number) + 300}ms`,
                              } as React.CSSProperties
                            }
                          />
                        </span>
                        <span className="tabular-nums">{width}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <PricingSection />

      {/* ─────────────────────────── FAQ ─────────────────────────── */}
      <section id="faq" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">Questions, answered plainly</p>
            <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Everything clients will ask you — answered.
            </h2>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── Final CTA ───────────────────────── */}
      <section className="px-5 pb-24 sm:px-8 lg:pb-32">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-[#7677f4] to-[#5556cf] px-7 py-16 text-center text-white sm:px-12 lg:py-24">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl font-heading text-4xl font-bold tracking-[-0.03em] sm:text-6xl">
                Right now, someone is on a client’s website with a question.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
                Put an assistant there before your next client call — and walk in with a working demo instead of a
                proposal.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/auth/sign-up"
                  className="press inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#5556cf] transition-colors hover:bg-white/90"
                >
                  Build the first demo free <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://cal.com/prathap-reddy-caxwn4/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Book a 15-minute walkthrough
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
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
