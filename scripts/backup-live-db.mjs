/**
 * Phase 1 — full logical backup. STRICTLY READ-ONLY.
 *
 *   node --env-file=.env.local scripts/backup-live-db.mjs
 *
 * Dumps every row of every public table to .private/backup-<timestamp>/, one
 * JSON file per table, plus a manifest with row counts and checksums.
 *
 * Why JSON and not pg_dump: pg_dump is not installed on this machine, and at
 * ~900 rows a logical JSON snapshot is a complete and restorable record. For a
 * database of this size it is not a compromise. If the dataset ever grows,
 * switch to pg_dump (see docs/rebuild/DATABASE-BACKUP.md).
 *
 * Vector columns are read via raw SQL and stored as their text representation,
 * because the Prisma client cannot select `Unsupported("vector")`.
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const prisma = new PrismaClient()

/** JSON.stringify replacer: BigInt and Date are not natively serialisable. */
const replacer = (_k, v) =>
  typeof v === 'bigint' ? v.toString() : v instanceof Date ? v.toISOString() : v

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = join(process.cwd(), '.private', `backup-${stamp}`)
  mkdirSync(dir, { recursive: true })

  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `)

  const manifest = { generatedAt: new Date().toISOString(), tables: {} }

  for (const { table_name } of tables) {
    const safe = table_name.replace(/"/g, '')

    // Columns, so vector types can be cast to text explicitly.
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name, udt_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name=$1`,
      safe
    )
    const selectList = cols
      .map((c) =>
        c.udt_name === 'vector'
          ? `"${c.column_name}"::text AS "${c.column_name}"`
          : `"${c.column_name}"`
      )
      .join(', ')

    const rows = await prisma.$queryRawUnsafe(`SELECT ${selectList} FROM "${safe}"`)
    const json = JSON.stringify(rows, replacer, 2)

    writeFileSync(join(dir, `${safe}.json`), json, 'utf8')
    manifest.tables[safe] = {
      rowCount: rows.length,
      columns: cols.map((c) => c.column_name),
      sha256: createHash('sha256').update(json).digest('hex'),
      bytes: Buffer.byteLength(json),
    }
    console.log(`  ✓ ${safe.padEnd(20)} ${String(rows.length).padStart(5)} rows`)
  }

  manifest.totalRows = Object.values(manifest.tables).reduce((a, t) => a + t.rowCount, 0)
  writeFileSync(join(dir, '_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')

  console.log(`\n${tables.length} tables, ${manifest.totalRows} rows`)
  console.log(`Backup written to ${dir}`)
  console.log('Verify with: node scripts/verify-backup.mjs <dir>')
}

main()
  .catch((e) => { console.error('✖', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
