import type { MetadataRoute } from 'next'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://bookmylead.app').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/portal/',
          '/preview/',
          '/debug-domains',
          '/test-',
          '/_next/',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL.replace(/^https?:\/\//, ''),
  }
}
