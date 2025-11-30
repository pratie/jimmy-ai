import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Train an AI Website Chatbot on Your Docs (Step-by-Step)',
  description:
    'Step-by-step guide to train an AI website chatbot on your documentation: connect sources, crawl pages, upload PDFs, structure a knowledge base, test prompts, and deploy with BookmyLead AI.',
  keywords: [
    'train ai chatbot website',
    'knowledge base',
    'ai website chatbot',
    'lead generation chatbot',
  ],
  alternates: {
    canonical: '/blogs/how-to-train-an-ai-website-chatbot-on-your-docs',
  },
  openGraph: {
    title: 'How to Train an AI Website Chatbot on Your Docs (Step-by-Step)',
    description:
      'A practical setup guide: connect sources, crawl your site, upload PDFs, organize knowledge, test prompts, and deploy with BookmyLead AI.',
    type: 'article',
    url: '/blogs/how-to-train-an-ai-website-chatbot-on-your-docs',
    images: [
      {
        url: '/images/social_graph_img.png',
        width: 1200,
        height: 630,
        alt: 'Train an AI Website Chatbot on Your Docs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Train an AI Website Chatbot on Your Docs (Step-by-Step)',
    description:
      'A practical setup guide for training an AI website chatbot on your documentation with BookmyLead AI.',
    images: ['/images/social_graph_img.png'],
  },
}

export default function BlogArticle() {
  return (
    <main className="min-h-screen">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-3xl bg-white dark:bg-black/40 backdrop-blur-md border-2 border-brand-base-300 rounded-3xl">
        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-brand-primary prose-a:text-brand-primary prose-a:underline prose-a:underline-offset-4 prose-strong:text-brand-primary/95 prose-li:marker:text-brand-accent prose-img:rounded-2xl">
          <header className="not-prose mb-8">
            <p className="text-sm text-muted-foreground">Guide • 10 min read</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">
              How to Train an AI Website Chatbot on Your Docs (Step-by-Step)
            </h1>
            <p className="mt-3 text-lg text-brand-primary/75">
              A practical setup guide: connect sources, crawl your site, upload PDFs, organize a knowledge base, test prompts, and deploy—using BookmyLead AI.
            </p>
          </header>

          <section>
            <h2>What you’ll achieve</h2>
            <p>
              By the end, your chatbot will answer product questions from your documentation, qualify
              visitors, and hand off sales‑ready leads to booking or your CRM—without human delay.
            </p>
          </section>

          <section>
            <h2>Prerequisites</h2>
            <ul>
              <li>Website or docs with up‑to‑date content</li>
              <li>PDFs/FAQs or knowledge base articles (optional)</li>
              <li>A BookmyLead AI account</li>
            </ul>
          </section>

          <section>
            <h2>Step 1 — Prepare high‑quality sources</h2>
            <p>
              Consolidate your best content: docs, FAQs, pricing, onboarding guides, and security pages.
              Remove outdated or contradictory sections. Clear, current content is the biggest lift on
              answer accuracy.
            </p>
          </section>

          <section>
            <h2>Step 2 — Connect your website and docs</h2>
            <p>
              In BookmyLead AI, add your root domain and key doc sections. Choose a crawl depth that
              includes product, pricing, and integration pages. Avoid crawling changelogs or noisy
              content. You can add exclusions to keep the knowledge base tight.
            </p>
          </section>

          <section>
            <h2>Step 3 — Upload PDFs and files</h2>
            <p>
              Upload PDFs such as case studies, whitepapers, and security overviews. The system will
              parse text and merge it into your knowledge base.
            </p>
          </section>

          <section>
            <h2>Step 4 — Organize your knowledge base</h2>
            <ul>
              <li>Group content by topic (e.g., Pricing, Security, Integrations, Onboarding).</li>
              <li>Keep private/internal docs separate if you don’t want them exposed.</li>
              <li>Favor single‑source truths over duplicated content.</li>
            </ul>
          </section>

          <section>
            <h2>Step 5 — Tune response style and guardrails</h2>
            <p>
              Pick a mode: Sales, Support, Lead Qualifier, or Strict FAQ. Set tone, length, and link
              preference. Enable “grounded answers only” to avoid speculation and keep responses sourced
              from your content.
            </p>
          </section>

          <section>
            <h2>Step 6 — Capture leads and route handoffs</h2>
            <ul>
              <li>Collect name, email, company, and use case.</li>
              <li>Gate advanced answers until email is captured if lead quality matters more than volume.</li>
              <li>Offer instant booking with your calendar link and sync to your CRM.</li>
            </ul>
          </section>

          <section>
            <h2>Step 7 — Test with realistic prompts</h2>
            <ul>
              <li>“Does this integrate with HubSpot and Google Calendar?”</li>
              <li>“What’s the difference between Starter and Team plans?”</li>
              <li>“How do I embed the chatbot on my website?”</li>
              <li>“Where can I find your security documentation?”</li>
            </ul>
            <p>Refine sources or answers until responses are concise, accurate, and linked to docs.</p>
          </section>

          <section>
            <h2>Step 8 — Deploy to your website</h2>
            <p>
              Paste the one‑line embed on your site. Enable proactive triggers on Pricing and Docs pages
              or on exit‑intent to maximize engagement.
            </p>
          </section>

          <section>
            <h2>Suggested KPIs</h2>
            <ul>
              <li>First response time: &lt; 1s</li>
              <li>Engagement rate: 5–12% of visitors</li>
              <li>Email capture rate: 20–40% of engaged</li>
              <li>Meeting set rate: 20–35% of qualified</li>
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
            <p>
              You may also like: <Link href="/blogs/ai-website-chatbot">AI Website Chatbot for Lead Generation: The 2025 Playbook</Link>.
            </p>
          </section>
        </div>
      </article>

      {/* Article JSON‑LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'How to Train an AI Website Chatbot on Your Docs (Step-by-Step)',
            description:
              'Step-by-step guide to train an AI website chatbot on your documentation: connect sources, crawl pages, upload PDFs, structure a knowledge base, test prompts, and deploy with BookmyLead AI.',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': '/blogs/how-to-train-an-ai-website-chatbot-on-your-docs',
            },
            author: {
              '@type': 'Organization',
              name: 'BookmyLead AI',
            },
          }),
        }}
      />
    </main>
  )
}
