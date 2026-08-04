/**
 * Compares columns declared in prisma/schema.prisma against the columns that
 * actually exist in the live database. READ-ONLY.
 *
 *   node --env-file=.env.local scripts/check-drift.mjs
 *
 * Exists because this project has no managed migration history — schema changes
 * were applied by hand, so the schema file is an aspiration, not a guarantee.
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const prisma = new PrismaClient()

/** Crude but sufficient Prisma model/field parser for a drift check. */
function parseSchema(src) {
  const models = {}
  const modelRe = /^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm
  let m
  while ((m = modelRe.exec(src))) {
    const [, name, body] = m
    const fields = []
    for (const rawLine of body.split('\n')) {
      const line = rawLine.trim()
      if (!line || line.startsWith('//') || line.startsWith('@@')) continue
      const fm = line.match(/^(\w+)\s+(\S+)/)
      if (!fm) continue
      const [, field, type] = fm
      // Skip relation fields — they are not columns.
      const isRelation = /@relation/.test(line) && !/^\w+\s+(String|Int|Float|Boolean|DateTime|Json|BigInt|Decimal|Bytes)/.test(line)
      const isListRelation = type.endsWith('[]') && !/^(String|Int|Float|Boolean|DateTime|Json)\[\]$/.test(type)
      if (isRelation || isListRelation) continue
      fields.push(field)
    }
    models[name] = fields
  }
  return models
}

async function main() {
  const schemaSrc = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')
  const models = parseSchema(schemaSrc)

  const live = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `)
  const liveByTable = {}
  for (const { table_name, column_name } of live) {
    ;(liveByTable[table_name] ??= new Set()).add(column_name)
  }

  const drift = { missingInDatabase: {}, missingInSchema: {}, missingTables: [] }

  for (const [model, fields] of Object.entries(models)) {
    const cols = liveByTable[model]
    if (!cols) { drift.missingTables.push(model); continue }
    const missingInDb = fields.filter((f) => !cols.has(f))
    if (missingInDb.length) drift.missingInDatabase[model] = missingInDb
    const extra = [...cols].filter((c) => !fields.includes(c))
    if (extra.length) drift.missingInSchema[model] = extra
  }

  const extraTables = Object.keys(liveByTable).filter((t) => !models[t])

  mkdirSync(join(process.cwd(), '.private'), { recursive: true })
  writeFileSync(
    join(process.cwd(), '.private/schema-drift.json'),
    JSON.stringify({ ...drift, tablesInDbNotInSchema: extraTables }, null, 2),
    'utf8'
  )

  console.log('\n══ Declared in schema.prisma but MISSING from the live database ══')
  console.log(Object.keys(drift.missingInDatabase).length
    ? JSON.stringify(drift.missingInDatabase, null, 2)
    : '  (none)')

  console.log('\n══ Present in the database but NOT in schema.prisma ══')
  console.log(Object.keys(drift.missingInSchema).length
    ? JSON.stringify(drift.missingInSchema, null, 2)
    : '  (none)')

  console.log('\n══ Models with no table ══')
  console.log(drift.missingTables.length ? drift.missingTables.join(', ') : '  (none)')
  console.log('\n══ Tables with no model ══')
  console.log(extraTables.length ? extraTables.join(', ') : '  (none)')
}

main()
  .catch((e) => { console.error('✖', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
