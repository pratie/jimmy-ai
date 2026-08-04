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

/** The client's primary website URL, for actions that can infer their target. */
async function primaryWebsiteUrl(clientWorkspaceId: string): Promise<string> {
  const website = await client.website.findFirst({
    where: { clientWorkspaceId, deletedAt: null },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    select: { url: true, canonicalDomain: true },
  })
  const workspace = await client.clientWorkspace.findUnique({
    where: { id: clientWorkspaceId },
    select: { websiteUrl: true, name: true },
  })

  const target = website?.url ?? website?.canonicalDomain ?? workspace?.websiteUrl ?? workspace?.name
  if (!target) throw new Error('This client has no website on file')
  return target
}

function toResponse(error: unknown, fallback: string) {
  // `upgradeRequired` lets the UI show an upgrade prompt instead of a generic
  // failure when the wall is the plan rather than a bug.
  if (error instanceof EntitlementError) {
    return { status: 402, message: error.message, upgradeRequired: true }
  }
  if (error instanceof AuthorizationError) {
    return { status: 403, message: error.message, upgradeRequired: false }
  }
  devError(`[Knowledge] ${fallback}:`, error)
  return { status: 400, message: fallback, upgradeRequired: false }
}

/* ── Website ────────────────────────────────────────────────────────────── */

export const onScrapeWebsiteForDomain = async (workspaceId: string, url?: string) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    await assertEntitlement(scope.organizationId, 'monthly_crawl_pages')

    // The caller may omit the URL, in which case the client's own primary
    // website is used — that is the common case from the knowledge panel.
    const target = normalizeUrl(url ?? (await primaryWebsiteUrl(scope.clientWorkspaceId)))
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
export const onDiscoverTrainingSources = async (workspaceId: string, url?: string) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    const remaining = await checkEntitlement(scope.organizationId, 'monthly_crawl_pages', 0)

    const target = normalizeUrl(url ?? (await primaryWebsiteUrl(scope.clientWorkspaceId)))
    const mapped = await mapWebsite({ url: target })

    if (!mapped.success || !mapped.links?.length) {
      return { status: 400, message: 'No pages could be discovered for that website', pages: [] }
    }

    const urls = mapped.links.slice(0, 200).map((link) => (typeof link === 'string' ? link : link.url))

    return {
      status: 200,
      data: {
        urls,
        totalDiscovered: mapped.links.length,
        // Surfaced so the UI can stop an operator selecting more pages than the
        // plan allows, instead of failing them halfway through a crawl.
        limit: remaining.limit === null ? Infinity : Number(remaining.limit),
        remaining: remaining.limit === null ? Infinity : Number(remaining.remaining),
        plan: '',
      },
    }
  } catch (error) {
    return { ...toResponse(error, 'Could not discover pages'), data: null }
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
  text: string,
  append = false
) => {
  try {
    const scope = await knowledgeContext(workspaceId)
    if (!text.trim()) return { status: 400, message: 'No text provided' }

    // `append: false` replaces previously pasted text rather than stacking a
    // second copy of it, which is what the UI's toggle means.
    if (!append) {
      await client.knowledgeSource.deleteMany({
        where: { clientWorkspaceId: scope.clientWorkspaceId, sourceType: 'manual_text' },
      })
    }

    const name = `Pasted text (${new Date().toISOString().slice(0, 10)})`
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
  base64: string,
  fileName: string,
  _append = true
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
    const job = knowledge.lastIndex
    const total = (job?.chunksCreated ?? 0) + (job?.chunksFailed ?? 0)

    // Job statuses map onto the four states the progress panel understands.
    const status =
      job?.status === 'completed' || job?.status === 'partially_completed'
        ? 'completed'
        : job?.status === 'running' || job?.status === 'queued'
          ? 'processing'
          : job?.status === 'failed'
            ? 'failed'
            : 'not_started'

    return {
      status: 200,
      data: {
        status,
        progress: total > 0 ? Math.round(((job?.chunksCreated ?? 0) / total) * 100) : 0,
        processed: job?.chunksCreated ?? 0,
        total,
        hasEmbeddings: knowledge.hasEmbeddings,
        chunkCount: knowledge.chunkCount,
        completedAt: job?.completedAt ?? null,
        kbUpdatedAt: knowledge.sources[0]?.lastSyncedAt ?? null,
      },
    }
  } catch {
    return { status: 400, data: null }
  }
}

/** Re-embeds everything for a workspace, e.g. after an embedding model change. */
export const onTrainChatbot = async (workspaceId: string, _force = false) => {
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
      data: { chunksProcessed: chunksCreated, chunksFailed, skipped: false },
    }
  } catch (error) {
    return { ...toResponse(error, 'Training failed'), data: null }
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
