/**
 * Phase 1 — live database audit. STRICTLY READ-ONLY.
 *
 *   node --env-file=.env.local scripts/audit-live-db.mjs
 *
 * Records what your brief §4 requires before any reset is considered:
 * row counts for every table, active paid subscriptions, and a read of how
 * much of the data is real versus test. Writes .private/db-audit.json.
 *
 * This script issues no INSERT, UPDATE, DELETE or DDL of any kind.
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const prisma = new PrismaClient()
const OUT = join(process.cwd(), '.private')

async function main() {
  // Row counts straight from the catalog, so tables absent from schema.prisma
  // (drift from the hand-applied SQL) still show up.
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `)

  const counts = {}
  for (const { table_name } of tables) {
    const r = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::bigint AS n FROM "${table_name.replace(/"/g, '')}"`
    )
    counts[table_name] = Number(r[0].n)
  }

  // Subscriptions — the gate on whether a wipe is safe at all.
  const billings = await prisma.billings.findMany({
    select: {
      id: true, plan: true, status: true, billingInterval: true,
      provider: true, providerSubscriptionId: true, cancelAtPeriodEnd: true,
      endsAt: true, messageCredits: true, messagesUsed: true, createdAt: true,
      User: { select: { email: true, fullname: true, dodoMerchantId: true } },
    },
  })

  const paid = billings.filter((b) => b.plan !== 'FREE')
  const activePaid = paid.filter(
    (b) => b.status && !['cancelled', 'canceled', 'expired'].includes(String(b.status).toLowerCase())
  )

  // Extension + vector reality check (the hand-applied SQL may not have run).
  const extensions = await prisma.$queryRawUnsafe(
    `SELECT extname FROM pg_extension ORDER BY extname`
  )
  const vectorIndexes = await prisma.$queryRawUnsafe(`
    SELECT indexname, tablename FROM pg_indexes
    WHERE schemaname = 'public' AND indexdef ILIKE '%hnsw%'
  `)
  const routines = await prisma.$queryRawUnsafe(`
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema = 'public' ORDER BY routine_name
  `)

  const report = {
    generatedAt: new Date().toISOString(),
    database: { host: new URL(process.env.DIRECT_URL).hostname },
    tableCount: tables.length,
    rowCounts: counts,
    totalRows: Object.values(counts).reduce((a, b) => a + b, 0),
    subscriptions: {
      total: billings.length,
      paidPlans: paid.length,
      activePaid: activePaid.length,
      records: billings.map((b) => ({
        userEmail: b.User?.email ?? null,
        userName: b.User?.fullname ?? null,
        plan: b.plan,
        status: b.status,
        billingInterval: b.billingInterval,
        provider: b.provider,
        dodoMerchantId: b.User?.dodoMerchantId ?? null,
        externalSubscriptionId: b.providerSubscriptionId,
        cancelAtPeriodEnd: b.cancelAtPeriodEnd,
        endsAt: b.endsAt,
        messagesUsed: `${b.messagesUsed}/${b.messageCredits}`,
        createdAt: b.createdAt,
      })),
    },
    postgres: {
      extensions: extensions.map((e) => e.extname),
      hnswIndexes: vectorIndexes,
      routines: routines.map((r) => r.routine_name),
    },
    wipeSafety: {
      activePaidSubscriptions: activePaid.length,
      verdict:
        activePaid.length > 0
          ? 'BLOCKED — active paid subscriptions exist. Do not wipe until these are recorded and handled.'
          : 'No active paid subscriptions found. Wipe is safe from a billing standpoint (still requires verified backup + email export).',
    },
  }

  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'db-audit.json'), JSON.stringify(report, null, 2), 'utf8')

  const nonEmpty = Object.entries(counts).filter(([, n]) => n > 0)
  console.log(`\nTables: ${tables.length}   Total rows: ${report.totalRows}\n`)
  console.log('Non-empty tables:')
  console.table(Object.fromEntries(nonEmpty))
  console.log('\nExtensions:', report.postgres.extensions.join(', '))
  console.log('HNSW indexes:', vectorIndexes.length)
  console.log('Routines:', report.postgres.routines.join(', ') || '(none)')
  console.log(`\nSubscriptions: ${billings.length} total, ${paid.length} paid, ${activePaid.length} active paid`)
  console.log(`\n${report.wipeSafety.verdict}`)
  console.log(`\nWritten to ${OUT}/db-audit.json`)
}

main()
  .catch((e) => { console.error('✖', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
