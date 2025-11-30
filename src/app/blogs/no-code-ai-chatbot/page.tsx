import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'No‑Code AI Chatbot: Launch in Minutes — BookmyLead AI',
  description:
    'Build a no‑code AI chatbot without engineering. Train on your site and docs, customize tone, embed a single line of code, and start capturing leads.',
  keywords: ['no-code ai chatbot', 'no code chatbot', 'website chatbot', 'ai website assistant'],
  alternates: { canonical: '/blogs/no-code-ai-chatbot' },
  openGraph: {
    title: 'No‑Code AI Chatbot: Launch in Minutes — BookmyLead AI',
    description:
      'Create a no‑code AI chatbot that understands your content. Customize, embed, and measure performance with BookmyLead AI.',
    type: 'article',
    images: [{ url: '/images/social_graph_img.png', width: 1200, height: 630, alt: 'No-Code AI Chatbot' }],
    url: '/blogs/no-code-ai-chatbot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'No‑Code AI Chatbot: Launch in Minutes — BookmyLead AI',
    description: 'No engineering required. Train, customize, and embed instantly.',
    images: ['/images/social_graph_img.png'],
  },
}

export default function BlogArticle() {
  return (
    <main className="min-h-screen">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-3xl bg-white dark:bg-black/40 backdrop-blur-md border-2 border-brand-base-300 rounded-3xl">
        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-brand-primary prose-a:text-brand-primary prose-a:underline prose-a:underline-offset-4 prose-strong:text-brand-primary/95 prose-li:marker:text-brand-accent">
          <header className="not-prose mb-8">
            <p className="text-sm text-muted-foreground">Guide • 8 min read</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">
              No‑Code AI Chatbot: Launch in Minutes
            </h1>
            <p className="mt-3 text-lg text-brand-primary/75">
              Build a no‑code AI chatbot that understands your website and documentation—no developers required.
            </p>
          </header>

          <section>
            <h2>What you can build without code</h2>
            <ul>
              <li>Lead‑gen chatbot that captures email and books calls.</li>
              <li>Customer support assistant that answers FAQs 24/7.</li>
              <li>Product guide that links relevant docs and pages.</li>
            </ul>
          </section>

          <section>
            <h2>Setup with BookmyLead AI</h2>
            <ol>
              <li>Connect your site and upload PDFs/FAQs.</li>
              <li>Pick a mode: Sales, Support, Qualifier, or Strict FAQ.</li>
              <li>Customize tone, colors, greeting, and prompts.</li>
              <li>Embed using a single script tag.</li>
            </ol>
          </section>

          <section>
            <h2>Why no‑code works now</h2>
            <ul>
              <li>Modern RAG keeps answers accurate and on‑brand.</li>
              <li>Streaming responses feel instant for users.</li>
              <li>Analytics show real conversion impact.</li>
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
            <p>Next, read: <Link href="/blogs/ai-website-chatbot">AI Website Chatbot for Lead Generation</Link>.</p>
          </section>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'No‑Code AI Chatbot: Launch in Minutes',
            description:
              'Build a no‑code AI chatbot without engineering. Train on your site and docs, customize tone, embed a single line of code, and start capturing leads.',
            mainEntityOfPage: { '@type': 'WebPage', '@id': '/blogs/no-code-ai-chatbot' },
            author: { '@type': 'Organization', name: 'BookmyLead AI' },
          }),
        }}
      />
    </main>
  )
}

