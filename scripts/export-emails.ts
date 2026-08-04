/**
 * Phase 1 — email preservation.
 *
 * Sweeps every table and column in the CURRENT (pre-rebuild) schema that can
 * hold an email address, and writes two exports plus a summary.
 *
 *   npx tsx scripts/export-emails.ts
 *
 * Requires DATABASE_URL (read access is enough). Writes to .private/, which is
 * gitignored — these files must never reach a public repository.
 *
 * Deliberate constraints:
 * - Read-only. This script issues no writes and cannot damage the database.
 * - Every original source row is preserved. Deduplication happens on the
 *   (email, sourceTable, sourceId) triple, so two different people who share an
 *   address are never silently collapsed into one record.
 * - No secrets, tokens, payment details or conversation bodies are exported.
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const prisma = new PrismaClient()
const OUT_DIR = join(process.cwd(), '.private')

type SourceKind = 'user' | 'lead' | 'booking' | 'campaign_recipient'

type EmailRecord = {
  email: string
  originalEmail: string
  sourceTable: string
  sourceId: string
  kind: SourceKind
  name: string | null
  businessOrDomain: string | null
  userType: string | null
  plan: string | null
  consentStatus: string | null
  createdAt: string | null
  updatedAt: string | null
  valid: boolean
  likelyTestData: boolean
  notes: string | null
}

/* ── Normalisation ─────────────────────────────────────────────────────── */

// Intentionally permissive: this is a preservation pass, not a signup form.
// Anything structurally address-shaped is kept and flagged rather than dropped.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const TEST_PATTERNS = [
  /^test/i,
  /test@/i,
  /@example\.(com|org|net)$/i,
  /@test\./i,
  /^demo/i,
  /^admin@/i,
  /^foo|^bar|^asdf/i,
  /\+test@/i,
  /@localhost/i,
  /@mailinator\.com$/i,
  /@yopmail\.com$/i,
  /noreply|no-reply|donotreply/i,
]

const normalise = (raw: string) => raw.trim().toLowerCase()
const isValid = (email: string) => EMAIL_RE.test(email)
const looksLikeTest = (email: string) => TEST_PATTERNS.some((p) => p.test(email))

/** Pull any email-shaped strings out of an arbitrary JSON/array value. */
function harvestFromUnknown(value: unknown, found: string[] = []): string[] {
  if (typeof value === 'string') {
    const matches = value.match(/[^\s@"',;<>()[\]]+@[^\s@"',;<>()[\]]+\.[^\s@"',;<>()[\]]{2,}/g)
    if (matches) found.push(...matches)
  } else if (Array.isArray(value)) {
    value.forEach((v) => harvestFromUnknown(v, found))
  } else if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((v) => harvestFromUnknown(v, found))
  }
  return found
}

function record(partial: Omit<EmailRecord, 'email' | 'valid' | 'likelyTestData'> ): EmailRecord {
  const email = normalise(partial.originalEmail)
  return {
    ...partial,
    email,
    valid: isValid(email),
    likelyTestData: looksLikeTest(email),
  }
}

/* ── Collection ────────────────────────────────────────────────────────── */

async function collect(): Promise<EmailRecord[]> {
  const out: EmailRecord[] = []

  // 1. User.email — the agencies themselves. Highest-value records.
  //
  // Raw SQL rather than prisma.user.findMany() on purpose: the live database
  // has drifted from schema.prisma (the agency* / hideBranding columns were
  // never applied in production), so a typed select throws P2022. A
  // preservation script must survive drift — that is the whole point of it.
  const users = await prisma.$queryRawUnsafe<
    {
      id: string
      email: string | null
      fullname: string | null
      type: string | null
      createdAt: Date | null
      updatedAt: Date | null
      plan: string | null
      subStatus: string | null
      domainCount: bigint
    }[]
  >(`
    SELECT u.id, u.email, u.fullname, u.type, u."createdAt", u."updatedAt",
           b.plan::text            AS "plan",
           b.status                AS "subStatus",
           COUNT(d.id)             AS "domainCount"
    FROM "User" u
    LEFT JOIN "Billings" b ON b."userId" = u.id
    LEFT JOIN "Domain"   d ON d."userId" = u.id
    GROUP BY u.id, b.plan, b.status
  `)
  for (const u of users) {
    if (!u.email?.trim()) continue
    out.push(
      record({
        originalEmail: u.email,
        sourceTable: 'User',
        sourceId: u.id,
        kind: 'user',
        name: u.fullname ?? null,
        businessOrDomain: null,
        userType: u.type ?? null,
        plan: u.plan ?? null,
        consentStatus: null, // no consent field exists anywhere in the schema
        createdAt: u.createdAt?.toISOString() ?? null,
        updatedAt: u.updatedAt?.toISOString() ?? null,
        notes: `subscription=${u.subStatus ?? 'none'}; domains=${Number(u.domainCount)}`,
      })
    )
  }

  // 2. Customer.email — END CUSTOMERS OF OUR CUSTOMERS' CLIENTS.
  //    These are third parties who talked to a chatbot. See the consent warning
  //    in the summary: they did not opt in to hearing from ChatDock.
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      email: true,
      domainId: true,
      Domain: { select: { name: true, User: { select: { email: true } } } },
    },
  })
  for (const c of customers) {
    if (!c.email?.trim()) continue
    out.push(
      record({
        originalEmail: c.email,
        sourceTable: 'Customer',
        sourceId: c.id,
        kind: 'lead',
        name: null,
        businessOrDomain: c.Domain?.name ?? c.domainId ?? null,
        userType: null,
        plan: null,
        consentStatus: null,
        createdAt: null, // Customer has no createdAt in the current schema
        updatedAt: null,
        notes: `third-party lead; captured for agency=${c.Domain?.User?.email ?? 'unknown'}`,
      })
    )
  }

  // 3. Bookings.email — also third parties.
  const bookings = await prisma.bookings.findMany({
    select: { id: true, email: true, domainId: true, createdAt: true, customerId: true },
  })
  for (const b of bookings) {
    if (!b.email?.trim()) continue
    out.push(
      record({
        originalEmail: b.email,
        sourceTable: 'Bookings',
        sourceId: b.id,
        kind: 'booking',
        name: null,
        businessOrDomain: b.domainId ?? null,
        userType: null,
        plan: null,
        consentStatus: null,
        createdAt: b.createdAt?.toISOString() ?? null,
        updatedAt: null,
        notes: `booking; customerId=${b.customerId ?? 'none'}`,
      })
    )
  }

  // 4. Campaign.customers — a String[] of recipients. Harvested generically
  //    because the array's contents were never schema-constrained.
  const campaigns = await prisma.campaign.findMany({
    select: { id: true, name: true, customers: true, createdAt: true, User: { select: { email: true } } },
  })
  for (const c of campaigns) {
    for (const candidate of harvestFromUnknown(c.customers)) {
      out.push(
        record({
          originalEmail: candidate,
          sourceTable: 'Campaign.customers',
          sourceId: c.id,
          kind: 'campaign_recipient',
          name: null,
          businessOrDomain: c.name ?? null,
          userType: null,
          plan: null,
          consentStatus: null,
          createdAt: c.createdAt?.toISOString() ?? null,
          updatedAt: null,
          notes: `campaign="${c.name}"; owner=${c.User?.email ?? 'unknown'}`,
        })
      )
    }
  }

  // 5. Free-text sweep of JSON columns that could contain an address.
  //    ChatBot.theme / modePrompts are author-controlled and have held pasted
  //    contact details before. Cheap to check, expensive to have missed.
  const bots = await prisma.chatBot.findMany({
    select: { id: true, theme: true, modePrompts: true, welcomeMessage: true, Domain: { select: { name: true } } },
  })
  for (const b of bots) {
    const found = new Set([
      ...harvestFromUnknown(b.theme),
      ...harvestFromUnknown(b.modePrompts),
      ...harvestFromUnknown(b.welcomeMessage),
    ])
    for (const candidate of found) {
      out.push(
        record({
          originalEmail: candidate,
          sourceTable: 'ChatBot(json)',
          sourceId: b.id,
          kind: 'lead',
          name: null,
          businessOrDomain: b.Domain?.name ?? null,
          userType: null,
          plan: null,
          consentStatus: null,
          createdAt: null,
          updatedAt: null,
          notes: 'harvested from assistant configuration text',
        })
      )
    }
  }

  return out
}

/* ── Output ────────────────────────────────────────────────────────────── */

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(rows: EmailRecord[]): string {
  const headers: (keyof EmailRecord)[] = [
    'email', 'originalEmail', 'sourceTable', 'sourceId', 'kind', 'name',
    'businessOrDomain', 'userType', 'plan', 'consentStatus', 'createdAt',
    'updatedAt', 'valid', 'likelyTestData', 'notes',
  ]
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(',')),
  ].join('\n')
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('✖ DATABASE_URL is not set. Cannot reach the database — aborting.')
    process.exit(1)
  }

  console.log('→ Sweeping tables for email addresses (read-only)…')
  const raw = await collect()

  // Dedupe on the full provenance triple, never on the email alone.
  const seen = new Set<string>()
  const rows = raw.filter((r) => {
    const key = `${r.email}|${r.sourceTable}|${r.sourceId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const valid = rows.filter((r) => r.valid)
  const uniqueEmails = new Set(valid.map((r) => r.email))
  const bySource = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.sourceTable] = (acc[r.sourceTable] ?? 0) + 1
    return acc
  }, {})

  const summary = {
    generatedAt: new Date().toISOString(),
    totalRawRecords: raw.length,
    totalAfterProvenanceDedupe: rows.length,
    totalUniqueValidEmails: uniqueEmails.size,
    totalInvalid: rows.length - valid.length,
    totalLikelyTestOrInternal: rows.filter((r) => r.likelyTestData).length,
    bySourceTable: bySource,
    byKind: rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.kind] = (acc[r.kind] ?? 0) + 1
      return acc
    }, {}),
    consentWarning:
      'No consent field exists anywhere in the current schema. Records with ' +
      'kind=lead, booking or campaign_recipient are END CUSTOMERS OF ' +
      "CHATDOCK CUSTOMERS' CLIENTS. They never had a relationship with " +
      'ChatDock and did not opt in. Do not send them product-update email. ' +
      'Only kind=user records are plausible recipients, and even those need a ' +
      'lawful basis confirmed before any send.',
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'chatdock-email-backup.csv'), toCsv(rows), 'utf8')
  writeFileSync(join(OUT_DIR, 'chatdock-email-backup.json'), JSON.stringify(rows, null, 2), 'utf8')
  writeFileSync(join(OUT_DIR, 'chatdock-email-summary.json'), JSON.stringify(summary, null, 2), 'utf8')

  console.log('\n── Summary ──')
  console.table(summary.bySourceTable)
  console.log(`Raw records:            ${summary.totalRawRecords}`)
  console.log(`After provenance dedupe:${summary.totalAfterProvenanceDedupe}`)
  console.log(`Unique valid emails:    ${summary.totalUniqueValidEmails}`)
  console.log(`Invalid:                ${summary.totalInvalid}`)
  console.log(`Likely test/internal:   ${summary.totalLikelyTestOrInternal}`)
  console.log(`\nWritten to ${OUT_DIR}/ (gitignored)`)
  console.log(`\n⚠ ${summary.consentWarning}`)
}

main()
  .catch((e) => {
    console.error('✖ Export failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
