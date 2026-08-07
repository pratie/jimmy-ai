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

/* ── URL identity ───────────────────────────────────────────────────────── */

const TRACKING_PARAMS = /^(utm_|fbclid$|gclid$|msclkid$|mc_[ce]id$|ref$|source$)/i

/**
 * One stable identity per page.
 *
 * Documents are keyed by `canonicalUrl` and sources by `originalUrl`, so
 * `https://x.co`, `https://www.x.co/`, and `https://X.co/?utm_source=x` used to
 * be three different rows for the same page — the mechanism behind
 * bulktranscripts.co having two "active" sources holding two copies of its
 * homepage, and every retrieval seeing each passage twice.
 *
 * Non-http schemes (`manual://`, `file://`) are returned untouched.
 */
export function canonicalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!/^https?:\/\//i.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    url.protocol = 'https:'
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    url.hash = ''
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key)
    }
    url.pathname = url.pathname.replace(/\/+$/, '')
    return url.toString().replace(/\/$/, '')
  } catch {
    return trimmed
  }
}

/* ── Assistant ↔ source links ───────────────────────────────────────────── */

/**
 * Every assistant in the workspace can read this source.
 *
 * `match_knowledge_chunks_scoped` filters chunks by AssistantKnowledgeSource
 * whenever it is given an assistant id, and the public chat endpoints always
 * give it one. Nothing in the app ever wrote these rows, so every workspace
 * created through the product retrieved exactly nothing — the assistant
 * answered from the "no reference material" branch of the prompt on every turn,
 * silently, for its entire life.
 *
 * Linking on creation is the default because that is what an operator means by
 * adding knowledge to a client. Per-assistant subsets remain possible by
 * disabling a link afterwards; they are just no longer the accidental default
 * of "nobody can see anything".
 */
export async function linkSourceToAssistants(
  clientWorkspaceId: string,
  knowledgeSourceId: string
): Promise<number> {
  const assistants = await client.assistant.findMany({
    where: { clientWorkspaceId, deletedAt: null },
    select: { id: true },
  })
  if (assistants.length === 0) return 0

  const result = await client.assistantKnowledgeSource.createMany({
    data: assistants.map((assistant) => ({
      assistantId: assistant.id,
      knowledgeSourceId,
      enabled: true,
    })),
    skipDuplicates: true,
  })
  return result.count
}

/** The reverse: a new assistant inherits the knowledge its workspace already has. */
export async function linkAssistantToWorkspaceSources(
  clientWorkspaceId: string,
  assistantId: string
): Promise<number> {
  const sources = await client.knowledgeSource.findMany({
    where: { clientWorkspaceId, deletedAt: null },
    select: { id: true },
  })
  if (sources.length === 0) return 0

  const result = await client.assistantKnowledgeSource.createMany({
    data: sources.map((source) => ({
      assistantId,
      knowledgeSourceId: source.id,
      enabled: true,
    })),
    skipDuplicates: true,
  })
  return result.count
}

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
  const originalUrl = input.originalUrl ? canonicalizeUrl(input.originalUrl) : null

  if (originalUrl) {
    const existing = await client.knowledgeSource.findFirst({
      where: {
        clientWorkspaceId: input.clientWorkspaceId,
        sourceType: input.sourceType,
        // Both forms: rows written before URLs were canonicalised still carry
        // the raw value, and they must match rather than spawn a twin.
        originalUrl: { in: [...new Set([originalUrl, input.originalUrl!])] },
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    })
    if (existing) {
      const source = await client.knowledgeSource.update({
        where: { id: existing.id },
        // Back to `queued`: the caller is about to re-crawl it, and leaving a
        // stale `failed` on a source now being retried is how the UI ends up
        // contradicting itself.
        data: { syncStatus: 'queued', status: 'active', name: input.name, originalUrl },
      })
      // An assistant added after the source was first created would otherwise
      // never see it.
      await linkSourceToAssistants(input.clientWorkspaceId, source.id)
      return source
    }
  }

  await assertEntitlement(input.organizationId, 'maximum_training_sources')

  const source = await client.knowledgeSource.create({
    data: {
      clientWorkspaceId: input.clientWorkspaceId,
      sourceType: input.sourceType,
      name: input.name,
      originalUrl,
      storagePath: input.storagePath ?? null,
      mimeType: input.mimeType ?? null,
      status: 'active',
      syncStatus: 'queued',
      createdByUserId: input.userId ?? null,
    },
  })

  // Creating a source and not linking it is indistinguishable, at retrieval
  // time, from having no knowledge at all. Every ingestion path funnels through
  // here, so this is the one place that has to remember.
  await linkSourceToAssistants(input.clientWorkspaceId, source.id)

  return source
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
  const canonicalUrl = canonicalizeUrl(input.canonicalUrl)

  const existing = await client.knowledgeDocument.findUnique({
    where: {
      knowledgeSourceId_canonicalUrl: {
        knowledgeSourceId: input.knowledgeSourceId,
        canonicalUrl,
      },
    },
    select: { id: true, contentHash: true },
  })

  let documentId: string
  let changed: boolean

  if (existing) {
    changed = existing.contentHash !== hash
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
    documentId = existing.id
  } else {
    const created = await client.knowledgeDocument.create({
      data: {
        knowledgeSourceId: input.knowledgeSourceId,
        clientWorkspaceId: input.clientWorkspaceId,
        canonicalUrl,
        title: input.title ?? null,
        extractedText: cleaned,
        contentHash: hash,
        status: 'active',
        language: 'en',
        lastCrawledAt: new Date(),
      },
      select: { id: true },
    })
    documentId = created.id
    changed = true
  }

  await supersedeDuplicateDocuments(input.clientWorkspaceId, canonicalUrl, documentId)
  return { documentId, changed }
}

/**
 * Retires other live copies of the same page in the same workspace.
 *
 * The uniqueness the schema enforces is (source, canonicalUrl), so two sources
 * pointing at one website each held their own copy of every shared page and
 * retrieval returned both — the same passage twice, crowding out everything
 * else in a five-chunk context window. The newest copy wins; the older ones are
 * archived and their chunks deleted, because a chunk nobody should retrieve is
 * only a way to keep paying the index for a wrong answer.
 */
async function supersedeDuplicateDocuments(
  clientWorkspaceId: string,
  canonicalUrl: string,
  keepDocumentId: string
): Promise<number> {
  const duplicates = await client.knowledgeDocument.findMany({
    where: {
      clientWorkspaceId,
      canonicalUrl,
      id: { not: keepDocumentId },
      deletedAt: null,
      status: 'active',
    },
    select: { id: true },
  })
  if (duplicates.length === 0) return 0

  const ids = duplicates.map((d) => d.id)
  await client.knowledgeChunk.deleteMany({ where: { knowledgeDocumentId: { in: ids } } })
  await client.knowledgeDocument.updateMany({
    where: { id: { in: ids } },
    data: { status: 'archived', deletedAt: new Date() },
  })

  devLog(`[Ingest] superseded ${ids.length} duplicate document(s) for ${canonicalUrl}`)
  return ids.length
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
