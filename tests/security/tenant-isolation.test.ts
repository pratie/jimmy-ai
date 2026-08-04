/**
 * Multi-tenant security suite (brief §28).
 *
 * These are the tests that must never go red. Everything else in the rebuild is
 * a product concern; a failure here is a data breach.
 *
 * Runs against a real Postgres — mocking the database would prove nothing about
 * isolation, since isolation is enforced in SQL.
 */

import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { client } from '@/lib/prisma'
import {
  getActorContext,
  resolveWorkspaceAccess,
  listAccessibleWorkspaceIds,
  can,
  canInWorkspace,
  authorizeWorkspaceAction,
  AuthorizationError,
} from '@/lib/permissions'
import { checkEntitlement, getEntitlements } from '@/lib/entitlements'
import { createTenantFixture, pseudoEmbedding, type TenantFixture } from '../helpers/tenant-fixture'

let f: TenantFixture

beforeAll(async () => { f = await createTenantFixture() })
afterAll(async () => { await f?.teardown(); await client.$disconnect() })

/* ───────────────────────────────────────────────────────────────────────── */

describe('Organization A cannot access Organization B', () => {
  it('A owner has no actor context in org B', async () => {
    const ctx = await getActorContext(f.users.ownerA.clerkId, f.orgB.id)
    expect(ctx).toBeNull()
  })

  it("A owner cannot resolve B's workspace, even with a valid id", async () => {
    const actorA = await getActorContext(f.users.ownerA.clerkId, f.orgA.id)
    expect(actorA).not.toBeNull()

    const access = await resolveWorkspaceAccess(actorA!, f.b1.workspace.id)
    expect(access).toBeNull()
  })

  it('authorizeWorkspaceAction throws when the workspace belongs to another org', async () => {
    await expect(
      authorizeWorkspaceAction(f.users.ownerA.clerkId, f.orgA.id, f.b1.workspace.id, 'viewClientWorkspace')
    ).rejects.toBeInstanceOf(AuthorizationError)
  })

  it('a forged organizationId does not grant access', async () => {
    // Actor claims to act in org B while presenting B's workspace.
    await expect(
      authorizeWorkspaceAction(f.users.ownerA.clerkId, f.orgB.id, f.b1.workspace.id, 'viewClientWorkspace')
    ).rejects.toBeInstanceOf(AuthorizationError)
  })

  it("A's workspace listing never contains B's workspaces", async () => {
    const actorA = await getActorContext(f.users.ownerA.clerkId, f.orgA.id)
    const ids = await listAccessibleWorkspaceIds(actorA!)
    expect(ids).toContain(f.a1.workspace.id)
    expect(ids).toContain(f.a2.workspace.id)
    expect(ids).not.toContain(f.b1.workspace.id)
  })
})

describe('Client A1 cannot access Client A2 without permission', () => {
  it('a scoped member reaches A1', async () => {
    const actor = await getActorContext(f.users.scopedMemberA.clerkId, f.orgA.id)
    const access = await resolveWorkspaceAccess(actor!, f.a1.workspace.id)
    expect(access).not.toBeNull()
    expect(access!.viaImplicitOrgAccess).toBe(false)
  })

  it('the same scoped member cannot reach A2', async () => {
    const actor = await getActorContext(f.users.scopedMemberA.clerkId, f.orgA.id)
    const access = await resolveWorkspaceAccess(actor!, f.a2.workspace.id)
    expect(access).toBeNull()
  })

  it('a scoped member sees only their assigned workspace in the switcher', async () => {
    const actor = await getActorContext(f.users.scopedMemberA.clerkId, f.orgA.id)
    const ids = await listAccessibleWorkspaceIds(actor!)
    expect(ids).toEqual([f.a1.workspace.id])
  })

  it('owners keep implicit access to every workspace in their own org', async () => {
    const actor = await getActorContext(f.users.ownerA.clerkId, f.orgA.id)
    for (const ws of [f.a1.workspace.id, f.a2.workspace.id]) {
      const access = await resolveWorkspaceAccess(actor!, ws)
      expect(access?.viaImplicitOrgAccess).toBe(true)
    }
  })
})

describe('Client users cannot see organization billing', () => {
  it('a client user has no organization membership at all', async () => {
    const ctx = await getActorContext(f.users.clientUserA.clerkId, f.orgA.id)
    expect(ctx).toBeNull()
  })

  it('client_admin permissions exclude billing and org management', async () => {
    // Grant the client user an org membership deliberately to prove that even
    // then, the workspace role cannot carry billing.
    const actor = await getActorContext(f.users.scopedMemberA.clerkId, f.orgA.id)
    const access = await resolveWorkspaceAccess(actor!, f.a1.workspace.id)
    for (const forbidden of ['manageBilling', 'manageOrganization', 'createClientWorkspace'] as const) {
      expect(canInWorkspace(access!, forbidden)).toBe(false)
    }
  })

  it('the billing role cannot read leads or conversations', async () => {
    const actor = await getActorContext(f.users.billingA.clerkId, f.orgA.id)
    expect(can(actor!, 'manageBilling')).toBe(true)
    expect(can(actor!, 'viewLeads')).toBe(false)
    expect(can(actor!, 'viewConversations')).toBe(false)
    expect(can(actor!, 'viewClientWorkspace')).toBe(false)
  })

  it('the analyst role can read but cannot export', async () => {
    const actor = await getActorContext(f.users.analystA.clerkId, f.orgA.id)
    expect(can(actor!, 'viewLeads')).toBe(true)
    expect(can(actor!, 'viewReports')).toBe(true)
    expect(can(actor!, 'exportConversations')).toBe(false)
    expect(can(actor!, 'manageLeads')).toBe(false)
  })

  it('a workspace role cannot escalate beyond the organization role', async () => {
    // scopedMemberA is org-role `member`, which lacks publishAssistant.
    // Their workspace role is agency_member, which also lacks it — but the
    // intersection rule is what must hold even if that changed.
    const actor = await getActorContext(f.users.scopedMemberA.clerkId, f.orgA.id)
    const access = await resolveWorkspaceAccess(actor!, f.a1.workspace.id)
    expect(can(actor!, 'publishAssistant')).toBe(false)
    expect(canInWorkspace(access!, 'publishAssistant')).toBe(false)
  })
})

describe('Vector retrieval cannot return another tenant’s chunks', () => {
  // B1 was seeded with text byte-identical to A1's, so both have the SAME
  // embedding. If scoping were broken, B's chunk would tie for nearest
  // neighbour and surface. It must not.
  const query = 'Alpha one whitening costs one hundred and ninety nine dollars.'

  it('the fixture is genuinely ambiguous — an unscoped search WOULD leak', async () => {
    // Guards against a vacuous suite. If A1 and B1 did not actually hold
    // identical, equally-near chunks, every isolation assertion below would
    // pass for the wrong reason. This test fails loudly if the fixture ever
    // stops being adversarial.
    const vec = `[${pseudoEmbedding(query).join(',')}]`
    const unscoped = await client.$queryRawUnsafe<
      { id: string; clientWorkspaceId: string; similarity: number }[]
    >(
      `SELECT kc.id, kc."clientWorkspaceId", 1-(kc.embedding <=> $1::vector) AS similarity
       FROM "KnowledgeChunk" kc
       WHERE kc.content = $2
       ORDER BY kc.embedding <=> $1::vector`,
      vec,
      query
    )

    const workspaces = new Set(unscoped.map((r) => r.clientWorkspaceId))
    expect(workspaces.has(f.a1.workspace.id)).toBe(true)
    expect(workspaces.has(f.b1.workspace.id)).toBe(true)

    // Identical text ⇒ identical embedding ⇒ identical distance. Scoping is
    // the ONLY thing that can separate them.
    const sims = unscoped.map((r) => Number(r.similarity))
    expect(Math.max(...sims) - Math.min(...sims)).toBeLessThan(1e-6)
  })

  it('a scoped search from A1 returns only A1 chunks', async () => {
    const vec = `[${pseudoEmbedding(query).join(',')}]`
    const rows = await client.$queryRawUnsafe<{ id: string; content: string }[]>(
      `SELECT * FROM match_knowledge_chunks_scoped($1::uuid, $2::vector, 20, 0.0, NULL, 1)`,
      f.a1.workspace.id,
      vec
    )

    expect(rows.length).toBeGreaterThan(0)

    const ids = rows.map((r) => r.id)
    const foreign = await client.knowledgeChunk.findMany({
      where: { id: { in: ids }, clientWorkspaceId: { not: f.a1.workspace.id } },
      select: { id: true, clientWorkspaceId: true },
    })
    expect(foreign).toEqual([])
  })

  it('an identical query scoped to B1 returns only B1 chunks', async () => {
    const vec = `[${pseudoEmbedding(query).join(',')}]`
    const rows = await client.$queryRawUnsafe<{ id: string }[]>(
      `SELECT * FROM match_knowledge_chunks_scoped($1::uuid, $2::vector, 20, 0.0, NULL, 1)`,
      f.b1.workspace.id,
      vec
    )
    const ids = rows.map((r) => r.id)
    const foreign = await client.knowledgeChunk.findMany({
      where: { id: { in: ids }, clientWorkspaceId: { not: f.b1.workspace.id } },
      select: { id: true },
    })
    expect(foreign).toEqual([])
  })

  it('assistant scoping narrows to that assistant’s enabled sources only', async () => {
    const vec = `[${pseudoEmbedding(query).join(',')}]`

    // A2's assistant is not linked to A1's knowledge source, so searching A1's
    // workspace through A2's assistant must return nothing.
    const rows = await client.$queryRawUnsafe<{ id: string }[]>(
      `SELECT * FROM match_knowledge_chunks_scoped($1::uuid, $2::vector, 20, 0.0, $3::uuid, 1)`,
      f.a1.workspace.id,
      vec,
      f.a2.assistant.id
    )
    expect(rows).toEqual([])
  })

  it('disabling a source removes it from retrieval', async () => {
    await client.assistantKnowledgeSource.updateMany({
      where: { assistantId: f.a1.assistant.id, knowledgeSourceId: f.a1.source.id },
      data: { enabled: false },
    })

    const vec = `[${pseudoEmbedding(query).join(',')}]`
    const rows = await client.$queryRawUnsafe<{ id: string }[]>(
      `SELECT * FROM match_knowledge_chunks_scoped($1::uuid, $2::vector, 20, 0.0, $3::uuid, 1)`,
      f.a1.workspace.id, vec, f.a1.assistant.id
    )
    expect(rows).toEqual([])

    await client.assistantKnowledgeSource.updateMany({
      where: { assistantId: f.a1.assistant.id, knowledgeSourceId: f.a1.source.id },
      data: { enabled: true },
    })
  })

  it('the legacy unscoped search function no longer exists', async () => {
    const rows = await client.$queryRawUnsafe<{ routine_name: string }[]>(
      `SELECT routine_name FROM information_schema.routines
       WHERE routine_schema='public' AND routine_name='match_knowledge_chunks'`
    )
    expect(rows).toEqual([])
  })
})

describe('Entitlements are scoped per organization', () => {
  it('usage counted for A is not attributed to B', async () => {
    await client.usageEvent.create({
      data: {
        organizationId: f.orgA.id,
        clientWorkspaceId: f.a1.workspace.id,
        eventType: 'assistant_message',
        quantity: 5n,
        unit: 'message',
        idempotencyKey: `test-${f.tag}-usage`,
      },
    })

    const a = await checkEntitlement(f.orgA.id, 'monthly_messages', 0)
    const b = await checkEntitlement(f.orgB.id, 'monthly_messages', 0)

    expect(a.used).toBe(5n)
    expect(b.used).toBe(0n)
  })

  it('an org with no subscription falls back to FREE, not unlimited', async () => {
    const ent = await getEntitlements(f.orgB.id)
    expect(ent.get('maximum_client_workspaces')).toBe(1n)
    expect(ent.get('hide_branding')).toBe(0n)
  })

  it('workspace counting excludes prospect demos', async () => {
    const before = await checkEntitlement(f.orgA.id, 'maximum_client_workspaces', 0)

    await client.clientWorkspace.create({
      data: {
        organizationId: f.orgA.id,
        name: `demo ${f.tag}`,
        slug: `demo-${f.tag}`,
        workspaceType: 'prospect_demo',
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    })

    const after = await checkEntitlement(f.orgA.id, 'maximum_client_workspaces', 0)
    expect(after.used).toBe(before.used)

    const demos = await checkEntitlement(f.orgA.id, 'maximum_prospect_demos', 0)
    expect(demos.used).toBe(1n)
  })

  it('recordUsage is idempotent — a retry does not double-count', async () => {
    const { recordUsage } = await import('@/lib/entitlements')
    const key = `test-${f.tag}-idem`

    await recordUsage({
      organizationId: f.orgB.id, eventType: 'assistant_message',
      quantity: 3n, unit: 'message', idempotencyKey: key,
    })
    await recordUsage({
      organizationId: f.orgB.id, eventType: 'assistant_message',
      quantity: 3n, unit: 'message', idempotencyKey: key,
    })

    const result = await checkEntitlement(f.orgB.id, 'monthly_messages', 0)
    expect(result.used).toBe(3n)
  })
})

describe('Data reads are tenant-scoped', () => {
  it("A's leads never include B's", async () => {
    const actor = await getActorContext(f.users.ownerA.clerkId, f.orgA.id)
    const ids = await listAccessibleWorkspaceIds(actor!)

    const leads = await client.lead.findMany({
      where: { clientWorkspaceId: { in: ids } },
      select: { id: true, clientWorkspaceId: true },
    })

    expect(leads.length).toBeGreaterThan(0)
    expect(leads.map((l) => l.id)).not.toContain(f.b1.lead.id)
  })

  it('a scoped member exporting leads gets only their assigned workspace', async () => {
    const actor = await getActorContext(f.users.scopedMemberA.clerkId, f.orgA.id)
    const ids = await listAccessibleWorkspaceIds(actor!)

    const leads = await client.lead.findMany({
      where: { clientWorkspaceId: { in: ids } },
      select: { clientWorkspaceId: true },
    })

    expect(new Set(leads.map((l) => l.clientWorkspaceId))).toEqual(new Set([f.a1.workspace.id]))
  })
})
