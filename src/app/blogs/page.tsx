import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — BookmyLead AI',
  description:
    'Guides and playbooks on AI website chatbots, lead generation, qualification, and deployment with BookmyLead AI.',
  alternates: { canonical: '/blogs' },
  openGraph: {
    title: 'Blog — BookmyLead AI',
    description:
      'Guides and playbooks on AI website chatbots, lead gen, and deployment.',
    type: 'website',
    images: [
      { url: '/images/social_graph_img.png', width: 1200, height: 630, alt: 'BookmyLead AI Blog' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — BookmyLead AI',
    description: 'AI website chatbot guides and playbooks.',
    images: ['/images/social_graph_img.png'],
  },
}

const posts = [
  {
    slug: 'ai-website-chatbot',
    title: 'AI Website Chatbot for Lead Generation: The 2025 Playbook',
    description:
      'A practical guide to using an AI website chatbot to capture, qualify, and convert leads. Setup steps, prompts, KPIs, and best practices.',
    href: '/blogs/ai-website-chatbot',
    read: '12 min',
  },
  {
    slug: 'how-to-train-an-ai-website-chatbot-on-your-docs',
    title: 'How to Train an AI Website Chatbot on Your Docs (Step-by-Step)',
    description:
      'Connect sources, crawl pages, upload PDFs, structure a knowledge base, test prompts, and deploy with BookmyLead AI.',
    href: '/blogs/how-to-train-an-ai-website-chatbot-on-your-docs',
    read: '10 min',
  },
]

export default function BlogIndex() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">Blog</h1>
          <p className="mt-3 text-brand-primary/75 text-lg">
            Guides and playbooks to help you deploy AI chatbots that convert.
          </p>
        </header>

        <div className="grid gap-6">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="rounded-2xl border-2 border-brand-base-300 bg-white dark:bg-black/40 p-6 hover:border-brand-accent/60 transition-all"
            >
              <h2 className="text-xl font-semibold text-brand-primary">
                <Link href={p.href}>{p.title}</Link>
              </h2>
              <p className="mt-2 text-brand-primary/70">{p.description}</p>
              <div className="mt-4 text-sm text-muted-foreground">{p.read} read</div>
              <div className="mt-4">
                <Link
                  href={p.href}
                  className="inline-flex items-center text-brand-primary hover:underline underline-offset-4"
                >
                  Read article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

