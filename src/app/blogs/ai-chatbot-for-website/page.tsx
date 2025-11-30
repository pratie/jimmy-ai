import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Chatbot for Website: Complete Guide (2025) — BookmyLead AI',
  description:
    'Learn how to add an AI chatbot to your website: benefits, setup steps, lead capture, support automation, KPIs, and best practices using BookmyLead AI.',
  keywords: [
    'ai chatbot for website',
    'website chatbot',
    'ai website assistant',
    'lead generation chatbot',
    'customer support chatbot',
  ],
  alternates: { canonical: '/blogs/ai-chatbot-for-website' },
  openGraph: {
    title: 'AI Chatbot for Website: Complete Guide (2025) — BookmyLead AI',
    description:
      'Add an AI chatbot to your website in minutes. Improve conversions, qualify leads, and automate support with BookmyLead AI.',
    type: 'article',
    images: [{ url: '/images/social_graph_img.png', width: 1200, height: 630, alt: 'AI Chatbot for Website' }],
    url: '/blogs/ai-chatbot-for-website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chatbot for Website: Complete Guide (2025) — BookmyLead AI',
    description: 'Benefits, setup, KPIs, and best practices to deploy an AI website chatbot.',
    images: ['/images/social_graph_img.png'],
  },
}

export default function BlogArticle() {
  return (
    <main className="min-h-screen">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-3xl bg-white dark:bg-black/40 backdrop-blur-md border-2 border-brand-base-300 rounded-3xl">
        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-brand-primary prose-a:text-brand-primary prose-a:underline prose-a:underline-offset-4 prose-strong:text-brand-primary/95 prose-li:marker:text-brand-accent">
          <header className="not-prose mb-8">
            <p className="text-sm text-muted-foreground">Guide • 10 min read</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">
              AI Chatbot for Website: Complete Guide (2025)
            </h1>
            <p className="mt-3 text-lg text-brand-primary/75">
              Everything you need to launch an AI chatbot on your website: conversion wins, setup steps, implementation options, KPIs, and best practices.
            </p>
          </header>

          <section>
            <h2>Why add an AI chatbot to your website?</h2>
            <ul>
              <li><strong>Higher conversion:</strong> capture visitors who won’t fill forms.</li>
              <li><strong>Faster answers:</strong> reduce bounce with instant, relevant replies.</li>
              <li><strong>24/7 availability:</strong> qualify and book meetings after hours.</li>
              <li><strong>Lower support cost:</strong> automate FAQs and first‑line support.</li>
            </ul>
          </section>

          <section>
            <h2>How it works with BookmyLead AI</h2>
            <ol>
              <li><strong>Train on your data:</strong> crawl your site, upload docs/FAQs.</li>
              <li><strong>Choose a mode:</strong> Sales, Support, Qualifier, or Strict FAQ.</li>
              <li><strong>Customize:</strong> brand tone, colors, greeting, and prompts.</li>
              <li><strong>Embed:</strong> paste one line of code on your website.</li>
              <li><strong>Measure:</strong> track engage rate, email capture, meetings set.</li>
            </ol>
          </section>

          <section>
            <h2>Implementation options</h2>
            <ul>
              <li><strong>No‑code:</strong> use the provided embed to go live in minutes.</li>
              <li><strong>RAG accuracy:</strong> vector search over your content avoids hallucination.</li>
              <li><strong>Guardrails:</strong> restrict answers to your documentation.</li>
              <li><strong>Live handoff:</strong> switch to a human agent when needed.</li>
            </ul>
          </section>

          <section>
            <h2>Suggested KPIs</h2>
            <ul>
              <li>Engagement rate: 5–12% of visitors</li>
              <li>Email capture rate: 20–40% of engaged</li>
              <li>Meeting set rate: 20–35% of qualified</li>
              <li>First response time: &lt; 1s</li>
            </ul>
          </section>

          <section>
            <h2>Best practices</h2>
            <ul>
              <li>Use a short greeting and one clear CTA.</li>
              <li>Proactive trigger on Pricing/Docs and exit‑intent.</li>
              <li>Ask 2–3 qualification questions before long answers.</li>
              <li>Keep answers grounded in your content with citations.</li>
            </ul>
          </section>

          <section className="not-prose mt-10">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center rounded-lg bg-main text-black font-medium px-6 py-3 border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              Start for free →
            </Link>
          </section>

          <section className="mt-10 text-sm text-muted-foreground">
            <p>Also read: <Link href="/blogs/how-to-train-an-ai-website-chatbot-on-your-docs">How to train an AI website chatbot on your docs</Link>.</p>
          </section>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'AI Chatbot for Website: Complete Guide (2025)',
            description:
              'Learn how to add an AI chatbot to your website: benefits, setup steps, lead capture, support automation, KPIs, and best practices using BookmyLead AI.',
            mainEntityOfPage: { '@type': 'WebPage', '@id': '/blogs/ai-chatbot-for-website' },
            author: { '@type': 'Organization', name: 'BookmyLead AI' },
          }),
        }}
      />
    </main>
  )
}

