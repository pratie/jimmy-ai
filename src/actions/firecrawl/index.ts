'use server'

import { mapWebsite, normalizeUrl, scrapeWebsite } from '@/lib/firecrawl'
import { extractTextFromPDF, isValidPDF, cleanPDFText } from '@/lib/pdf-extractor'
import { client } from '@/lib/prisma'
import { requireWorkspace } from '@/lib/tenant'
import {
  assertEntitlement,
  checkEntitlement,
  EntitlementError,
  recordUsage,
} from '@/lib/entitlements'
import { AuthorizationError } from '@/lib/permissions'
import {
  clearKnowledge,
  createSource,
  deleteSource,
  finishCrawlJob,
  getKnowledgeStatus,
  indexSource,
  startCrawlJob,
  upsertDocument,
} from '@/lib/knowledge/ingest'
import { devError } from '@/lib/utils'

/**
 * Knowledge ingestion actions.
 *
 * Thin by design: everything substantive lives in `@/lib/knowledge/ingest`, so
 * the crawl → extract → embed pipeline can be tested outside a server action,
 * and so replacing Firecrawl touches one module instead of ten call sites. The
 * previous version of this file was ~1000 lines with the pipeline inlined.
 *
 * Parameters are still named for the UI's vocabulary; the value passed is a
 * ClientWorkspace id.
 */

async function knowledgeContext(workspaceId: string) {
  const { ctx, access } = await requireWorkspace(workspaceId, 'manageKnowledge')
  return {
    clientWorkspaceId: access.clientWorkspaceId,
    organizationId: ctx.organizationId,
    userId: ctx.userId,
  }
}

function toResponse(error: unknown, fallback: string) {
  if (error instanceof EntitlementError) return { status: 402, message: error.message }
  if (error instanceof AuthorizationError) return { status: 403, message: error.message }
  devError(`[Knowledge] ${fallback}:`, error)
  return { status: 400, message: fallback }
}

/* ── Website ────────────────────────────────────────────────────────────── */

export const onScrapeWebsiteForDomain = async (workspaceId: string, url: string) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    await assertEntitlement(scope.organizationId, 'monthly_crawl_pages')

    const target = normalizeUrl(url)
    const source = await createSource({
      ...scope,
      sourceType: 'website',
      name: target,
      originalUrl: target,
    })

    const job = await startCrawlJob({
      knowledgeSourceId: source.id,
      clientWorkspaceId: scope.clientWorkspaceId,
      userId: scope.userId,
      configuration: { url: target, mode: 'single-page' },
    })

    const result = await scrapeWebsite({ url: target, onlyMainContent: true, formats: ['markdown'] })

    if (!result.success || !result.data?.markdown) {
      await finishCrawlJob(job.id, {
        pagesDiscovered: 1,
        pagesProcessed: 0,
        pagesFailed: 1,
        errorCode: 'scrape_failed',
        errorMessage: result.error ?? 'No readable content',
      })
      await client.knowledgeSource.update({
        where: { id: source.id },
        data: { syncStatus: 'failed', status: 'failed' },
      })
      return {
        status: 400,
        message:
          'We could not read enough public content from this website. Try another URL, or upload a document instead.',
      }
    }

    const { documentId } = await upsertDocument({
      knowledgeSourceId: source.id,
      clientWorkspaceId: scope.clientWorkspaceId,
      canonicalUrl: target,
      title: result.data.metadata?.title ?? target,
      text: result.data.markdown,
    })

    await finishCrawlJob(job.id, { pagesDiscovered: 1, pagesProcessed: 1, pagesFailed: 0 })
    await recordUsage({
      organizationId: scope.organizationId,
      clientWorkspaceId: scope.clientWorkspaceId,
      eventType: 'crawl_page',
      quantity: 1,
      unit: 'page',
      provider: 'firecrawl',
      idempotencyKey: `crawl-${job.id}-1`,
    })

    const indexed = await indexSource({
      knowledgeSourceId: source.id,
      clientWorkspaceId: scope.clientWorkspaceId,
      organizationId: scope.organizationId,
      documentIds: [documentId],
    })

    return {
      status: 200,
      message: 'Website content added',
      sourceId: source.id,
      chunksCreated: indexed.chunksCreated,
    }
  } catch (error) {
    return toResponse(error, 'Could not read that website')
  }
}

/** Lists the pages a site exposes so the operator can choose what to train on. */
export const onDiscoverTrainingSources = async (workspaceId: string, url: string) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    const remaining = await checkEntitlement(scope.organizationId, 'monthly_crawl_pages', 0)

    const target = normalizeUrl(url)
    const mapped = await mapWebsite({ url: target })

    if (!mapped.success || !mapped.links?.length) {
      return { status: 400, message: 'No pages could be discovered for that website', pages: [] }
    }

    return {
      status: 200,
      pages: mapped.links.slice(0, 200),
      totalDiscovered: mapped.links.length,
      // Surfaced so the UI can stop an operator selecting more pages than the
      // plan allows, instead of failing them halfway through a crawl.
      remainingPageBudget:
        remaining.limit === null ? mapped.links.length : Number(remaining.remaining),
    }
  } catch (error) {
    return { ...toResponse(error, 'Could not discover pages'), pages: [] }
  }
}

/**
 * Crawls a chosen set of pages. Partial success is a first-class outcome —
 * pages that fail are counted and reported, and the rest are still indexed.
 */
export const onScrapeSelectedSources = async (workspaceId: string, urls: string[]) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    if (urls.length === 0) return { status: 400, message: 'No pages selected' }

    await assertEntitlement(scope.organizationId, 'monthly_crawl_pages', urls.length)

    const root = normalizeUrl(urls[0])
    let hostname = root
    try {
      hostname = new URL(root).hostname
    } catch {
      /* keep the raw value if it will not parse */
    }

    const source = await createSource({
      ...scope,
      sourceType: 'website',
      name: hostname,
      originalUrl: root,
    })

    const job = await startCrawlJob({
      knowledgeSourceId: source.id,
      clientWorkspaceId: scope.clientWorkspaceId,
      userId: scope.userId,
      configuration: { pageCount: urls.length, mode: 'selected-pages' },
    })

    const changedDocuments: string[] = []
    let processed = 0
    let failed = 0

    for (const pageUrl of urls) {
      try {
        const result = await scrapeWebsite({
          url: pageUrl,
          onlyMainContent: true,
          formats: ['markdown'],
        })
        if (!result.success || !result.data?.markdown) {
          failed += 1
          continue
        }

        const { documentId, changed } = await upsertDocument({
          knowledgeSourceId: source.id,
          clientWorkspaceId: scope.clientWorkspaceId,
          canonicalUrl: pageUrl,
          title: result.data.metadata?.title ?? pageUrl,
          text: result.data.markdown,
        })
        // Unchanged pages skip embedding — that is where the cost lives.
        if (changed) changedDocuments.push(documentId)
        processed += 1
      } catch (error) {
        devError('[Knowledge] page failed:', pageUrl, error)
        failed += 1
      }
    }

    const crawlStatus = await finishCrawlJob(job.id, {
      pagesDiscovered: urls.length,
      pagesProcessed: processed,
      pagesFailed: failed,
    })

    if (processed > 0) {
      await recordUsage({
        organizationId: scope.organizationId,
        clientWorkspaceId: scope.clientWorkspaceId,
        eventType: 'crawl_page',
        quantity: processed,
        unit: 'page',
        provider: 'firecrawl',
        idempotencyKey: `crawl-${job.id}`,
      })
    }

    if (processed === 0) return { status: 400, message: 'None of the selected pages could be read' }

    const indexed = await indexSource({
      knowledgeSourceId: source.id,
      clientWorkspaceId: scope.clientWorkspaceId,
      organizationId: scope.organizationId,
      documentIds: changedDocuments.length ? changedDocuments : undefined,
    })

    return {
      status: 200,
      message:
        failed === 0
          ? `Added ${processed} pages`
          : `Added ${processed} pages; ${failed} could not be read`,
      sourceId: source.id,
      pagesProcessed: processed,
      pagesFailed: failed,
      chunksCreated: indexed.chunksCreated,
      crawlStatus,
    }
  } catch (error) {
    return toResponse(error, 'Could not add the selected pages')
  }
}

/* ── Manual text & files ────────────────────────────────────────────────── */

export const onUploadTextKnowledgeBase = async (
  workspaceId: string,
  name: string,
  text: string
) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    if (!text.trim()) return { status: 400, message: 'No text provided' }

    const source = await createSource({ ...scope, sourceType: 'manual_text', name })
    const { documentId } = await upsertDocument({
      knowledgeSourceId: source.id,
      clientWorkspaceId: scope.clientWorkspaceId,
      canonicalUrl: `manual://${source.id}`,
      title: name,
      text,
    })

    const indexed = await indexSource({
      knowledgeSourceId: source.id,
      clientWorkspaceId: scope.clientWorkspaceId,
      organizationId: scope.organizationId,
      documentIds: [documentId],
    })

    return { status: 200, message: 'Text added', chunksCreated: indexed.chunksCreated }
  } catch (error) {
    return toResponse(error, 'Could not add that text')
  }
}

export const onUploadPDFKnowledgeBase = async (
  workspaceId: string,
  fileName: string,
  base64: string
) => {
  try {
    const scope = await knowledgeContext(workspaceId)

    const buffer = Buffer.from(base64, 'base64')
    if (!isValidPDF(buffer)) return { status: 400, message: 'That file is not a readable PDF' }

    await assertEntitlement(scope.organizationId, 'storage_bytes', buffer.byteLength)

    const extracted = await extractTextFromPDF(buffer)
    const text = cleanPDFText(extracted?.text ?? '')
    if (!text.trim()) {
      return {
        status: 400,
        message: 'No text could be extracted — the PDF may be a scan without OCR.',
      }
    }

    const source = await createSource({
      ...scope,
      sourceType: 'uploaded_file',
      name: fileName,
      mimeType: 'application/pdf',
    })

    const { documentId } = await upsertDocument({
      knowledgeSourceId: source.id,
      clientWorkspaceId: scope.clientWorkspaceId,
      canonicalUrl: `file://${source.id}/${fileName}`,
      title: fileName,
      text,
    })

    await recordUsage({
      organizationId: scope.organizationId,
      clientWorkspaceId: scope.clientWorkspaceId,
      eventType: 'file_processed',
      quantity: 1,
      unit: 'file',
      idempotencyKey: `file-${source.id}`,
    })
    await recordUsage({
      organizationId: scope.organizationId,
      clientWorkspaceId: scope.clientWorkspaceId,
      eventType: 'storage_used',
      quantity: buffer.byteLength,
      unit: 'byte',
      idempotencyKey: `storage-${source.id}`,
    })

    const indexed = await indexSource({
      knowledgeSourceId: source.id,
      clientWorkspaceId: scope.clientWorkspaceId,
      organizationId: scope.organizationId,
      documentIds: [documentId],
    })

    return { status: 200, message: 'Document added', chunksCreated: indexed.chunksCreated }
  } catch (error) {
    return toResponse(error, 'Could not process that document')
  }
}

/* ── Status & maintenance ───────────────────────────────────────────────── */

export const onGetKnowledgeBaseStatus = async (workspaceId: string) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'viewClientWorkspace')
    return { status: 200, ...(await getKnowledgeStatus(access.clientWorkspaceId)) }
  } catch {
    return { status: 400, sources: [], chunkCount: 0, hasEmbeddings: false }
  }
}

export const onGetEmbeddingStatus = async (workspaceId: string) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'viewClientWorkspace')
    const knowledge = await getKnowledgeStatus(access.clientWorkspaceId)
    return {
      status: 200,
      hasEmbeddings: knowledge.hasEmbeddings,
      chunkCount: knowledge.chunkCount,
      embeddingStatus: knowledge.lastIndex?.status ?? 'not_started',
      chunksCreated: knowledge.lastIndex?.chunksCreated ?? 0,
      chunksFailed: knowledge.lastIndex?.chunksFailed ?? 0,
      completedAt: knowledge.lastIndex?.completedAt ?? null,
    }
  } catch {
    return { status: 400, hasEmbeddings: false, chunkCount: 0, embeddingStatus: 'unknown' }
  }
}

/** Re-embeds everything for a workspace, e.g. after an embedding model change. */
export const onTrainChatbot = async (workspaceId: string) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    const sources = await client.knowledgeSource.findMany({
      where: { clientWorkspaceId: scope.clientWorkspaceId, deletedAt: null, status: 'active' },
      select: { id: true },
    })
    if (sources.length === 0) {
      return { status: 400, message: 'Add a website or document before training' }
    }

    let chunksCreated = 0
    let chunksFailed = 0
    for (const source of sources) {
      const result = await indexSource({
        knowledgeSourceId: source.id,
        clientWorkspaceId: scope.clientWorkspaceId,
        organizationId: scope.organizationId,
      })
      chunksCreated += result.chunksCreated
      chunksFailed += result.chunksFailed
    }

    return {
      status: chunksCreated > 0 ? 200 : 400,
      message:
        chunksCreated > 0
          ? `Trained on ${sources.length} sources (${chunksCreated} passages)`
          : 'Training produced no usable passages',
      chunksCreated,
      chunksFailed,
    }
  } catch (error) {
    return toResponse(error, 'Training failed')
  }
}

export const onUpdateKnowledgeBase = async (workspaceId: string, _content: string) =>
  onTrainChatbot(workspaceId)

export const onDeleteKnowledgeSource = async (workspaceId: string, sourceId: string) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    const source = await client.knowledgeSource.findFirst({
      where: { id: sourceId, clientWorkspaceId: scope.clientWorkspaceId },
      select: { id: true },
    })
    if (!source) return { status: 404, message: 'Source not found' }

    await deleteSource(source.id)
    return { status: 200, message: 'Source removed' }
  } catch (error) {
    return toResponse(error, 'Could not remove that source')
  }
}

export const onClearKnowledgeBase = async (workspaceId: string) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    await clearKnowledge(scope.clientWorkspaceId)
    return { status: 200, message: 'Knowledge base cleared' }
  } catch (error) {
    return toResponse(error, 'Could not clear the knowledge base')
  }
}
