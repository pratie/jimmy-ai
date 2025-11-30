import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '24/7 AI Support: Always‑On Helpdesk for Your Website — BookmyLead AI',
  description:
    'Offer 24/7 AI support on your website. Learn setup, routing, SLAs, and KPIs to deliver instant answers and seamless handoffs with BookmyLead AI.',
  keywords: ['24/7 ai support', 'always-on support', 'website support ai', 'ai helpdesk'],
  alternates: { canonical: '/blogs/24-7-ai-support' },
  openGraph: {
    title: '24/7 AI Support: Always‑On Helpdesk for Your Website — BookmyLead AI',
    description:
      'Deliver instant answers day and night. Configure guardrails, live handoff, and reporting with BookmyLead AI.',
    type: 'article',
    images: [{ url: '/images/social_graph_img.png', width: 1200, height: 630, alt: '24/7 AI Support' }],
    url: '/blogs/24-7-ai-support',
  },
  twitter: {
    card: 'summary_large_image',
    title: '24/7 AI Support: Always‑On Helpdesk for Your Website — BookmyLead AI',
    description: 'Instant responses, better SLAs, and smart routing using AI.',
    images: ['/images/social_graph_img.png'],
  },
}

export default function BlogArticle() {
  return (
    <main className="min-h-screen">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-3xl bg-white dark:bg-black/40 backdrop-blur-md border-2 border-brand-base-300 rounded-3xl">
        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-brand-primary prose-a:text-brand-primary prose-a:underline prose-a:underline-offset-4 prose-strong:text-brand-primary/95 prose-li:marker:text-brand-accent">
          <header className="not-prose mb-8">
            <p className="text-sm text-muted-foreground">Guide • 7 min read</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">
              24/7 AI Support: Always‑On Helpdesk for Your Website
            </h1>
            <p className="mt-3 text-lg text-brand-primary/75">
              Provide instant answers around the clock and route complex issues to humans with full context.
            </p>
          </header>

          <section>
            <h2>Benefits of 24/7 AI support</h2>
            <ul>
              <li>Reduce wait times to near‑zero.</li>
              <li>Improve SLAs and customer satisfaction.</li>
              <li>Capture off‑hours leads and intent.</li>
              <li>Lower support costs without sacrificing quality.</li>
            </ul>
          </section>

          <section>
            <h2>Key configuration tips</h2>
            <ul>
              <li>Enable guardrails to keep answers grounded in your docs.</li>
              <li>Set handoff rules: trigger live agent for billing or account‑specific questions.</li>
              <li>Use triggers on Pricing, Docs, and exit‑intent pages.</li>
              <li>Monitor KPIs: TTFT, resolution rate, and escalation %.</li>
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
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: '24/7 AI Support: Always‑On Helpdesk for Your Website',
            description:
              'Offer 24/7 AI support on your website. Learn setup, routing, SLAs, and KPIs to deliver instant answers and seamless handoffs with BookmyLead AI.',
            mainEntityOfPage: { '@type': 'WebPage', '@id': '/blogs/24-7-ai-support' },
            author: { '@type': 'Organization', name: 'BookmyLead AI' },
          }),
        }}
      />
    </main>
  )
}

