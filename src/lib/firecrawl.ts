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

  // Basic retry with exponential backoff for 429/5xx
  const maxRetries = 5
  const baseDelayMs = 1200

  let attempt = 0
  let lastError: any

  while (attempt <= maxRetries) {
    try {
      console.log('[Firecrawl] Scraping URL:', options.url, 'attempt', attempt + 1)

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
        // Specific error handling
        if (response.status === 402) {
          throw new Error('Firecrawl payment required. Please upgrade your plan.')
        }

        if (response.status === 429 || response.status >= 500) {
          // Read server-provided backoff if available
          const retryAfter = Number(response.headers.get('retry-after'))
          const delay = retryAfter && retryAfter > 0
            ? retryAfter * 1000
            : baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 250)

          if (attempt < maxRetries) {
            console.warn(`[Firecrawl] ${response.status} received. Backing off for ${delay}ms before retry...`)
            await new Promise((r) => setTimeout(r, delay))
            attempt++
            continue
          }
        }

        const errorText = await response.text()
        throw new Error(`Firecrawl API error (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      console.log('[Firecrawl] Scrape successful! Markdown length:', result.data?.markdown?.length || 0)
      return result
    } catch (error: any) {
      lastError = error
      // Only retry network errors if attempts remain
      const msg = String(error?.message || '')
      const retriable = /rate limit|429|fetch failed|network|timeout|ECONNRESET|ETIMEDOUT/i.test(msg)
      if (retriable && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 250)
        console.warn(`[Firecrawl] Retriable error: ${msg}. Waiting ${delay}ms then retry (${attempt + 1}/${maxRetries})...`)
        await new Promise((r) => setTimeout(r, delay))
        attempt++
        continue
      }
      console.error('[Firecrawl] Error:', msg)
      throw error
    }
  }

  // Should not reach here; surface last error
  throw lastError || new Error('Unknown Firecrawl error')
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

  const maxRetries = 4
  const baseDelayMs = 1000
  let attempt = 0
  let lastError: any

  while (attempt <= maxRetries) {
    try {
      console.log('[Firecrawl Map] Discovering URLs for:', options.url, 'attempt', attempt + 1)

      const response = await fetch(`${apiUrl}/map`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: options.url,
          limit: options.limit ?? 100,
          search: options.search,
        }),
      })

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('Firecrawl payment required. Please upgrade your plan.')
        }
        if (response.status === 429 || response.status >= 500) {
          const retryAfter = Number(response.headers.get('retry-after'))
          const delay = retryAfter && retryAfter > 0
            ? retryAfter * 1000
            : baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 250)
          if (attempt < maxRetries) {
            console.warn(`[Firecrawl Map] ${response.status} received. Backing off ${delay}ms...`)
            await new Promise((r) => setTimeout(r, delay))
            attempt++
            continue
          }
        }
        const errorText = await response.text()
        throw new Error(`Firecrawl Map API error (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      console.log('[Firecrawl Map] Discovered', result.links?.length || 0, 'URLs')
      return result
    } catch (error: any) {
      lastError = error
      const msg = String(error?.message || '')
      const retriable = /rate limit|429|fetch failed|network|timeout|ECONNRESET|ETIMEDOUT/i.test(msg)
      if (retriable && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 250)
        console.warn(`[Firecrawl Map] Retriable error: ${msg}. Waiting ${delay}ms then retry (${attempt + 1}/${maxRetries})...`)
        await new Promise((r) => setTimeout(r, delay))
        attempt++
        continue
      }
      console.error('[Firecrawl Map] Error:', msg)
      throw error
    }
  }
  throw lastError || new Error('Unknown Firecrawl Map error')
}
