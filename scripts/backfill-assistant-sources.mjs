/**
 * Backfill — link every knowledge source to every assistant in its workspace,
 * and retire duplicate copies of the same page.
 *
 *   node --env-file=.env.local scripts/backfill-assistant-sources.mjs [--dry-run]
 *
 * WHY THIS EXISTS
 *
 * `match_knowledge_chunks_scoped` filters chunks through AssistantKnowledgeSource
 * whenever it is given an assistant id, and the public chat endpoints always
 * give it one. No code in the app ever wrote that table — only the dev seed did
 * — so every workspace created through the product retrieved zero chunks on
 * every message and answered from the prompt's "no reference material" branch,
 * while its dashboard showed a fully indexed knowledge base. The application
 * fix is in `lib/knowledge/ingest`; this repairs the workspaces that already
 * exist.
 *
 * It also archives duplicate documents: two knowledge sources pointing at one
 * website each kept their own copy of every shared page, so retrieval returned
 * the same passage twice and crowded out everything else. The newest copy is
 * kept; older copies are archived and their chunks deleted.
 *
 * Writes performed: INSERT into AssistantKnowledgeSource (skipping existing),
 * UPDATE of duplicate KnowledgeDocument rows to archived, DELETE of those
 * documents' chunks. Nothing else is touched. `--dry-run` writes nothing.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes('--dry-run')

/** Mirrors `canonicalizeUrl` in src/lib/knowledge/ingest.ts. */
const TRACKING_PARAMS = /^(utm_|fbclid$|gclid$|msclkid$|mc_[ce]id$|ref$|source$)/i
function canonicalizeUrl(raw) {
  if (!raw) return raw
  const trimmed = String(raw).trim()
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

async function main() {
  console.log(DRY_RUN ? '— DRY RUN, no writes —\n' : '— applying changes —\n')

  const workspaces = await prisma.clientWorkspace.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      assistants: { where: { deletedAt: null }, select: { id: true, name: true } },
      knowledgeSources: {
        where: { deletedAt: null },
        select: { id: true, name: true, sourceType: true },
      },
    },
  })

  let linksCreated = 0
  let docsArchived = 0
  let chunksDeleted = 0

  for (const workspace of workspaces) {
    const label = `${workspace.name} (${workspace.id})`

    /* ── Links ── */
    if (workspace.assistants.length && workspace.knowledgeSources.length) {
      const existing = await prisma.assistantKnowledgeSource.findMany({
        where: { assistantId: { in: workspace.assistants.map((a) => a.id) } },
        select: { assistantId: true, knowledgeSourceId: true },
      })
      const have = new Set(existing.map((r) => `${r.assistantId}:${r.knowledgeSourceId}`))

      const missing = []
      for (const assistant of workspace.assistants) {
        for (const source of workspace.knowledgeSources) {
          if (!have.has(`${assistant.id}:${source.id}`)) {
            missing.push({ assistantId: assistant.id, knowledgeSourceId: source.id, enabled: true })
          }
        }
      }

      if (missing.length) {
        if (!DRY_RUN) {
          const result = await prisma.assistantKnowledgeSource.createMany({
            data: missing,
            skipDuplicates: true,
          })
          linksCreated += result.count
        } else {
          linksCreated += missing.length
        }
        console.log(
          `LINK  ${label}: +${missing.length} link(s) ` +
            `(${workspace.assistants.length} assistant × ${workspace.knowledgeSources.length} source)`
        )
      }
    }

    /* ── Duplicate documents ── */
    const documents = await prisma.knowledgeDocument.findMany({
      where: { clientWorkspaceId: workspace.id, deletedAt: null, status: 'active' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        canonicalUrl: true,
        createdAt: true,
        knowledgeSourceId: true,
        _count: { select: { chunks: true } },
      },
    })

    const byUrl = new Map()
    for (const doc of documents) {
      if (!doc.canonicalUrl) continue
      const key = canonicalizeUrl(doc.canonicalUrl)
      if (!byUrl.has(key)) byUrl.set(key, [])
      byUrl.get(key).push(doc)
    }

    for (const [url, group] of byUrl) {
      if (group.length < 2) continue
      // Newest first (query ordering), so everything after index 0 is stale.
      const [keep, ...stale] = group
      const staleIds = stale.map((d) => d.id)
      const staleChunks = stale.reduce((n, d) => n + d._count.chunks, 0)

      console.log(
        `DEDUP ${label}: ${url} — keeping ${keep.id} (${keep._count.chunks} chunks, ` +
          `${keep.createdAt.toISOString()}), archiving ${staleIds.length} older copy/copies ` +
          `(${staleChunks} chunks)`
      )

      if (!DRY_RUN) {
        const deleted = await prisma.knowledgeChunk.deleteMany({
          where: { knowledgeDocumentId: { in: staleIds } },
        })
        await prisma.knowledgeDocument.updateMany({
          where: { id: { in: staleIds } },
          data: { status: 'archived', deletedAt: new Date() },
        })
        chunksDeleted += deleted.count
        docsArchived += staleIds.length
      } else {
        chunksDeleted += staleChunks
        docsArchived += staleIds.length
      }
    }
  }

  console.log(
    `\nDone. workspaces=${workspaces.length} ` +
      `links${DRY_RUN ? ' (would be)' : ''}=${linksCreated} ` +
      `documentsArchived=${docsArchived} chunksDeleted=${chunksDeleted}`
  )

  /* ── Post-state ── */
  const blind = await prisma.assistant.findMany({
    where: {
      deletedAt: null,
      clientWorkspace: { deletedAt: null, knowledgeSources: { some: { deletedAt: null } } },
      knowledgeSourceLinks: { none: { enabled: true } },
    },
    select: { id: true, name: true },
  })
  console.log(
    blind.length === 0
      ? 'Every assistant with knowledge in its workspace now has enabled links.'
      : `WARNING: ${blind.length} assistant(s) still unlinked: ${blind.map((a) => a.id).join(', ')}`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
