import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Chatbot Trained on Your Data: Accurate, On‑Brand Answers — BookmyLead AI',
  description:
    'Deploy a chatbot trained on your data using RAG. Connect your site and docs, control guardrails, and deliver accurate, sourced answers with BookmyLead AI.',
  keywords: ['chatbot trained on your data', 'rag chatbot', 'vector search chatbot', 'ai knowledge base'],
  alternates: { canonical: '/blogs/chatbot-trained-on-your-data' },
  openGraph: {
    title: 'Chatbot Trained on Your Data: Accurate, On‑Brand Answers — BookmyLead AI',
    description:
      'Use retrieval‑augmented generation to ground responses in your content. Learn setup and best practices.',
    type: 'article',
    images: [{ url: '/images/social_graph_img.png', width: 1200, height: 630, alt: 'Chatbot Trained on Your Data' }],
    url: '/blogs/chatbot-trained-on-your-data',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chatbot Trained on Your Data: Accurate, On‑Brand Answers — BookmyLead AI',
    description: 'Ground answers in your docs with RAG. Setup and best practices.',
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
              Chatbot Trained on Your Data: Accurate, On‑Brand Answers
            </h1>
            <p className="mt-3 text-lg text-brand-primary/75">
              Ground every response in your content with retrieval‑augmented generation (RAG) backed by vector search.
            </p>
          </header>

          <section>
            <h2>Why training on your data matters</h2>
            <ul>
              <li>Answers reflect your exact product and policies.</li>
              <li>Consistency with brand tone and documentation.</li>
              <li>Lower risk of hallucinations with source grounding.</li>
            </ul>
          </section>

          <section>
            <h2>How BookmyLead AI implements RAG</h2>
            <ol>
              <li>Ingest: crawl website, upload PDFs, add FAQs.</li>
              <li>Chunk & embed: generate vector embeddings per chunk.</li>
              <li>Retrieve: match relevant chunks per query.</li>
              <li>Generate: craft concise answers with sources.</li>
            </ol>
          </section>

          <section>
            <h2>Guardrails and governance</h2>
            <ul>
              <li>Restrict responses to approved sources.</li>
              <li>Prefer links to authoritative pages.</li>
              <li>Version and refresh content regularly.</li>
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
            headline: 'Chatbot Trained on Your Data: Accurate, On‑Brand Answers',
            description:
              'Deploy a chatbot trained on your data using RAG. Connect your site and docs, control guardrails, and deliver accurate, sourced answers with BookmyLead AI.',
            mainEntityOfPage: { '@type': 'WebPage', '@id': '/blogs/chatbot-trained-on-your-data' },
            author: { '@type': 'Organization', name: 'BookmyLead AI' },
          }),
        }}
      />
    </main>
  )
}

