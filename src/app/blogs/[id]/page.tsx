import { onGetBlogPost } from '@/actions/landing'
import { CardDescription } from '@/components/ui/card'
import { getMonthName } from '@/lib/utils'
import parse from 'html-react-parser'
import React from 'react'
import type { Metadata } from 'next'

// Helper to create a safe description from HTML content
const toSummary = (html: string | undefined, fallback: string): string => {
  try {
    if (!html) return fallback
    const text = html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.slice(0, 160) || fallback
  } catch {
    return fallback
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await onGetBlogPost(id)
  const title = post?.title || 'Blog Post'
  const description = toSummary(post?.content, `${title} — ChatDock AI`)

  return {
    title,
    description,
    alternates: { canonical: `/blogs/${id}` },
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: '/images/social_graph_img.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/social_graph_img.png'],
    },
  }
}

const PostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const post = await onGetBlogPost(id)
  console.log(parse(post?.content || ''))
  return (
    <div className="container flex justify-center my-10">
      <div className="lg:w-6/12 flex flex-col">
        <CardDescription>
          {getMonthName(post?.createdAt.getMonth()!)}{' '}
          {post?.createdAt.getDate()} {post?.createdAt.getFullYear()}
        </CardDescription>
        <h2 className="text-6xl font-bold">{post?.title}</h2>
        <div className="text-xl parsed-container flex flex-col mt-10 gap-10">
          {parse(post?.content || '')}
        </div>

        {/* Article JSON-LD for dynamic blog posts */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: post?.title || 'Blog Post',
              description: toSummary(post?.content, post?.title || 'Blog Post'),
              mainEntityOfPage: { '@type': 'WebPage', '@id': `/blogs/${id}` },
              author: { '@type': 'Organization', name: 'ChatDock AI' },
              datePublished: post?.createdAt?.toISOString?.() || undefined,
            }),
          }}
        />
      </div>
    </div>
  )
}

export default PostPage
