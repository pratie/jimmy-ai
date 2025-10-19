import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Customer Support AI: Reduce Tickets, Delight Customers — BookmyLead AI',
  description:
    'Use Customer Support AI to automate FAQs, offer instant answers, and hand off complex chats to humans. Benchmarks, setup, and best practices.',
  keywords: ['customer support ai', 'ai support', 'support automation', 'knowledge base chatbot'],
  alternates: { canonical: '/blogs/customer-support-ai' },
  openGraph: {
    title: 'Customer Support AI: Reduce Tickets, Delight Customers — BookmyLead AI',
    description:
      'Automate first‑line support with an AI assistant trained on your docs. Learn setup, guardrails, and KPIs.',
    type: 'article',
    images: [{ url: '/images/social_graph_img.png', width: 1200, height: 630, alt: 'Customer Support AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer Support AI: Reduce Tickets, Delight Customers — BookmyLead AI',
    description: 'Automate FAQs and boost CSAT with AI trained on your docs.',
    images: ['/images/social_graph_img.png'],
  },
}

export default function BlogArticle() {
  return (
    <main className="min-h-screen">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-3xl bg-white dark:bg-black/40 backdrop-blur-md border-2 border-brand-base-300 rounded-3xl">
        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-brand-primary prose-a:text-brand-primary prose-a:underline prose-a:underline-offset-4 prose-strong:text-brand-primary/95 prose-li:marker:text-brand-accent">
          <header className="not-prose mb-8">
            <p className="text-sm text-muted-foreground">Guide • 9 min read</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">
              Customer Support AI: Reduce Tickets, Delight Customers
            </h1>
            <p className="mt-3 text-lg text-brand-primary/75">
              Automate first‑line support with accurate, on‑brand responses trained on your documentation and FAQs.
            </p>
          </header>

          <section>
            <h2>What Customer Support AI does</h2>
            <ul>
              <li>Resolves repetitive questions instantly, 24/7.</li>
              <li>Surfaces relevant articles and step‑by‑step help.</li>
              <li>Escalates complex tickets to human agents with context.</li>
              <li>Protects sensitive data with answer guardrails.</li>
            </ul>
          </section>

          <section>
            <h2>Setup with BookmyLead AI</h2>
            <ol>
              <li>Connect docs, FAQs, release notes, and tutorials.</li>
              <li>Enable Strict FAQ or Support mode for guardrails.</li>
              <li>Customize tone and link preferences.</li>
              <li>Enable live handoff for complex issues.</li>
            </ol>
          </section>

          <section>
            <h2>Support KPIs to monitor</h2>
            <ul>
              <li>Self‑serve resolution rate</li>
              <li>First response time (target &lt; 1s)</li>
              <li>Deflection vs. escalation rate</li>
              <li>CSAT for AI‑resolved conversations</li>
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
            <p>Related: <Link href="/blogs/chatbot-trained-on-your-data">Chatbot trained on your data</Link>.</p>
          </section>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Customer Support AI: Reduce Tickets, Delight Customers',
            description:
              'Use Customer Support AI to automate FAQs, offer instant answers, and hand off complex chats to humans. Benchmarks, setup, and best practices.',
            mainEntityOfPage: { '@type': 'WebPage', '@id': '/blogs/customer-support-ai' },
            author: { '@type': 'Organization', name: 'BookmyLead AI' },
          }),
        }}
      />
    </main>
  )
}

