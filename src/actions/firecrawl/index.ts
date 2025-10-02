'use server'

import { client } from '@/lib/prisma'
import { scrapeWebsite, normalizeUrl } from '@/lib/firecrawl'
import { chunkContent, validateContent } from '@/lib/chunking'
import { generateEmbeddings } from '@/lib/embeddings'

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

export const onTrainChatbot = async (domainId: string) => {
  try {
    console.log('[RAG] Starting chatbot training for domain:', domainId)

    // Get domain and chatbot info
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        chatBot: {
          select: {
            id: true,
            knowledgeBase: true,
          },
        },
      },
    })

    if (!domain?.chatBot) {
      return { status: 404, message: 'ChatBot not found for this domain' }
    }

    if (!domain.chatBot.knowledgeBase) {
      return {
        status: 400,
        message: 'No knowledge base found. Please scrape a website first.',
      }
    }

    const chatBotId = domain.chatBot.id

    // Validate content
    const validation = validateContent(domain.chatBot.knowledgeBase)
    if (!validation.valid) {
      return { status: 400, message: validation.error }
    }

    // Update status to processing
    await client.chatBot.update({
      where: { id: chatBotId },
      data: {
        embeddingStatus: 'processing',
        embeddingProgress: 0,
      },
    })

    console.log('[RAG] Chunking content...')

    // Step 1: Chunk the content
    const chunks = await chunkContent(domain.chatBot.knowledgeBase)

    if (chunks.length === 0) {
      await client.chatBot.update({
        where: { id: chatBotId },
        data: { embeddingStatus: 'failed' },
      })
      return { status: 400, message: 'Failed to chunk content' }
    }

    // Update total chunks
    await client.chatBot.update({
      where: { id: chatBotId },
      data: {
        embeddingChunksTotal: chunks.length,
        embeddingChunksProcessed: 0,
      },
    })

    console.log(`[RAG] Created ${chunks.length} chunks. Generating embeddings...`)

    // Step 2: Delete existing chunks for this chatbot (retrain scenario)
    await client.knowledgeChunk.deleteMany({
      where: { chatBotId },
    })

    // Step 3: Generate embeddings in batches (OpenAI has rate limits)
    const BATCH_SIZE = 50
    let processedCount = 0

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)

      // Generate embeddings for this batch
      const embeddings = await generateEmbeddings(batch)

      // Store chunks with embeddings using raw SQL (Prisma doesn't support vector type)
      for (let j = 0; j < batch.length; j++) {
        const content = batch[j]
        const embedding = embeddings[j]

        // Convert embedding array to PostgreSQL vector format: [0.1,0.2,0.3,...]
        const vectorString = `[${embedding.join(',')}]`

        await client.$executeRaw`
          INSERT INTO "KnowledgeChunk" (
            "domainId", "chatBotId", content, embedding, "sourceType", "createdAt", "updatedAt"
          ) VALUES (
            ${domainId}::uuid,
            ${chatBotId}::uuid,
            ${content},
            ${vectorString}::vector,
            'firecrawl',
            NOW(),
            NOW()
          )
        `
      }

      processedCount += batch.length
      const progress = Math.round((processedCount / chunks.length) * 100)

      // Update progress
      await client.chatBot.update({
        where: { id: chatBotId },
        data: {
          embeddingProgress: progress,
          embeddingChunksProcessed: processedCount,
        },
      })

      console.log(`[RAG] Progress: ${processedCount}/${chunks.length} chunks (${progress}%)`)
    }

    // Step 4: Mark as completed
    await client.chatBot.update({
      where: { id: chatBotId },
      data: {
        embeddingStatus: 'completed',
        embeddingProgress: 100,
        embeddingCompletedAt: new Date(),
      },
    })

    console.log('[RAG] ✅ Training completed successfully!')

    return {
      status: 200,
      message: 'Chatbot trained successfully!',
      data: {
        chunksProcessed: chunks.length,
        embeddingsCreated: chunks.length,
      },
    }
  } catch (error: any) {
    console.error('[RAG] Training error:', error)

    // Update status to failed
    try {
      const domain = await client.domain.findUnique({
        where: { id: domainId },
        select: { chatBot: { select: { id: true } } },
      })

      if (domain?.chatBot?.id) {
        await client.chatBot.update({
          where: { id: domain.chatBot.id },
          data: { embeddingStatus: 'failed' },
        })
      }
    } catch (updateError) {
      console.error('[RAG] Failed to update status:', updateError)
    }

    return {
      status: 500,
      message: error.message || 'Failed to train chatbot. Please try again.',
    }
  }
}

export const onUploadTextKnowledgeBase = async (domainId: string, text: string, append: boolean = true) => {
  try {
    console.log('[RAG] Uploading text knowledge base for domain:', domainId)

    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: { chatBot: { select: { id: true, knowledgeBase: true } } },
    })

    if (!domain?.chatBot?.id) {
      return { status: 404, message: 'ChatBot not found' }
    }

    // Validate content
    const validation = validateContent(text)
    if (!validation.valid) {
      return { status: 400, message: validation.error }
    }

    // Prepare final content
    let finalContent = text
    if (append && domain.chatBot.knowledgeBase) {
      finalContent = `${domain.chatBot.knowledgeBase}\n\n---\n\n${text}`
    }

    // Update knowledge base
    await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        knowledgeBase: finalContent,
        knowledgeBaseUpdatedAt: new Date(),
        knowledgeBaseStatus: 'scraped',
      },
    })

    return {
      status: 200,
      message: append ? 'Text appended to knowledge base successfully!' : 'Knowledge base updated successfully!',
      data: {
        totalLength: finalContent.length,
      },
    }
  } catch (error: any) {
    console.error('[RAG] Upload text error:', error)
    return {
      status: 500,
      message: error.message || 'Failed to upload text',
    }
  }
}