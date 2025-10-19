import type { MetadataRoute } from 'next'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://bookmylead.app').replace(/\/$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: `${APP_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${APP_URL}/chatbot`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    // Blog posts (static initial post)
    {
      url: `${APP_URL}/blogs/ai-website-chatbot`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${APP_URL}/blogs/how-to-train-an-ai-website-chatbot-on-your-docs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}
