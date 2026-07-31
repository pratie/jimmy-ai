import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — ChatDock',
  description:
    'Guides and playbooks on AI website chatbots, lead generation, qualification, and deployment with ChatDock.',
  alternates: { canonical: '/blogs' },
  openGraph: {
    title: 'Blog — ChatDock',
    description:
      'Guides and playbooks on AI website chatbots, lead gen, and deployment.',
    type: 'website',
    images: [
      { url: '/images/social_graph_img.png', width: 1200, height: 630, alt: 'ChatDock Blog' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — ChatDock',
    description: 'AI website chatbot guides and playbooks.',
    images: ['/images/social_graph_img.png'],
  },
}

const posts = [
  {
    slug: 'ai-website-chatbot',
    title: 'AI Website Chatbot for Lead Generation: The 2026 Playbook',
    description:
      'A practical guide to using an AI website chatbot to capture, qualify, and convert leads. Setup steps, prompts, KPIs, and best practices.',
    href: '/blogs/ai-website-chatbot',
    read: '12 min',
  },
  {
    slug: 'how-to-train-an-ai-website-chatbot-on-your-docs',
    title: 'How to Train an AI Website Chatbot on Your Docs (Step-by-Step)',
    description:
      'Connect sources, crawl pages, upload PDFs, structure a knowledge base, test prompts, and deploy with ChatDock.',
    href: '/blogs/how-to-train-an-ai-website-chatbot-on-your-docs',
    read: '10 min',
  },
  {
    slug: 'ai-chatbot-for-website',
    title: 'AI Chatbot for Website: Complete Guide (2026)',
    description:
      'Add an AI chatbot to your website in minutes. Improve conversions, qualify leads, and automate support with ChatDock.',
    href: '/blogs/ai-chatbot-for-website',
    read: '10 min',
  },
  {
    slug: 'no-code-ai-chatbot',
    title: 'No‑Code AI Chatbot: Launch in Minutes',
    description:
      'Create a no‑code AI chatbot that understands your content. Customize, embed, and measure performance with ChatDock.',
    href: '/blogs/no-code-ai-chatbot',
    read: '8 min',
  },
  {
    slug: 'customer-support-ai',
    title: 'Customer Support AI: Reduce Tickets, Delight Customers',
    description:
      'Automate first‑line support with an AI assistant trained on your docs. Learn setup, guardrails, and KPIs.',
    href: '/blogs/customer-support-ai',
    read: '9 min',
  },
  {
    slug: '24-7-ai-support',
    title: '24/7 AI Support: Always‑On Helpdesk for Your Website',
    description:
      'Deliver instant answers day and night. Configure guardrails, live handoff, and reporting with ChatDock.',
    href: '/blogs/24-7-ai-support',
    read: '7 min',
  },
  {
    slug: 'chatbot-trained-on-your-data',
    title: 'Chatbot Trained on Your Data: Accurate, On‑Brand Answers',
    description:
      'Use retrieval‑augmented generation to ground responses in your content. Learn setup and best practices.',
    href: '/blogs/chatbot-trained-on-your-data',
    read: '9 min',
  },
]

export default function BlogIndex() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        {/* Back button */}
        <Link
          href="/"
          className="group mb-10 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <header className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Field notes</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Build better client AI experiences.</h1>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            Practical guides for launching, testing, and improving website agents.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_24px_rgba(15,23,42,.03)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,.07)]"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{p.read} read</div>
              <h2 className="mt-5 text-xl font-semibold leading-7 text-slate-900">
                <Link href={p.href}>{p.title}</Link>
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">{p.description}</p>
              <div className="mt-6">
                <Link
                  href={p.href}
                  className="inline-flex items-center text-xs font-semibold text-indigo-600"
                >
                  Read guide →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
