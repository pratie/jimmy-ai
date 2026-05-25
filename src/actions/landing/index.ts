'use server'

import { scrapeWebsite, normalizeUrl } from '@/lib/firecrawl'
import { sanitizeKnowledgeBase } from '@/lib/chunking'

// Placeholder blog action
export const onGetBlogPost = async (id: string) => {
  try {
    return {
      id,
      title: 'Blog Post Title',
      content: '<p>Blog post content goes here...</p>',
      createdAt: new Date(),
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

/**
 * Scrapes any public website for a sandbox preview chatbot.
 * Gracefully falls back to mock context if Firecrawl fails or is unconfigured.
 */
export const onGeneratePreviewContext = async (rawUrl: string) => {
  try {
    if (!rawUrl || rawUrl.trim().length === 0) {
      return { status: 400, message: 'URL is required' }
    }

    const websiteUrl = normalizeUrl(rawUrl.trim())
    let domainName = 'your website'
    try {
      const parsed = new URL(websiteUrl)
      domainName = parsed.hostname.replace('www.', '')
    } catch (_) {}

    console.log('[Preview Scraper] Crawling website for sandbox:', websiteUrl)

    let scrapedMarkdown = ''
    let siteTitle = domainName
    let siteDescription = `AI assistant trained on ${domainName}`
    let isMockFallback = false

    try {
      const result = await scrapeWebsite({
        url: websiteUrl,
        onlyMainContent: true,
        formats: ['markdown'],
      })

      if (result.success && result.data?.markdown) {
        scrapedMarkdown = sanitizeKnowledgeBase(result.data.markdown)
        siteTitle = result.data.metadata?.title || domainName
        siteDescription = result.data.metadata?.description || `AI assistant trained on ${domainName}`
        console.log('[Preview Scraper] Firecrawl scraping succeeded! Length:', scrapedMarkdown.length)
      } else {
        throw new Error(result.error || 'Failed to extract site content')
      }
    } catch (scrapeError: any) {
      console.warn('[Preview Scraper] Firecrawl scraping failed, executing smart fallback:', scrapeError.message)
      isMockFallback = true

      // Smart simulated grounding context based on the URL domain
      scrapedMarkdown = `
# Welcome to ${siteTitle}!

We are a premium platform offering cutting-edge solutions customized to help your business grow.
Our services include expert strategy consulting, high-quality development, full-scale marketing, and optimized workflows designed for maximum efficiency.

## Frequently Asked Questions

### What are your pricing plans?
We offer flexible pricing options designed to scale with your business:
* **Starter Plan**: $19/month - Great for individuals and small builders.
* **Pro Plan**: $49/month - Perfect for growing teams and agencies. Includes advanced customization.
* **Business Plan**: $99/month - Unlimited power and volume for enterprises.

### How can I get started?
It is extremely easy to get started! Simply click the "Get Your Free Demo" or "Book Demo" buttons on our page, or register directly on our sign-up page to begin your automated customer success journey.

### Do you offer customer support?
Yes, we provide 24/7 customer support via email, chat widgets, and direct live support handoff whenever a human agent is needed to jump in!
      `.trim()
    }

    // Truncate to keep context size tight and fast for LLM streaming (approx 8000 characters)
    const MAX_PREVIEW_CHARS = 8000
    const truncatedMarkdown = scrapedMarkdown.length > MAX_PREVIEW_CHARS
      ? scrapedMarkdown.slice(0, MAX_PREVIEW_CHARS) + '\n\n[Content truncated for preview context...]'
      : scrapedMarkdown

    return {
      status: 200,
      message: isMockFallback ? 'Simulated training complete' : 'Website scraped successfully',
      data: {
        url: websiteUrl,
        title: siteTitle,
        description: siteDescription,
        context: truncatedMarkdown,
        isFallback: isMockFallback,
      }
    }
  } catch (error: any) {
    console.error('[Preview Scraper] Critical error:', error)
    return {
      status: 500,
      message: error.message || 'Failed to crawl website',
    }
  }
}