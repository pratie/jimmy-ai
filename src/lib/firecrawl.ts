// Firecrawl API Client for website scraping
// Converts any website into clean markdown for chatbot knowledge base

export interface FirecrawlScrapeOptions {
  url: string
  onlyMainContent?: boolean
  maxAge?: number
  formats?: ('markdown' | 'html' | 'rawHtml')[]
  parsers?: ('pdf')[]
}

export interface FirecrawlResponse {
  success: boolean
  data?: {
    markdown: string
    html?: string
    metadata: {
      title: string
      description: string
      language: string
      sourceURL: string
      statusCode: number
    }
    links?: string[]
  }
  error?: string
}

export const scrapeWebsite = async (
  options: FirecrawlScrapeOptions
): Promise<FirecrawlResponse> => {
  const apiKey = process.env.FIRECRAWL_API_KEY
  const apiUrl = process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev/v2'

  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY not configured in environment variables')
  }

  try {
    console.log('[Firecrawl] Scraping URL:', options.url)

    const response = await fetch(`${apiUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: options.url,
        onlyMainContent: options.onlyMainContent ?? true,
        maxAge: options.maxAge ?? 172800000, // 48 hours cache
        formats: options.formats ?? ['markdown'],
        parsers: options.parsers ?? ['pdf'],
        origin: 'website',
      }),
    })

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 402) {
        throw new Error('Firecrawl payment required. Please upgrade your plan.')
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.')
      }
      if (response.status === 500) {
        throw new Error('Firecrawl server error. Please try again later.')
      }

      const errorText = await response.text()
      throw new Error(`Firecrawl API error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    console.log('[Firecrawl] Scrape successful! Markdown length:', result.data?.markdown?.length || 0)

    return result
  } catch (error: any) {
    console.error('[Firecrawl] Error:', error.message)
    throw error
  }
}

// Helper: Truncate markdown for OpenAI context (max 3000 tokens ≈ 12000 chars)
export const truncateMarkdown = (markdown: string, maxChars = 12000): string => {
  if (markdown.length <= maxChars) return markdown

  // Try to cut at sentence boundary
  const truncated = markdown.slice(0, maxChars)
  const lastPeriod = truncated.lastIndexOf('.')

  if (lastPeriod > maxChars * 0.8) {
    return truncated.slice(0, lastPeriod + 1) + '\n\n[Content truncated for AI context...]'
  }

  return truncated + '\n\n[Content truncated for AI context...]'
}

// Helper: Validate URL format
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// Helper: Ensure URL has protocol
export const normalizeUrl = (domain: string): string => {
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    return domain
  }
  return `https://${domain}`
}

// Map Website: Discover all URLs from a website
export interface FirecrawlMapOptions {
  url: string
  limit?: number
  search?: string
}

export interface FirecrawlMapResponse {
  success: boolean
  links?: Array<{
    url: string
    title?: string
    description?: string
  }>
  error?: string
}

export const mapWebsite = async (
  options: FirecrawlMapOptions
): Promise<FirecrawlMapResponse> => {
  const apiKey = process.env.FIRECRAWL_API_KEY
  const apiUrl = process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev/v2'

  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY not configured in environment variables')
  }

  try {
    console.log('[Firecrawl Map] Discovering URLs for:', options.url)

    const response = await fetch(`${apiUrl}/map`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: options.url,
        limit: options.limit ?? 100, // Get up to 100 URLs
        search: options.search,
      }),
    })

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error('Firecrawl payment required. Please upgrade your plan.')
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.')
      }
      const errorText = await response.text()
      throw new Error(`Firecrawl Map API error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    console.log('[Firecrawl Map] Discovered', result.links?.length || 0, 'URLs')

    return result
  } catch (error: any) {
    console.error('[Firecrawl Map] Error:', error.message)
    throw error
  }
}