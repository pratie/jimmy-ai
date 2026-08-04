/**
 * Post-migration verification. READ-ONLY.
 *
 *   node --env-file=.env.local scripts/verify-rebuild.mjs
 *
 * Confirms the rebuilt schema is actually in place: tables, enums, the HNSW
 * index Prisma cannot express, the tenant-scoped retrieval function, and that
 * every legacy table is gone.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LEGACY = [
  'Domain', 'ChatBot', 'Customer', 'ChatRoom', 'ChatMessage', 'HelpDesk',
  'FilterQuestions', 'CustomerResponses', 'Bookings', 'Campaign', 'Product',
  'Billings', 'Account', 'Session', 'VerificationToken',
]

const EXPECTED_CORE = [
  'User', 'Organization', 'OrganizationMembership', 'ClientWorkspace',
  'ClientWorkspaceMembership', 'Website', 'Assistant', 'AssistantDeployment',
  'KnowledgeSource', 'KnowledgeDocument', 'KnowledgeChunk', 'CrawlJob',
  'IndexingJob', 'Conversation', 'Message', 'Lead', 'BookingRequest',
  'Subscription', 'Plan', 'UsageEvent', 'BillingEvent', 'AuditLog',
]

const q = (sql, ...args) => prisma.$queryRawUnsafe(sql, ...args)

async function main() {
  let problems = 0
  const fail = (m) => { console.error(`  ✖ ${m}`); problems++ }
  const ok = (m) => console.log(`  ✓ ${m}`)

  const tables = (await q(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
  `)).map((r) => r.table_name)

  console.log('\n── Tables ──')
  ok(`${tables.length} tables in public`)
  for (const t of EXPECTED_CORE) {
    if (!tables.includes(t)) fail(`expected table missing: ${t}`)
  }
  const survivors = LEGACY.filter((t) => tables.includes(t))
  survivors.length ? fail(`legacy tables still present: ${survivors.join(', ')}`)
                   : ok('no legacy tables remain')

  console.log('\n── Migration history ──')
  if (!tables.includes('_prisma_migrations')) fail('_prisma_migrations missing — migrations are not tracked')
  else {
    const applied = await q(`
      SELECT migration_name, finished_at, applied_steps_count
      FROM _prisma_migrations ORDER BY started_at
    `)
    applied.forEach((m) =>
      m.finished_at
        ? ok(`${m.migration_name} (${m.applied_steps_count} steps)`)
        : fail(`${m.migration_name} did not finish`)
    )
  }

  console.log('\n── pgvector ──')
  const ext = (await q(`SELECT extname FROM pg_extension`)).map((r) => r.extname)
  ext.includes('vector') ? ok('vector extension present') : fail('vector extension missing')
  ext.includes('pgcrypto') ? ok('pgcrypto extension present') : fail('pgcrypto extension missing')

  const hnsw = await q(`
    SELECT indexname FROM pg_indexes
    WHERE schemaname='public' AND indexdef ILIKE '%hnsw%'
  `)
  hnsw.length ? ok(`HNSW index: ${hnsw.map((h) => h.indexname).join(', ')}`)
              : fail('no HNSW index — vector search will fall back to a sequential scan')

  const col = await q(`
    SELECT udt_name, atttypmod FROM information_schema.columns c
    JOIN pg_attribute a ON a.attname = c.column_name
    JOIN pg_class     p ON p.oid = a.attrelid AND p.relname = c.table_name
    WHERE c.table_schema='public' AND c.table_name='KnowledgeChunk' AND c.column_name='embedding'
  `)
  col[0]?.udt_name === 'vector' ? ok('KnowledgeChunk.embedding is vector')
                                : fail('KnowledgeChunk.embedding is not a vector column')

  console.log('\n── Retrieval function ──')
  const fns = (await q(`
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema='public' AND routine_name LIKE '%knowledge%'
  `)).map((r) => r.routine_name)
  fns.includes('match_knowledge_chunks_scoped')
    ? ok('match_knowledge_chunks_scoped present')
    : fail('match_knowledge_chunks_scoped missing')
  fns.includes('match_knowledge_chunks')
    ? fail('legacy unscoped match_knowledge_chunks still present — cross-tenant risk')
    : ok('legacy unscoped search function removed')

  console.log('\n── Enums ──')
  const enums = await q(`SELECT COUNT(DISTINCT typname)::int AS n FROM pg_type WHERE typtype='e'`)
  ok(`${enums[0].n} enum types`)

  console.log('\n── Row counts ──')
  let total = 0
  for (const t of tables) {
    const r = await q(`SELECT COUNT(*)::bigint AS n FROM "${t.replace(/"/g, '')}"`)
    total += Number(r[0].n)
  }
  ok(`${total} rows total (a fresh schema is expected to be empty apart from _prisma_migrations)`)

  console.log(problems === 0 ? '\n✓ Rebuild verified.\n' : `\n✖ ${problems} problem(s).\n`)
  if (problems) process.exit(1)
}

main()
  .catch((e) => { console.error('✖', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
