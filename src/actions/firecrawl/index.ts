'use server'

import { client } from '@/lib/prisma'
import { scrapeWebsite, normalizeUrl } from '@/lib/firecrawl'

export const onScrapeWebsiteForDomain = async (domainId: string) => {
  try {
    console.log('[Firecrawl] Starting scrape for domain:', domainId)

    // Get domain info
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        name: true,
        chatBot: { select: { id: true } },
      },
    })

    if (!domain) {
      return { status: 404, message: 'Domain not found' }
    }

    if (!domain.chatBot?.id) {
      return { status: 404, message: 'ChatBot not found for this domain' }
    }

    // Update status to scraping
    await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: { knowledgeBaseStatus: 'scraping' },
    })

    // Normalize URL (add https:// if missing)
    const websiteUrl = normalizeUrl(domain.name)
    console.log('[Firecrawl] Scraping URL:', websiteUrl)

    // Scrape website
    const result = await scrapeWebsite({
      url: websiteUrl,
      onlyMainContent: true,
      formats: ['markdown'],
    })

    if (!result.success || !result.data?.markdown) {
      await client.chatBot.update({
        where: { id: domain.chatBot.id },
        data: { knowledgeBaseStatus: 'failed' },
      })
      return {
        status: 400,
        message: result.error || 'Failed to scrape website. Please check if the website is accessible.',
      }
    }

    console.log('[Firecrawl] Scrape successful! Markdown length:', result.data.markdown.length)

    // Store knowledge base
    await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        knowledgeBase: result.data.markdown,
        knowledgeBaseUpdatedAt: new Date(),
        knowledgeBaseStatus: 'scraped',
      },
    })

    return {
      status: 200,
      message: 'Website scraped successfully! Knowledge base updated.',
      data: {
        markdownLength: result.data.markdown.length,
        title: result.data.metadata.title,
        description: result.data.metadata.description,
      },
    }
  } catch (error: any) {
    console.error('[Firecrawl] Error:', error)

    // Update status to failed
    try {
      const domain = await client.domain.findUnique({
        where: { id: domainId },
        select: { chatBot: { select: { id: true } } },
      })

      if (domain?.chatBot?.id) {
        await client.chatBot.update({
          where: { id: domain.chatBot.id },
          data: { knowledgeBaseStatus: 'failed' },
        })
      }
    } catch (updateError) {
      console.error('[Firecrawl] Failed to update status:', updateError)
    }

    return {
      status: 500,
      message: error.message || 'Failed to scrape website. Please try again.',
    }
  }
}

export const onGetKnowledgeBaseStatus = async (domainId: string) => {
  try {
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        chatBot: {
          select: {
            knowledgeBase: true,
            knowledgeBaseStatus: true,
            knowledgeBaseUpdatedAt: true,
          },
        },
      },
    })

    if (!domain?.chatBot) {
      return { status: 404, message: 'ChatBot not found' }
    }

    return {
      status: 200,
      data: {
        hasKnowledgeBase: !!domain.chatBot.knowledgeBase,
        status: domain.chatBot.knowledgeBaseStatus,
        updatedAt: domain.chatBot.knowledgeBaseUpdatedAt,
        markdownLength: domain.chatBot.knowledgeBase?.length || 0,
      },
    }
  } catch (error) {
    console.error('[Firecrawl] Error getting status:', error)
    return { status: 500, message: 'Failed to get knowledge base status' }
  }
}

export const onUpdateKnowledgeBase = async (domainId: string, markdown: string) => {
  try {
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: { chatBot: { select: { id: true } } },
    })

    if (!domain?.chatBot?.id) {
      return { status: 404, message: 'ChatBot not found' }
    }

    await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        knowledgeBase: markdown,
        knowledgeBaseUpdatedAt: new Date(),
      },
    })

    return {
      status: 200,
      message: 'Knowledge base updated successfully',
    }
  } catch (error: any) {
    console.error('[Firecrawl] Error updating knowledge base:', error)
    return {
      status: 500,
      message: error.message || 'Failed to update knowledge base',
    }
  }
}