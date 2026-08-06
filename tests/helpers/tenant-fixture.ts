/**
 * Builds two complete, independent tenants so isolation can be proven rather
 * than assumed.
 *
 *   Org A — "Alpha Agency"
 *     ├─ workspace A1  (owner, manager, scopedMember, clientUser have access)
 *     └─ workspace A2  (scopedMember and clientUser must NOT reach this)
 *   Org B — "Beta Agency"
 *     └─ workspace B1  (nobody from Org A may reach this)
 *
 * Everything is namespaced with a per-run id and torn down afterwards, so the
 * suite can run against a database that also holds seed or real data without
 * touching either.
 */

import { randomUUID, createHash } from 'node:crypto'
import { client } from '@/lib/prisma'

export type TenantFixture = Awaited<ReturnType<typeof createTenantFixture>>

/** Deterministic unit vector — no embedding API call needed. */
export function pseudoEmbedding(text: string): number[] {
  const dims = 1536
  const out = new Array<number>(dims)
  let seed = createHash('sha256').update(text).digest()
  let sumSq = 0
  for (let i = 0; i < dims; i++) {
    if (i % 32 === 0) seed = createHash('sha256').update(new Uint8Array(seed)).digest()
    const v = (seed[i % 32] - 127.5) / 127.5
    out[i] = v
    sumSq += v * v
  }
  const norm = Math.sqrt(sumSq) || 1
  return out.map((v) => v / norm)
}

async function insertChunk(documentId: string, workspaceId: string, text: string, index = 0) {
  const vec = `[${pseudoEmbedding(text).join(',')}]`
  await client.$executeRawUnsafe(
    `INSERT INTO "KnowledgeChunk"
       ("knowledgeDocumentId","clientWorkspaceId","chunkIndex","content",
        "embeddingProvider","embeddingModel","embeddingVersion","embedding","updatedAt")
     VALUES ($1::uuid,$2::uuid,$3,$4,'test','test',1,$5::vector,NOW())`,
    documentId, workspaceId, index, text, vec
  )
}

async function buildWorkspace(
  organizationId: string,
  tag: string,
  label: string,
  creatorId: string,
  chunkTexts: string[]
) {
  const workspace = await client.clientWorkspace.create({
    data: {
      organizationId,
      name: `${label} ${tag}`,
      slug: `${label.toLowerCase()}-${tag}`,
      businessName: label,
      workspaceType: 'active_client',
      createdByUserId: creatorId,
    },
  })

  const assistant = await client.assistant.create({
    data: {
      clientWorkspaceId: workspace.id,
      name: `${label} assistant`,
      slug: `assistant-${tag}`,
      status: 'published',
      createdByUserId: creatorId,
    },
  })

  const source = await client.knowledgeSource.create({
    data: {
      clientWorkspaceId: workspace.id,
      sourceType: 'manual_text',
      name: `${label} source`,
      status: 'active',
      syncStatus: 'synced',
    },
  })

  await client.assistantKnowledgeSource.create({
    data: { assistantId: assistant.id, knowledgeSourceId: source.id, enabled: true },
  })

  const document = await client.knowledgeDocument.create({
    data: {
      knowledgeSourceId: source.id,
      clientWorkspaceId: workspace.id,
      canonicalUrl: `https://${label.toLowerCase()}-${tag}.example/page`,
      title: `${label} page`,
      status: 'active',
      extractedText: chunkTexts.join(' '),
    },
  })

  for (const [i, text] of chunkTexts.entries()) {
    await insertChunk(document.id, workspace.id, text, i)
  }

  const lead = await client.lead.create({
    data: {
      clientWorkspaceId: workspace.id,
      assistantId: assistant.id,
      name: `${label} lead`,
      phone: '(555) 000-0000',
      source: 'web_chat',
    },
  })

  return { workspace, assistant, source, document, lead }
}

/**
 * Removes everything a fixture run created, by tag.
 *
 * Split out of `teardown` so it can also run when *setup* fails. Vitest skips
 * `afterAll` when `beforeAll` throws, so a half-built fixture used to leak a
 * whole agency — organizations, workspaces, assistants, embedded chunks — into
 * whatever database the suite was pointed at. Ten of those had accumulated
 * before anyone noticed, and each one made the next run heavier.
 */
async function purgeByTag(tag: string) {
  await client.organization.deleteMany({
    where: { OR: [{ slug: `alpha-${tag}` }, { slug: `beta-${tag}` }] },
  })
  await client.user.deleteMany({ where: { email: { endsWith: `.${tag}@test.invalid` } } })
}

export async function createTenantFixture() {
  try {
    return await buildTenantFixture()
  } catch (error) {
    // Best-effort: the setup failure is the interesting one, so it is what
    // gets rethrown. A cleanup that also fails must not mask it.
    await purgeByTag(CURRENT_TAG).catch(() => {})
    throw error
  }
}

/** Set before any row is written, so a failed build is still cleanable. */
let CURRENT_TAG = ''

async function buildTenantFixture() {
  const tag = randomUUID().slice(0, 8)
  CURRENT_TAG = tag
  const mkUser = (name: string) =>
    client.user.create({
      data: {
        clerkId: `test_${name}_${tag}`,
        email: `${name}.${tag}@test.invalid`,
        fullName: name,
        status: 'active',
      },
    })

  // ── Org A ──
  const orgA = await client.organization.create({
    data: { name: `Alpha Agency ${tag}`, slug: `alpha-${tag}`, organizationType: 'agency' },
  })
  const ownerA = await mkUser('ownerA')
  const managerA = await mkUser('managerA')
  const scopedMemberA = await mkUser('scopedMemberA')
  const analystA = await mkUser('analystA')
  const billingA = await mkUser('billingA')
  const clientUserA = await mkUser('clientUserA')

  for (const [user, role] of [
    [ownerA, 'owner'],
    [managerA, 'manager'],
    [scopedMemberA, 'member'],
    [analystA, 'analyst'],
    [billingA, 'billing'],
  ] as const) {
    await client.organizationMembership.create({
      data: { organizationId: orgA.id, userId: user.id, role, status: 'active', acceptedAt: new Date() },
    })
  }

  const a1 = await buildWorkspace(orgA.id, tag, 'A1', ownerA.id, [
    'Alpha one whitening costs one hundred and ninety nine dollars.',
  ])
  const a2 = await buildWorkspace(orgA.id, tag, 'A2', ownerA.id, [
    'Alpha two emergency dispatch covers the metro area.',
  ])

  // scopedMember and the client user reach A1 only — never A2.
  await client.clientWorkspaceMembership.create({
    data: { clientWorkspaceId: a1.workspace.id, userId: scopedMemberA.id, role: 'agency_member', status: 'active', acceptedAt: new Date() },
  })
  await client.clientWorkspaceMembership.create({
    data: { clientWorkspaceId: a1.workspace.id, userId: clientUserA.id, role: 'client_admin', status: 'active', acceptedAt: new Date() },
  })

  // ── Org B ──
  const orgB = await client.organization.create({
    data: { name: `Beta Agency ${tag}`, slug: `beta-${tag}`, organizationType: 'agency' },
  })
  const ownerB = await mkUser('ownerB')
  await client.organizationMembership.create({
    data: { organizationId: orgB.id, userId: ownerB.id, role: 'owner', status: 'active', acceptedAt: new Date() },
  })

  // B1's chunk text is BYTE-IDENTICAL to A1's. Its embedding is therefore
  // identical, so a nearest-neighbour search from A1 would rank it joint-first
  // if scoping were broken. This is the strongest form of the test: the leak
  // cannot hide behind "it just wasn't similar enough".
  const b1 = await buildWorkspace(orgB.id, tag, 'B1', ownerB.id, [
    'Alpha one whitening costs one hundred and ninety nine dollars.',
  ])

  return {
    tag,
    orgA, orgB,
    users: { ownerA, managerA, scopedMemberA, analystA, billingA, clientUserA, ownerB },
    a1, a2, b1,

    async teardown() {
      await client.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } })
      await client.user.deleteMany({ where: { email: { endsWith: `.${tag}@test.invalid` } } })
      // Also sweep by tag, so a workspace created by a test rather than by the
      // fixture (a prospect demo, say) cannot outlive the run that made it.
      await purgeByTag(tag)
    },
  }
}
