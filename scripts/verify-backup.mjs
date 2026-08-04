/**
 * Verifies a backup produced by scripts/backup-live-db.mjs.
 *
 *   node --env-file=.env.local scripts/verify-backup.mjs .private/backup-<stamp>
 *
 * Checks that every table file is present, parses, matches its recorded
 * checksum, and still matches the live row count. Run this — and read the
 * output — before anything destructive. A backup nobody verified is not a
 * backup.
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: node --env-file=.env.local scripts/verify-backup.mjs <backup-dir>')
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  const manifestPath = join(dir, '_manifest.json')
  if (!existsSync(manifestPath)) {
    console.error(`✖ No _manifest.json in ${dir}`)
    process.exit(1)
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

  let failures = 0
  let checked = 0

  for (const [table, meta] of Object.entries(manifest.tables)) {
    const file = join(dir, `${table}.json`)
    if (!existsSync(file)) {
      console.error(`✖ ${table}: file missing`)
      failures++
      continue
    }

    const raw = readFileSync(file, 'utf8')

    const sha = createHash('sha256').update(raw).digest('hex')
    if (sha !== meta.sha256) {
      console.error(`✖ ${table}: checksum mismatch (file altered since backup)`)
      failures++
      continue
    }

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      console.error(`✖ ${table}: does not parse as JSON`)
      failures++
      continue
    }

    if (parsed.length !== meta.rowCount) {
      console.error(`✖ ${table}: ${parsed.length} rows in file, manifest says ${meta.rowCount}`)
      failures++
      continue
    }

    const live = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::bigint AS n FROM "${table.replace(/"/g, '')}"`
    )
    const liveCount = Number(live[0].n)
    if (liveCount !== meta.rowCount) {
      console.warn(
        `⚠ ${table}: live now has ${liveCount} rows, backup captured ${meta.rowCount} ` +
          `(the database changed after the backup — take a fresh one)`
      )
      failures++
      continue
    }

    console.log(`  ✓ ${table.padEnd(20)} ${String(meta.rowCount).padStart(5)} rows  sha ok  live ok`)
    checked++
  }

  console.log(`\n${checked} tables verified, ${failures} problem(s).`)
  if (failures > 0) {
    console.error('\n✖ BACKUP NOT VERIFIED — do not proceed with any destructive step.')
    process.exit(1)
  }
  console.log('✓ Backup verified against the live database.')
}

main()
  .catch((e) => { console.error('✖', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
