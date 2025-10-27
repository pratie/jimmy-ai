'use server'

import { client } from '@/lib/prisma'
import { scrapeWebsite, normalizeUrl, mapWebsite } from '@/lib/firecrawl'
import { chunkContent, validateContent } from '@/lib/chunking'
import { generateEmbeddings } from '@/lib/embeddings'
import { countTokens, groupByTokenBudget } from '@/lib/tokens'
import { getPlanLimits } from '@/lib/plans'
import { extractTextFromPDF, isValidPDF, cleanPDFText } from '@/lib/pdf-extractor'

export const onScrapeWebsiteForDomain = async (domainId: string) => {
  try {
    console.log('[Firecrawl] Starting scrape for domain:', domainId)

    // Get domain info with plan limits
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        name: true,
        trainingSourcesUsed: true,
        knowledgeBaseSizeMB: true,
        chatBot: { select: { id: true, knowledgeBase: true } },
        User: {
          select: {
            subscription: { select: { plan: true } }
          }
        }
      },
    })

    if (!domain) {
      return { status: 404, message: 'Domain not found' }
    }

    if (!domain.chatBot?.id) {
      return { status: 404, message: 'ChatBot not found for this domain' }
    }

    const plan = domain.User?.subscription?.plan || 'FREE'
    const limits = getPlanLimits(plan)

    // ENFORCEMENT: Check training sources limit (only if KB is empty or this is first scrape)
    // Smart logic: Allow re-scraping same domain without counting as new source
    const isFirstScrape = !domain.chatBot.knowledgeBase || domain.chatBot.knowledgeBase.trim().length === 0

    if (isFirstScrape) {
      const newSourceCount = domain.trainingSourcesUsed + 1
      if (limits.trainingSources !== Infinity && newSourceCount > limits.trainingSources) {
        return {
          status: 400,
          message: `Training sources limit reached. Your ${plan} plan allows ${limits.trainingSources} sources. You currently have ${domain.trainingSourcesUsed} sources. Please upgrade your plan to add more training sources.`,
          upgradeRequired: true,
          limit: limits.trainingSources,
          current: domain.trainingSourcesUsed,
          attempted: newSourceCount
        }
      }
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

    const sizeMB = result.data.markdown.length / (1024 * 1024)

    // ENFORCEMENT: Check KB size limit
    if (sizeMB > limits.knowledgeBaseMB) {
      await client.chatBot.update({
        where: { id: domain.chatBot.id },
        data: { knowledgeBaseStatus: 'failed' },
      })
      return {
        status: 400,
        message: `Knowledge base size limit reached. Your ${plan} plan allows ${limits.knowledgeBaseMB} MB. This scrape would be ${sizeMB.toFixed(2)} MB. Please upgrade your plan.`,
        upgradeRequired: true,
        limit: limits.knowledgeBaseMB,
        attempted: sizeMB
      }
    }

    // Store knowledge base
    await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        knowledgeBase: result.data.markdown,
        knowledgeBaseUpdatedAt: new Date(),
        knowledgeBaseStatus: 'scraped',
      },
    })

    // Update counters (increment source count only on first scrape, always update size)
    await client.domain.update({
      where: { id: domainId },
      data: {
        trainingSourcesUsed: isFirstScrape ? { increment: 1 } : domain.trainingSourcesUsed,
        knowledgeBaseSizeMB: sizeMB  // Replace with actual size
      }
    })

    return {
      status: 200,
      message: isFirstScrape
        ? 'Website scraped successfully! Knowledge base created.'
        : 'Website re-scraped successfully! Knowledge base updated.',
      data: {
        markdownLength: result.data.markdown.length,
        sizeMB: sizeMB.toFixed(2),
        title: result.data.metadata.title,
        description: result.data.metadata.description,
        isFirstScrape
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
            // Embedding status fields are intentionally not exposed here
            // to keep this endpoint focused on KB status
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

// Embedding progress/status for training UI
export const onGetEmbeddingStatus = async (domainId: string) => {
  try {
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        chatBot: {
          select: {
            embeddingStatus: true,
            embeddingProgress: true,
            embeddingChunksTotal: true,
            embeddingChunksProcessed: true,
            hasEmbeddings: true,
            embeddingCompletedAt: true,
            knowledgeBaseUpdatedAt: true,
          },
        },
      },
    })

    if (!domain?.chatBot) {
      return { status: 404, message: 'ChatBot not found' }
    }

    const cb = domain.chatBot
    return {
      status: 200,
      data: {
        status: cb.embeddingStatus || 'not_started',
        progress: cb.embeddingProgress || 0,
        total: cb.embeddingChunksTotal || 0,
        processed: cb.embeddingChunksProcessed || 0,
        hasEmbeddings: !!cb.hasEmbeddings,
        completedAt: cb.embeddingCompletedAt || null,
        kbUpdatedAt: cb.knowledgeBaseUpdatedAt || null,
      },
    }
  } catch (error) {
    console.error('[RAG] Error getting embedding status:', error)
    return { status: 500, message: 'Failed to get embedding status' }
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

export const onTrainChatbot = async (domainId: string, force: boolean = false) => {
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
            knowledgeBaseUpdatedAt: true,
            hasEmbeddings: true,
            embeddingCompletedAt: true,
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

    // Skip if already up to date and not forced
    const { knowledgeBaseUpdatedAt, hasEmbeddings, embeddingCompletedAt } = domain.chatBot
    const upToDate = !!hasEmbeddings && !!embeddingCompletedAt && !!knowledgeBaseUpdatedAt && embeddingCompletedAt >= knowledgeBaseUpdatedAt
    if (upToDate && !force) {
      return {
        status: 200,
        message: 'Chatbot already trained and up to date',
        data: { skipped: true },
      }
    }

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

    // Step 3: Generate embeddings in batches with token-aware grouping
    const MAX_TOKENS_PER_REQUEST = Number(process.env.EMBEDDINGS_MAX_TOKENS_PER_REQUEST || 8000)
    const CONCURRENT_INSERTS = 10
    const batches: string[][] = groupByTokenBudget(chunks, MAX_TOKENS_PER_REQUEST)

    let processedCount = 0
    for (const batch of batches) {
      let embeddings: number[][]
      try {
        embeddings = await generateEmbeddings(batch)
      } catch (e: any) {
        // Fallback: if provider still complains about tokens, split the batch and retry
        if (batch.length > 1) {
          const mid = Math.floor(batch.length / 2)
          const parts = [batch.slice(0, mid), batch.slice(mid)]
          for (const sub of parts) {
            const subEmbeddings = await generateEmbeddings(sub)
            for (let j = 0; j < sub.length; j += CONCURRENT_INSERTS) {
              const insertBatch = sub.slice(j, j + CONCURRENT_INSERTS)
              const insertPromises = insertBatch.map(async (content, idx) => {
                const embedding = subEmbeddings[j + idx]
                const vectorString = `[${embedding.join(',')}]`
                return client.$executeRaw`
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
              })
              await Promise.all(insertPromises)
            }
            processedCount += sub.length
          }
          const progress = Math.round((processedCount / chunks.length) * 100)
          if (processedCount % 100 === 0 || processedCount === chunks.length) {
            await client.chatBot.update({
              where: { id: chatBotId },
              data: {
                embeddingProgress: progress,
                embeddingChunksProcessed: processedCount,
              },
            })
          }
          console.log(`[RAG] Progress: ${processedCount}/${chunks.length} chunks (${progress}%)`)
          continue
        }
        throw e
      }

      for (let j = 0; j < batch.length; j += CONCURRENT_INSERTS) {
        const insertBatch = batch.slice(j, j + CONCURRENT_INSERTS)
        const insertPromises = insertBatch.map(async (content, idx) => {
          const embedding = embeddings[j + idx]
          const vectorString = `[${embedding.join(',')}]`
          return client.$executeRaw`
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
        })
        await Promise.all(insertPromises)
      }

      processedCount += batch.length
      const progress = Math.round((processedCount / chunks.length) * 100)
      if (processedCount % 100 === 0 || processedCount === chunks.length) {
        await client.chatBot.update({
          where: { id: chatBotId },
          data: {
            embeddingProgress: progress,
            embeddingChunksProcessed: processedCount,
          },
        })
      }
      console.log(`[RAG] Progress: ${processedCount}/${chunks.length} chunks (${progress}%)`)
    }

    // Step 4: Mark as completed
    await client.chatBot.update({
      where: { id: chatBotId },
      data: {
        embeddingStatus: 'completed',
        embeddingProgress: 100,
        embeddingCompletedAt: new Date(),
        hasEmbeddings: true, // ✅ Set flag for instant embedding checks
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
      select: {
        knowledgeBaseSizeMB: true,
        trainingSourcesUsed: true,
        chatBot: { select: { id: true, knowledgeBase: true } },
        User: {
          select: {
            subscription: { select: { plan: true } }
          }
        }
      },
    })

    if (!domain?.chatBot?.id) {
      return { status: 404, message: 'ChatBot not found' }
    }

    const plan = domain.User?.subscription?.plan || 'FREE'
    const limits = getPlanLimits(plan)

    // ENFORCEMENT: Check training sources limit (count as 1 source)
    const newSourceCount = domain.trainingSourcesUsed + 1
    if (limits.trainingSources !== Infinity && newSourceCount > limits.trainingSources) {
      return {
        status: 400,
        message: `Training sources limit reached. Your ${plan} plan allows ${limits.trainingSources} sources. You currently have ${domain.trainingSourcesUsed} sources. Please upgrade your plan to add more training sources.`,
        upgradeRequired: true,
        limit: limits.trainingSources,
        current: domain.trainingSourcesUsed,
        attempted: newSourceCount
      }
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

    // ENFORCEMENT: Check KB size limit
    const newSizeMB = finalContent.length / (1024 * 1024)
    if (newSizeMB > limits.knowledgeBaseMB) {
      return {
        status: 400,
        message: `Knowledge base size limit reached. Your ${plan} plan allows ${limits.knowledgeBaseMB} MB. This content would be ${newSizeMB.toFixed(2)} MB. Please upgrade your plan or reduce the content size.`,
        upgradeRequired: true,
        limit: limits.knowledgeBaseMB,
        attempted: newSizeMB
      }
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

    // Update counters (increment source count, replace size)
    await client.domain.update({
      where: { id: domainId },
      data: {
        trainingSourcesUsed: { increment: 1 },
        knowledgeBaseSizeMB: newSizeMB  // Replace with actual size
      }
    })

    return {
      status: 200,
      message: append ? 'Text appended to knowledge base successfully!' : 'Knowledge base updated successfully!',
      data: {
        totalLength: finalContent.length,
        sizeMB: newSizeMB.toFixed(2)
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

// Discover all URLs from a website using Firecrawl Map
export const onDiscoverTrainingSources = async (domainId: string) => {
  try {
    console.log('[Firecrawl] Discovering training sources for domain:', domainId)

    // Get domain info and user plan
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        name: true,
        trainingSourcesUsed: true,
        User: {
          select: {
            subscription: { select: { plan: true } }
          }
        }
      },
    })

    if (!domain) {
      return { status: 404, message: 'Domain not found' }
    }

    const plan = domain.User?.subscription?.plan || 'FREE'
    const limits = getPlanLimits(plan)

    // Normalize URL
    const websiteUrl = normalizeUrl(domain.name)

    // Discover all URLs using Firecrawl Map
    const result = await mapWebsite({
      url: websiteUrl,
      limit: 100, // Get up to 100 URLs to choose from
    })

    if (!result.success || !result.links) {
      return {
        status: 400,
        message: 'Failed to discover URLs from website',
      }
    }

    return {
      status: 200,
      message: 'URLs discovered successfully',
      data: {
        urls: result.links,
        plan,
        limit: limits.trainingSources,
        currentUsage: domain.trainingSourcesUsed,
        remaining: limits.trainingSources === Infinity
          ? Infinity
          : limits.trainingSources - domain.trainingSourcesUsed
      },
    }
  } catch (error: any) {
    console.error('[Firecrawl] Discover error:', error)
    return {
      status: 500,
      message: error.message || 'Failed to discover URLs',
    }
  }
}

// Scrape multiple selected URLs and enforce limits
export const onScrapeSelectedSources = async (
  domainId: string,
  selectedUrls: string[]
) => {
  try {
    console.log('[Firecrawl] Scraping', selectedUrls.length, 'selected sources')

    // Small pacing between URLs to avoid hitting Firecrawl rate limits too quickly
    const INTER_URL_DELAY_MS = Number(process.env.FIRECRAWL_INTER_URL_DELAY_MS || 1500)
    let scrapeIndex = 0

    // Get domain and plan info
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        trainingSourcesUsed: true,
        knowledgeBaseSizeMB: true,
        chatBot: { select: { id: true } },
        User: {
          select: {
            subscription: { select: { plan: true } }
          }
        }
      },
    })

    if (!domain?.chatBot?.id) {
      return { status: 404, message: 'ChatBot not found' }
    }

    const plan = domain.User?.subscription?.plan || 'FREE'
    const limits = getPlanLimits(plan)

    // ENFORCEMENT: Check training sources limit
    const newSourceCount = domain.trainingSourcesUsed + selectedUrls.length
    if (limits.trainingSources !== Infinity && newSourceCount > limits.trainingSources) {
      return {
        status: 400,
        message: `Training sources limit reached. Your ${plan} plan allows ${limits.trainingSources} sources. You currently have ${domain.trainingSourcesUsed} sources. Selecting ${selectedUrls.length} more would exceed your limit.`,
        upgradeRequired: true,
        limit: limits.trainingSources,
        current: domain.trainingSourcesUsed,
        attempted: newSourceCount
      }
    }

    // Update status to scraping
    await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: { knowledgeBaseStatus: 'scraping' },
    })

    // Scrape each URL
    const scrapedContent: Array<{ url: string; markdown: string; size: number }> = []
    let totalSizeMB = 0

    for (const url of selectedUrls) {
      try {
        // Delay between scrapes (skip before the first URL)
        if (scrapeIndex > 0 && INTER_URL_DELAY_MS > 0) {
          await new Promise((r) => setTimeout(r, INTER_URL_DELAY_MS))
        }
        scrapeIndex += 1
        console.log('[Firecrawl] Scraping:', url)

        const result = await scrapeWebsite({
          url,
          onlyMainContent: true,
          formats: ['markdown'],
        })

        if (result.success && result.data?.markdown) {
          const sizeMB = result.data.markdown.length / (1024 * 1024)

          // ENFORCEMENT: Check KB size limit
          if (domain.knowledgeBaseSizeMB + totalSizeMB + sizeMB > limits.knowledgeBaseMB) {
            await client.chatBot.update({
              where: { id: domain.chatBot.id },
              data: { knowledgeBaseStatus: 'failed' },
            })
            return {
              status: 400,
              message: `Knowledge base size limit reached. Your ${plan} plan allows ${limits.knowledgeBaseMB} MB. Current usage: ${domain.knowledgeBaseSizeMB.toFixed(2)} MB. This scrape would add ${(totalSizeMB + sizeMB).toFixed(2)} MB, exceeding your limit.`,
              upgradeRequired: true,
              limit: limits.knowledgeBaseMB,
              current: domain.knowledgeBaseSizeMB,
              attempted: domain.knowledgeBaseSizeMB + totalSizeMB + sizeMB
            }
          }

          scrapedContent.push({
            url,
            markdown: result.data.markdown,
            size: sizeMB
          })
          totalSizeMB += sizeMB
        }
      } catch (error) {
        console.error(`[Firecrawl] Failed to scrape ${url}:`, error)
        // Continue with other URLs
      }
    }

    if (scrapedContent.length === 0) {
      await client.chatBot.update({
        where: { id: domain.chatBot.id },
        data: { knowledgeBaseStatus: 'failed' },
      })
      return {
        status: 400,
        message: 'Failed to scrape any of the selected URLs',
      }
    }

    // Combine all markdown content with source attribution
    const combinedMarkdown = scrapedContent
      .map(c => `<!-- Source: ${c.url} -->\n\n${c.markdown}`)
      .join('\n\n---\n\n')

    // Store knowledge base
    await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        knowledgeBase: combinedMarkdown,
        knowledgeBaseUpdatedAt: new Date(),
        knowledgeBaseStatus: 'scraped',
      },
    })

    // Update counters (replace size since KB is replaced, increment sources)
    await client.domain.update({
      where: { id: domainId },
      data: {
        trainingSourcesUsed: { increment: scrapedContent.length },
        knowledgeBaseSizeMB: totalSizeMB  // Replace with actual size (KB is replaced, not appended)
      }
    })

    return {
      status: 200,
      message: `Successfully scraped ${scrapedContent.length} source(s)`,
      data: {
        sourcesScraped: scrapedContent.length,
        totalSizeMB: totalSizeMB.toFixed(2),
        urls: scrapedContent.map(c => c.url)
      },
    }
  } catch (error: any) {
    console.error('[Firecrawl] Multi-scrape error:', error)

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
      message: error.message || 'Failed to scrape sources',
    }
  }
}

// Upload PDF file and extract text
export const onUploadPDFKnowledgeBase = async (
  domainId: string,
  fileBuffer: Buffer,
  filename: string,
  append: boolean = true
) => {
  try {
    console.log('[PDF Upload] Processing PDF for domain:', domainId, 'File:', filename)

    // Get domain and plan info
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        knowledgeBaseSizeMB: true,
        trainingSourcesUsed: true,
        chatBot: { select: { id: true, knowledgeBase: true } },
        User: {
          select: {
            subscription: { select: { plan: true } }
          }
        }
      },
    })

    if (!domain?.chatBot?.id) {
      return { status: 404, message: 'ChatBot not found' }
    }

    const plan = domain.User?.subscription?.plan || 'FREE'
    const limits = getPlanLimits(plan)

    // Validate PDF file
    if (!isValidPDF(fileBuffer)) {
      return {
        status: 400,
        message: 'Invalid PDF file. Please upload a valid PDF document.',
      }
    }

    // Extract text from PDF
    console.log('[PDF Upload] Extracting text from PDF...')
    const pdfResult = await extractTextFromPDF(fileBuffer)

    if (!pdfResult.text || pdfResult.text.trim().length === 0) {
      return {
        status: 400,
        message: 'Could not extract text from PDF. The PDF might be image-based or encrypted.',
      }
    }

    // Clean extracted text
    const cleanedText = cleanPDFText(pdfResult.text)

    console.log('[PDF Upload] Extracted', cleanedText.length, 'characters from', pdfResult.pages, 'pages')

    // Validate content
    const validation = validateContent(cleanedText)
    if (!validation.valid) {
      return { status: 400, message: validation.error }
    }

    // Prepare final content with metadata
    const pdfMetadata = `<!-- PDF: ${filename} | ${pdfResult.pages} pages${pdfResult.metadata?.title ? ` | Title: ${pdfResult.metadata.title}` : ''} -->\n\n`
    let finalContent = pdfMetadata + cleanedText

    if (append && domain.chatBot.knowledgeBase) {
      finalContent = `${domain.chatBot.knowledgeBase}\n\n---\n\n${finalContent}`
    }

    // ENFORCEMENT: Check KB size limit
    const newSizeMB = finalContent.length / (1024 * 1024)
    if (newSizeMB > limits.knowledgeBaseMB) {
      return {
        status: 400,
        message: `Knowledge base size limit reached. Your ${plan} plan allows ${limits.knowledgeBaseMB} MB. This PDF would make the total ${newSizeMB.toFixed(2)} MB. Please upgrade your plan or reduce content size.`,
        upgradeRequired: true,
        limit: limits.knowledgeBaseMB,
        attempted: newSizeMB
      }
    }

    // ENFORCEMENT: Check training sources limit (count PDF as 1 source)
    const newSourceCount = domain.trainingSourcesUsed + 1
    if (limits.trainingSources !== Infinity && newSourceCount > limits.trainingSources) {
      return {
        status: 400,
        message: `Training sources limit reached. Your ${plan} plan allows ${limits.trainingSources} sources. You currently have ${domain.trainingSourcesUsed} sources.`,
        upgradeRequired: true,
        limit: limits.trainingSources,
        current: domain.trainingSourcesUsed
      }
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

    // Update counters (replace size with actual size, increment sources)
    await client.domain.update({
      where: { id: domainId },
      data: {
        knowledgeBaseSizeMB: newSizeMB,  // Replace with actual size
        trainingSourcesUsed: { increment: 1 }
      }
    })

    return {
      status: 200,
      message: `PDF uploaded successfully! Extracted ${cleanedText.length} characters from ${pdfResult.pages} pages.`,
      data: {
        pages: pdfResult.pages,
        charactersExtracted: cleanedText.length,
        sizeMB: newSizeMB.toFixed(2),
        filename,
        metadata: pdfResult.metadata
      },
    }
  } catch (error: any) {
    console.error('[PDF Upload] Error:', error)
    return {
      status: 500,
      message: error.message || 'Failed to process PDF file',
    }
  }
}

// Clear knowledge base content (keeps source counter to prevent abuse)
export const onClearKnowledgeBase = async (domainId: string) => {
  try {
    console.log('[RAG] Clearing knowledge base for domain:', domainId)

    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        trainingSourcesUsed: true,
        chatBot: { select: { id: true } }
      },
    })

    if (!domain?.chatBot?.id) {
      return { status: 404, message: 'ChatBot not found' }
    }

    // Clear knowledge base content and embeddings
    await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        knowledgeBase: null,
        knowledgeBaseUpdatedAt: null,
        knowledgeBaseStatus: 'pending',
        embeddingStatus: 'not_started',
        embeddingProgress: 0,
        embeddingChunksTotal: null,
        embeddingChunksProcessed: null,
        embeddingCompletedAt: null,
        hasEmbeddings: false,
      },
    })

    // Delete all knowledge chunks (embeddings)
    await client.knowledgeChunk.deleteMany({
      where: { chatBotId: domain.chatBot.id }
    })

    // Reset KB size only (KEEP trainingSourcesUsed to prevent abuse)
    await client.domain.update({
      where: { id: domainId },
      data: {
        // trainingSourcesUsed: UNCHANGED (permanent counter, prevents abuse)
        knowledgeBaseSizeMB: 0  // Reset size so user can re-train with same sources
      }
    })

    return {
      status: 200,
      message: `Knowledge base cleared successfully! You have used ${domain.trainingSourcesUsed} training source(s). You can re-train with different content from the same sources.`,
      data: {
        trainingSourcesUsed: domain.trainingSourcesUsed
      }
    }
  } catch (error: any) {
    console.error('[RAG] Clear KB error:', error)
    return {
      status: 500,
      message: error.message || 'Failed to clear knowledge base',
    }
  }
}
