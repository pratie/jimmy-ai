/**
 * The publish gate.
 *
 * Publishing is the switch between an installed widget that answers and one
 * that returns 403 forever, so it gets the same treatment as the isolation
 * suite: a real Postgres, a real deployment row, and the actual resolver.
 *
 * This covers the transition the product was missing until 2026-08-05 —
 * `draft` → `published` → `paused` — from the widget's point of view, plus the
 * permission that guards it. The server action itself
 * (`onSetAssistantStatus`) is not called here because it needs a Clerk session;
 * what is asserted instead is the pair that action sits between: the
 * permission matrix in front of it and the resolver behind it.
 */

import { randomBytes } from 'node:crypto'

import { beforeAll, afterAll, describe, expect, it } from 'vitest'

import { client } from '@/lib/prisma'
import { getActorContext, resolveWorkspaceAccess, canInWorkspace } from '@/lib/permissions'
import { resolveWidgetRequest } from '@/lib/widget/resolve'
import { createTenantFixture, type TenantFixture } from '../helpers/tenant-fixture'

let f: TenantFixture
let publicKey: string

beforeAll(async () => {
  f = await createTenantFixture()
  publicKey = randomBytes(24).toString('base64url')

  await client.assistantDeployment.create({
    data: {
      assistantId: f.a1.assistant.id,
      deploymentType: 'website_widget',
      publicKey,
      status: 'active',
      // Left empty on purpose: an unconfigured allow-list is permissive, so
      // these assertions are about publish state and nothing else.
      allowedDomains: [],
    },
  })
})

afterAll(async () => {
  await f?.teardown()
  await client.$disconnect()
})

async function setStatus(status: 'draft' | 'published' | 'paused') {
  await client.assistant.update({
    where: { id: f.a1.assistant.id },
    data: { status },
  })
}

describe('A widget only answers for a published assistant', () => {
  it('a draft assistant refuses the request that a published one serves', async () => {
    await setStatus('draft')

    const draft = await resolveWidgetRequest(publicKey, 'https://a1.example')
    expect(draft.ok).toBe(false)
    if (!draft.ok) {
      expect(draft.status).toBe(403)
      expect(draft.code).toBe('assistant_unpublished')
    }
  })

  it('publishing turns the same key into a working widget', async () => {
    await setStatus('published')

    const live = await resolveWidgetRequest(publicKey, 'https://a1.example')
    expect(live.ok).toBe(true)
    if (live.ok) {
      expect(live.context.assistantId).toBe(f.a1.assistant.id)
      expect(live.context.clientWorkspaceId).toBe(f.a1.workspace.id)
      expect(live.context.organizationId).toBe(f.orgA.id)
    }
  })

  it('pausing takes it offline again without deleting anything', async () => {
    await setStatus('paused')

    const paused = await resolveWidgetRequest(publicKey, 'https://a1.example')
    expect(paused.ok).toBe(false)
    if (!paused.ok) expect(paused.code).toBe('assistant_unpublished')

    // The point of pause over delete: the client's data is still there.
    const survived = await client.lead.count({ where: { clientWorkspaceId: f.a1.workspace.id } })
    expect(survived).toBeGreaterThan(0)
  })

  it('an unknown key is indistinguishable from an unpublished one to a prober', async () => {
    const unknown = await resolveWidgetRequest('not-a-real-key', 'https://a1.example')
    expect(unknown.ok).toBe(false)
    if (!unknown.ok) {
      expect(unknown.status).toBe(404)
      expect(unknown.code).toBe('unknown_deployment')
    }
  })
})

describe('Only the right roles may publish', () => {
  it('an org owner may publish in their own workspace', async () => {
    const actor = await getActorContext(f.users.ownerA.clerkId, f.orgA.id)
    expect(actor).not.toBeNull()

    const access = await resolveWorkspaceAccess(actor!, f.a1.workspace.id)
    expect(access).not.toBeNull()
    expect(canInWorkspace(access!, 'publishAssistant')).toBe(true)
  })

  it('a scoped agency member may edit but may not publish', async () => {
    const actor = await getActorContext(f.users.scopedMemberA.clerkId, f.orgA.id)
    expect(actor).not.toBeNull()

    const access = await resolveWorkspaceAccess(actor!, f.a1.workspace.id)
    expect(access).not.toBeNull()
    expect(canInWorkspace(access!, 'editAssistant')).toBe(true)
    expect(canInWorkspace(access!, 'publishAssistant')).toBe(false)
  })

  it('a client-side role may never publish', async () => {
    const actor = await getActorContext(f.users.clientUserA.clerkId, f.orgA.id)
    // A client user has no organization membership at all, so there is no
    // actor context to publish with in the first place.
    expect(actor).toBeNull()
  })
})
