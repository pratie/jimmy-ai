import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarCheck2,
  Check,
  ChevronRight,
  CircleCheck,
  Globe2,
  Inbox,
  MessageSquareText,
  Palette,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  Zap,
} from 'lucide-react'

import { Footer } from '@/components/landing/footer'
import PricingSection from '@/components/landing/pricing-section'
import NavBar from '@/components/navbar'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'ChatDock — Client AI Chatbots for Agencies',
  description:
    'Launch client-branded AI chatbots that answer questions, qualify leads, and book appointments—then manage every client from one agency workspace.',
  alternates: { canonical: '/' },
}

const workflow = [
  {
    number: '01',
    title: 'Add the client website',
    description: 'ChatDock turns approved website content into a grounded knowledge base, ready for you to review.',
    icon: Globe2,
  },
  {
    number: '02',
    title: 'Make it client-ready',
    description: 'Set the voice, qualification questions, booking goal, guardrails, and brand without rebuilding the stack.',
    icon: Bot,
  },
  {
    number: '03',
    title: 'Launch and show the result',
    description: 'Install one embed, then track conversations, qualified leads, and bookings in the same workspace.',
    icon: BarChart3,
  },
]

const capabilities = [
  { icon: Palette, title: 'Client-branded experience', copy: 'Match each client’s colors, identity, welcome message, and website experience.' },
  { icon: Inbox, title: 'One agency inbox', copy: 'Review conversations across clients and step in when a valuable lead needs attention.' },
  { icon: Target, title: 'Qualification that fits', copy: 'Capture contact details and ask the questions that matter for each client’s service.' },
  { icon: CalendarCheck2, title: 'A path to the calendar', copy: 'Move the right visitors from a helpful conversation to a booked appointment.' },
  { icon: ShieldCheck, title: 'Answers grounded in the client', copy: 'Train on approved sources, test before launch, and control how every agent behaves.' },
  { icon: UsersRound, title: 'A workspace per client', copy: 'Keep knowledge, branding, conversations, leads, and bookings organized as you grow.' },
]

function ProductPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-6xl lg:mt-20">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-r from-[#ff8a65]/20 via-[#7979f6]/20 to-[#54d6b5]/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[26px] border border-white/15 bg-[#f8f9fc] p-2 shadow-[0_50px_120px_rgba(0,0,0,0.45)] sm:p-3">
        <div className="flex min-h-[520px] overflow-hidden rounded-[19px] bg-white text-left text-[#111827]">
          <aside className="hidden w-56 shrink-0 bg-[#111827] p-5 text-white md:block">
            <div className="mb-10 flex items-center gap-2.5 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#6c6df2]"><MessageSquareText className="h-4 w-4" /></span>
              ChatDock
            </div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Agency</p>
            {['Overview', 'Inbox', 'Leads', 'Bookings'].map((item, index) => (
              <div key={item} className={`mb-1 rounded-lg px-3 py-2.5 text-sm ${index === 0 ? 'bg-white/10 text-white' : 'text-white/55'}`}>{item}</div>
            ))}
            <p className="mb-3 mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Client workspaces</p>
            {['Northstar Dental', 'Aster & Co.', 'Luma Fitness'].map((item, index) => (
              <div key={item} className="flex items-center gap-2.5 py-2 text-xs text-white/65">
                <span className={`h-2 w-2 rounded-full ${index < 2 ? 'bg-emerald-400' : 'bg-amber-300'}`} />{item}
              </div>
            ))}
          </aside>

          <div className="min-w-0 flex-1 bg-[#f4f5f8] p-4 sm:p-7">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#6c6df2]">AGENCY OVERVIEW</p>
                <h3 className="mt-1 text-xl font-bold sm:text-2xl">Good morning, Prathap</h3>
              </div>
              <div className="hidden rounded-xl bg-[#111827] px-4 py-2.5 text-xs font-semibold text-white sm:block">+ New client agent</div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ['Live agents', '08', '+2 this month'],
                ['Conversations', '1,248', 'Across all clients'],
                ['Qualified leads', '184', '14.7% conversion'],
                ['Bookings', '62', 'This month'],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-2xl border border-[#e6e8ef] bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-medium text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
                  <p className="mt-2 text-[10px] text-slate-400">{note}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_0.8fr]">
              <div className="rounded-2xl border border-[#e6e8ef] bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div><p className="font-semibold">Client portfolio</p><p className="text-xs text-slate-400">Every agent, one clear view</p></div>
                  <span className="text-xs font-semibold text-[#6c6df2]">View all</span>
                </div>
                {[
                  ['Northstar Dental', 'Live', '426 chats', '58 leads'],
                  ['Aster & Co.', 'Live', '312 chats', '41 leads'],
                  ['Luma Fitness', 'Training', '—', '—'],
                ].map(([name, status, chats, leads]) => (
                  <div key={name} className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-slate-100 py-3.5 sm:grid-cols-[1fr_70px_80px_70px]">
                    <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">{name[0]}</span><span className="truncate text-xs font-semibold sm:text-sm">{name}</span></div>
                    <span className={`hidden text-[11px] font-semibold sm:block ${status === 'Live' ? 'text-emerald-600' : 'text-amber-600'}`}>{status}</span>
                    <span className="hidden text-[11px] text-slate-400 sm:block">{chats}</span>
                    <span className="text-[11px] text-slate-400">{leads}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-[#171d2b] p-5 text-white shadow-sm">
                <div className="mb-8 flex items-center justify-between"><span className="text-xs text-white/50">Agent activity</span><Zap className="h-4 w-4 text-[#ffb36b]" /></div>
                <p className="text-4xl font-bold">14.7%</p>
                <p className="mt-2 text-xs text-white/45">visitor-to-lead conversion</p>
                <div className="mt-8 flex h-24 items-end gap-2">
                  {[34, 48, 40, 67, 56, 82, 72, 95, 78, 100].map((height, index) => <span key={index} className="flex-1 rounded-t bg-[#7778f4]" style={{ height: `${height}%`, opacity: 0.45 + index * 0.05 }} />)}
                </div>
                <div className="mt-5 flex items-center gap-2 text-[11px] text-emerald-300"><CircleCheck className="h-3.5 w-3.5" /> All live agents healthy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f5f7] text-[#111827] selection:bg-[#6c6df2] selection:text-white">
      <NavBar />

      <section className="relative overflow-hidden bg-[#0d1321] px-5 pb-24 pt-36 text-white sm:px-8 md:pt-44 lg:pb-32">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
        <div className="absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-[#6c6df2]/25 blur-[100px]" />
        <div className="absolute right-[-5%] top-40 h-72 w-72 rounded-full bg-[#ff8a65]/20 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/70 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#ffb36b]" /> For AI automation, lead-gen &amp; web agencies
          </div>
          <h1 className="mx-auto max-w-5xl text-balance text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl sm:leading-[0.98] md:text-7xl lg:text-[88px]">
            Launch client chatbots that <span className="text-[#aaaaff]">qualify and book.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-balance text-lg leading-8 text-white/60 md:text-xl">
            Train on each client’s website, match their brand, qualify visitors, book appointments, and manage every account from one workspace.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/sign-up"><Button className="h-13 rounded-xl bg-[#7677f4] px-7 text-sm font-semibold text-white hover:bg-[#6869e8]">Launch a client agent <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <a href="https://cal.com/prathap-reddy-caxwn4/15min" target="_blank" rel="noopener noreferrer" className="inline-flex h-13 items-center rounded-xl border border-white/15 bg-white/[0.06] px-7 text-sm font-semibold text-white transition hover:bg-white/10">Talk through a client use case</a>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/45">
            {['No code required', 'Client-brand ready', '100 free messages to test'].map(item => <span key={item} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-300" />{item}</span>)}
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-b border-[#dfe2e9] bg-white px-5 py-7">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-500 sm:gap-5 md:text-sm">
          {['Client website', 'Grounded chatbot', 'Qualified visitor', 'Booked appointment'].map((item, index) => (
            <div key={item} className="flex items-center gap-3"><span>{item}</span>{index < 3 && <ChevronRight className="h-4 w-4 text-[#8d8ef6]" />}</div>
          ))}
        </div>
      </section>

      <section id="workflow" className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">Your client signed. Now deliver.</p>
              <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Stop stitching together a chatbot stack for every client.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-slate-500">ChatDock gives small agencies one repeatable path from a signed local-business client to a live, measurable website agent—without juggling separate training, widget, inbox, lead, and booking tools.</p>
          </div>

          <div className="mt-16 grid gap-4 lg:grid-cols-3">
            {workflow.map((step) => (
              <article key={step.number} className="group rounded-[26px] border border-[#dfe2e9] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(17,24,39,0.09)] sm:p-9">
                <div className="flex items-start justify-between"><span className="text-xs font-bold tracking-[0.2em] text-slate-300">{step.number}</span><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f0f0ff] text-[#6667db]"><step.icon className="h-5 w-5" /></span></div>
                <h3 className="mt-16 text-2xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-500">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">Built for the service you actually sell</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">From website question to qualified appointment.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">Give appointment-driven clients a faster response while giving your agency fewer tools to babysit.</p>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[28px] border border-[#e3e5eb] bg-[#e3e5eb] md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((feature) => (
              <div key={feature.title} className="bg-white p-8 sm:p-10">
                <feature.icon className="h-6 w-6 text-[#696ae4]" />
                <h3 className="mt-8 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-500">{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e3e5eb] bg-[#f7f8fa] px-5 py-24 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6667db]">Productize the delivery work</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">The next client should not mean another custom build.</h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">Use the same launch workflow for dental, home-service, wellness, and other appointment-led clients—then tune what makes each business different.</p>
            </div>
            <div className="overflow-hidden rounded-[24px] border border-[#dfe2e9] bg-white">
              <div className="grid grid-cols-[0.8fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:px-7"><span>Workflow</span><span>Without ChatDock</span><span>With ChatDock</span></div>
              {[
                ['Agent launch', 'Crawler, prompt tool, widget, handoff', 'One guided client setup'],
                ['Quality review', 'Scattered test chats and screenshots', 'Structured private launch review'],
                ['Daily operations', 'Separate inboxes and spreadsheets', 'One agency command center'],
                ['Client reporting', 'Manually assemble activity updates', 'Conversations, leads, and bookings together'],
              ].map(([area, before, after]) => <div key={area} className="grid grid-cols-1 gap-3 border-b border-slate-100 px-5 py-5 last:border-0 sm:grid-cols-[0.8fr_1fr_1fr] sm:gap-5 sm:px-7"><p className="text-sm font-semibold text-slate-800">{area}</p><p className="text-xs leading-5 text-slate-400">{before}</p><p className="flex items-start gap-2 text-xs font-medium leading-5 text-slate-700"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{after}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[32px] bg-[#151b29] text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#aaaaff]">Protect the client retainer</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Don’t report “the bot is live.” Show what it produced.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/55">Keep conversations, captured leads, and bookings in one operational view, so your next client check-in starts with evidence instead of activity screenshots.</p>
            <Link href="/auth/sign-up" className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-white">Explore the workspace <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative min-h-[420px] bg-[#1d2434] p-7 sm:p-10">
            <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_center,rgba(137,138,255,.5)_0,transparent_55%)]" />
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-semibold">Northstar Dental</p><p className="mt-1 text-xs text-white/35">Monthly client summary</p></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">Agent live</span></div>
              <div className="grid grid-cols-3 gap-2">
                {[['426','Chats'],['58','Leads'],['21','Bookings']].map(([value,label]) => <div key={label} className="rounded-2xl bg-black/15 p-4"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-[10px] text-white/40">{label}</p></div>)}
              </div>
              <div className="mt-5 rounded-2xl bg-black/15 p-5">
                <div className="flex items-center justify-between text-xs"><span className="text-white/45">Conversion journey</span><span className="text-emerald-300">+18.4%</span></div>
                <div className="mt-5 space-y-3">{[['Visitors','100%'],['Conversations','41%'],['Qualified','14%'],['Booked','5%']].map(([label,width]) => <div key={label} className="grid grid-cols-[80px_1fr_34px] items-center gap-3 text-[10px] text-white/40"><span>{label}</span><span className="h-1.5 rounded-full bg-white/10"><span className="block h-full rounded-full bg-[#8586f7]" style={{width}} /></span><span>{width}</span></div>)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="px-5 pb-24 pt-8 sm:px-8 lg:pb-32">
        <div className="mx-auto max-w-7xl rounded-[32px] bg-[#7677f4] px-7 py-16 text-center text-white sm:px-12 lg:py-24">
          <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Have a client website ready?</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">Turn it into a working qualification and booking demo before your next client call.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/auth/sign-up"><Button className="h-13 rounded-xl bg-white px-7 text-sm font-semibold text-[#5556cf] hover:bg-white/90">Build the first demo free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link><a href="https://cal.com/prathap-reddy-caxwn4/15min" target="_blank" rel="noopener noreferrer" className="inline-flex h-13 items-center justify-center rounded-xl border border-white/25 px-7 text-sm font-semibold text-white hover:bg-white/10">Book an agency walkthrough</a></div>
        </div>
      </section>

      <Footer />
      <Script id="46316941-5e6b-4222-adc4-48fc5221012c" src="https://www.chatdock.io/embed.min.js" strategy="afterInteractive" data-app-origin="https://www.chatdock.io" data-margin="24" data-size="md" />
    </main>
  )
}
