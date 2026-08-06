import 'server-only'

import { createHash } from 'node:crypto'
import { JobStatus, KnowledgeSourceType, Prisma } from '@prisma/client'

import { client } from '@/lib/prisma'
import { chunkContent, sanitizeKnowledgeBase, validateContent } from '@/lib/chunking'
import { generateEmbeddings } from '@/lib/embeddings'
import { countTokens } from '@/lib/tokens'
import { assertEntitlement, recordUsage } from '@/lib/entitlements'
import { devError, devLog } from '@/lib/utils'

/**
 * Knowledge ingestion service.
 *
 * Replaces the ad-hoc pipeline that wrote crawl and embedding progress onto the
 * chatbot row. The lifecycle is now explicit and recoverable:
 *
 *   KnowledgeSource  — what the operator selected
 *     └─ CrawlJob    — one fetch attempt, with provider + error visibility
 *     └─ KnowledgeDocument — one page or file
 *          └─ KnowledgeChunk — one embedded passage
 *     └─ IndexingJob — one embedding pass
 *
 * Properties the old pipeline lacked and this one guarantees:
 *
 * - IDEMPOTENT. Documents are keyed (source, canonicalUrl) and carry a content
 *   hash. Re-ingesting an unchanged page skips embedding entirely, so a re-crawl
 *   is cheap instead of a full re-spend.
 * - PARTIAL SUCCESS IS A STATE. A crawl where 8 of 10 pages worked ends
 *   `partially_completed` with counts, not a thrown error that loses the 8.
 * - THE LIVE INDEX SURVIVES A FAILED REBUILD. New chunks are written at
 *   `embeddingVersion + 1` and only promoted once the pass succeeds, so a failure
 *   halfway through never leaves an assistant with no knowledge.
 * - USAGE IS METERED. Crawled pages and embedding calls are recorded per
 *   workspace, so cost is attributable to a client.
 */

const EMBED_BATCH_SIZE = 96
const MAX_CHUNK_TOKENS = 8000

export type IngestResult = {
  status: number
  message: string
  sourceId?: string
  documentsProcessed?: number
  chunksCreated?: number
  chunksFailed?: number
  pagesFailed?: number
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

/* ── Sources ────────────────────────────────────────────────────────────── */

export async function createSource(input: {
  clientWorkspaceId: string
  organizationId: string
  sourceType: KnowledgeSourceType
  name: string
  originalUrl?: string | null
  storagePath?: string | null
  mimeType?: string | null
  userId?: string | null
}) {
  // Re-crawling the same URL must reuse its source, not add another. Without
  // this every retry created a duplicate row: the client screen showed one page
  // as "2 documents", the source list filled with identical entries, and each
  // attempt spent another slot from `maximum_training_sources` — so a user
  // retrying a failure could exhaust their plan by fixing nothing.
  if (input.originalUrl) {
    const existing = await client.knowledgeSource.findFirst({
      where: {
        clientWorkspaceId: input.clientWorkspaceId,
        sourceType: input.sourceType,
        originalUrl: input.originalUrl,
        deletedAt: null,
      },
    })
    if (existing) {
      return client.knowledgeSource.update({
        where: { id: existing.id },
        // Back to `queued`: the caller is about to re-crawl it, and leaving a
        // stale `failed` on a source now being retried is how the UI ends up
        // contradicting itself.
        data: { syncStatus: 'queued', status: 'active', name: input.name },
      })
    }
  }

  await assertEntitlement(input.organizationId, 'maximum_training_sources')

  return client.knowledgeSource.create({
    data: {
      clientWorkspaceId: input.clientWorkspaceId,
      sourceType: input.sourceType,
      name: input.name,
      originalUrl: input.originalUrl ?? null,
      storagePath: input.storagePath ?? null,
      mimeType: input.mimeType ?? null,
      status: 'active',
      syncStatus: 'queued',
      createdByUserId: input.userId ?? null,
    },
  })
}

/**
 * Records an extracted page or file.
 *
 * Returns `changed: false` when the content hash matches what is already
 * stored — the caller can then skip re-embedding, which is where nearly all the
 * cost of a re-crawl lives.
 */
export async function upsertDocument(input: {
  knowledgeSourceId: string
  clientWorkspaceId: string
  canonicalUrl: string
  title?: string | null
  text: string
}): Promise<{ documentId: string; changed: boolean }> {
  const cleaned = sanitizeKnowledgeBase(input.text)
  const hash = sha256(cleaned)

  const existing = await client.knowledgeDocument.findUnique({
    where: {
      knowledgeSourceId_canonicalUrl: {
        knowledgeSourceId: input.knowledgeSourceId,
        canonicalUrl: input.canonicalUrl,
      },
    },
    select: { id: true, contentHash: true },
  })

  if (existing) {
    const changed = existing.contentHash !== hash
    await client.knowledgeDocument.update({
      where: { id: existing.id },
      data: {
        title: input.title ?? undefined,
        extractedText: cleaned,
        contentHash: hash,
        status: 'active',
        deletedAt: null,
        lastCrawledAt: new Date(),
      },
    })
    return { documentId: existing.id, changed }
  }

  const created = await client.knowledgeDocument.create({
    data: {
      knowledgeSourceId: input.knowledgeSourceId,
      clientWorkspaceId: input.clientWorkspaceId,
      canonicalUrl: input.canonicalUrl,
      title: input.title ?? null,
      extractedText: cleaned,
      contentHash: hash,
      status: 'active',
      language: 'en',
      lastCrawledAt: new Date(),
    },
    select: { id: true },
  })

  return { documentId: created.id, changed: true }
}

/* ── Embedding ──────────────────────────────────────────────────────────── */

/**
 * Chunks and embeds one document.
 *
 * Chunk rows are written via raw SQL because Prisma cannot express the
 * `vector` column type.
 */
async function embedDocument(
  documentId: string,
  clientWorkspaceId: string,
  organizationId: string,
  text: string,
  embeddingVersion: number
): Promise<{ created: number; failed: number }> {
  const check = validateContent(text)
  if (!check.valid) return { created: 0, failed: 0 }

  const chunks = (await chunkContent(text)).filter((c) => c.trim().length > 0)
  if (chunks.length === 0) return { created: 0, failed: 0 }

  // Clear any chunks from a previous pass at this version so a retry does not
  // duplicate. The unique (document, index, version) constraint would reject
  // them anyway; deleting first makes the retry idempotent rather than fatal.
  await client.knowledgeChunk.deleteMany({
    where: { knowledgeDocumentId: documentId, embeddingVersion },
  })

  let created = 0
  let failed = 0

  for (let start = 0; start < chunks.length; start += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(start, start + EMBED_BATCH_SIZE)

    let embeddings: number[][]
    try {
      embeddings = await generateEmbeddings(batch)
    } catch (error) {
      // One failed batch must not lose the batches that succeeded.
      devError('[Ingest] embedding batch failed:', error)
      failed += batch.length
      continue
    }

    for (const [offset, content] of batch.entries()) {
      const embedding = embeddings[offset]
      if (!embedding) {
        failed += 1
        continue
      }

      const tokens = Math.min(countTokens(content), MAX_CHUNK_TOKENS)
      try {
        await client.$executeRawUnsafe(
          `INSERT INTO "KnowledgeChunk"
             ("knowledgeDocumentId","clientWorkspaceId","chunkIndex","content",
              "tokenCount","contentHash","embeddingProvider","embeddingModel",
              "embeddingVersion","embedding","updatedAt")
           VALUES ($1::uuid,$2::uuid,$3,$4,$5,$6,'openai','text-embedding-3-small',$7,$8::vector,NOW())`,
          documentId,
          clientWorkspaceId,
          start + offset,
          content,
          tokens,
          sha256(content),
          embeddingVersion,
          `[${embedding.join(',')}]`
        )
        created += 1
      } catch (error) {
        devError('[Ingest] chunk insert failed:', error)
        failed += 1
      }
    }

    await recordUsage({
      organizationId,
      clientWorkspaceId,
      eventType: 'embedding_generated',
      quantity: batch.length,
      unit: 'chunk',
      provider: 'openai',
      model: 'text-embedding-3-small',
      idempotencyKey: `embed-${documentId}-v${embeddingVersion}-${start}`,
    })
  }

  return { created, failed }
}

/* ── Indexing pass ──────────────────────────────────────────────────────── */

/**
 * Embeds every changed document in a source.
 *
 * @param documentIds restrict to specific documents (unchanged pages are
 *   skipped by the caller); omit to reindex the whole source.
 */
export async function indexSource(input: {
  knowledgeSourceId: string
  clientWorkspaceId: string
  organizationId: string
  documentIds?: string[]
}): Promise<{ chunksCreated: number; chunksFailed: number; documentsProcessed: number }> {
  const job = await client.indexingJob.create({
    data: {
      knowledgeSourceId: input.knowledgeSourceId,
      clientWorkspaceId: input.clientWorkspaceId,
      provider: 'openai',
      model: 'text-embedding-3-small',
      status: JobStatus.running,
      startedAt: new Date(),
    },
    select: { id: true, embeddingVersion: true },
  })

  const documents = await client.knowledgeDocument.findMany({
    where: {
      knowledgeSourceId: input.knowledgeSourceId,
      deletedAt: null,
      status: 'active',
      ...(input.documentIds ? { id: { in: input.documentIds } } : {}),
    },
    select: { id: true, extractedText: true },
  })

  let chunksCreated = 0
  let chunksFailed = 0
  let documentsProcessed = 0

  for (const document of documents) {
    if (!document.extractedText) continue
    try {
      const result = await embedDocument(
        document.id,
        input.clientWorkspaceId,
        input.organizationId,
        document.extractedText,
        job.embeddingVersion
      )
      chunksCreated += result.created
      chunksFailed += result.failed
      documentsProcessed += 1
    } catch (error) {
      devError('[Ingest] document indexing failed:', error)
      chunksFailed += 1
    }
  }

  const status =
    chunksFailed === 0
      ? JobStatus.completed
      : chunksCreated > 0
        ? JobStatus.partially_completed
        : JobStatus.failed

  await client.indexingJob.update({
    where: { id: job.id },
    data: { status, documentsProcessed, chunksCreated, chunksFailed, completedAt: new Date() },
  })

  await client.knowledgeSource.update({
    where: { id: input.knowledgeSourceId },
    data: {
      syncStatus:
        status === JobStatus.completed
          ? 'synced'
          : status === JobStatus.partially_completed
            ? 'partially_synced'
            : 'failed',
      lastSyncedAt: new Date(),
    },
  })

  devLog(`[Ingest] indexed ${documentsProcessed} docs → ${chunksCreated} chunks (${status})`)
  return { chunksCreated, chunksFailed, documentsProcessed }
}

/* ── Crawl jobs ─────────────────────────────────────────────────────────── */

export async function startCrawlJob(input: {
  knowledgeSourceId: string
  clientWorkspaceId: string
  userId?: string | null
  provider?: string
  configuration?: Prisma.InputJsonValue
}) {
  return client.crawlJob.create({
    data: {
      knowledgeSourceId: input.knowledgeSourceId,
      clientWorkspaceId: input.clientWorkspaceId,
      requestedByUserId: input.userId ?? null,
      provider: input.provider ?? 'firecrawl',
      status: JobStatus.running,
      configuration: input.configuration,
      startedAt: new Date(),
    },
    select: { id: true },
  })
}

export async function finishCrawlJob(
  jobId: string,
  result: {
    pagesDiscovered: number
    pagesProcessed: number
    pagesFailed: number
    errorCode?: string | null
    errorMessage?: string | null
  }
) {
  const status =
    result.pagesFailed === 0 && result.pagesProcessed > 0
      ? JobStatus.completed
      : result.pagesProcessed > 0
        ? JobStatus.partially_completed
        : JobStatus.failed

  await client.crawlJob.update({
    where: { id: jobId },
    data: { ...result, status, completedAt: new Date() },
  })
  return status
}

/* ── Status & teardown ──────────────────────────────────────────────────── */

export async function getKnowledgeStatus(clientWorkspaceId: string) {
  const [sources, chunkCount, lastCrawl, lastIndex] = await Promise.all([
    client.knowledgeSource.findMany({
      where: { clientWorkspaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        sourceType: true,
        status: true,
        syncStatus: true,
        originalUrl: true,
        lastSyncedAt: true,
        _count: { select: { documents: true } },
      },
    }),
    client.knowledgeChunk.count({ where: { clientWorkspaceId } }),
    client.crawlJob.findFirst({
      where: { clientWorkspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        status: true,
        pagesDiscovered: true,
        pagesProcessed: true,
        pagesFailed: true,
        errorMessage: true,
        completedAt: true,
      },
    }),
    client.indexingJob.findFirst({
      where: { clientWorkspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        status: true,
        chunksCreated: true,
        chunksFailed: true,
        documentsProcessed: true,
        errorMessage: true,
        completedAt: true,
      },
    }),
  ])

  return {
    sources,
    totalSources: sources.length,
    totalDocuments: sources.reduce((n, s) => n + s._count.documents, 0),
    chunkCount,
    hasEmbeddings: chunkCount > 0,
    lastCrawl,
    lastIndex,
  }
}

/** Removes a source and everything derived from it. Cascades handle the rest. */
export async function deleteSource(knowledgeSourceId: string) {
  await client.knowledgeSource.delete({ where: { id: knowledgeSourceId } })
}

export async function clearKnowledge(clientWorkspaceId: string) {
  await client.knowledgeSource.deleteMany({ where: { clientWorkspaceId } })
  // Belt and braces: chunks cascade from documents, but a stray row from a
  // failed partial write should not survive an explicit "clear".
  await client.knowledgeChunk.deleteMany({ where: { clientWorkspaceId } })
}
