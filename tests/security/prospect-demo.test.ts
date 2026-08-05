/**
 * Prospect demo links.
 *
 * A share token is an unauthenticated credential sitting in someone's inbox,
 * so it gets tested like one: what it opens, what it must not open, and what
 * happens when it lapses. The server actions themselves need a Clerk session,
 * so what is asserted here is the layer under them — the resolver a prospect
 * hits, the engagement writer, and the entitlement arithmetic that decides
 * whether a demo costs a client slot.
 */

import { randomBytes } from 'node:crypto'

import { beforeAll, afterAll, describe, expect, it } from 'vitest'

import { client } from '@/lib/prisma'
import { checkEntitlement } from '@/lib/entitlements'
import { resolveWidgetRequest } from '@/lib/widget/resolve'
import { recordDemoEngagement } from '@/lib/demos/engagement'
import { createTenantFixture, type TenantFixture } from '../helpers/tenant-fixture'

let f: TenantFixture
let demoWorkspaceId: string
let demoDeploymentId: string
let shareToken: string
let widgetKey: string

const DAY = 24 * 60 * 60 * 1000

beforeAll(async () => {
  f = await createTenantFixture()
  shareToken = randomBytes(24).toString('base64url')
  widgetKey = randomBytes(24).toString('base64url')

  // A prospect demo built the way onCreateProspectDemo builds one: its own
  // workspace, an expiry on both the workspace and the link, and a published
  // assistant (a demo is live the moment it exists).
  const workspace = await client.clientWorkspace.create({
    data: {
      organizationId: f.orgA.id,
      name: `prospect-${f.tag}`,
      slug: `demo-prospect-${f.tag}`,
      businessName: 'Prospect Co',
      workspaceType: 'prospect_demo',
      expiresAt: new Date(Date.now() + 14 * DAY),
      createdByUserId: f.users.ownerA.id,
    },
  })
  demoWorkspaceId = workspace.id

  const assistant = await client.assistant.create({
    data: {
      clientWorkspaceId: workspace.id,
      name: 'Prospect assistant',
      slug: `assistant-demo-${f.tag}`,
      status: 'published',
      publishedAt: new Date(),
      createdByUserId: f.users.ownerA.id,
    },
  })

  const deployment = await client.assistantDeployment.create({
    data: {
      assistantId: assistant.id,
      deploymentType: 'shareable_demo',
      publicKey: randomBytes(24).toString('base64url'),
      shareToken,
      status: 'active',
      expiresAt: new Date(Date.now() + 14 * DAY),
      allowedDomains: [],
    },
  })
  demoDeploymentId = deployment.id

  // A normal website widget on a real client, for the contrast tests.
  await client.assistantDeployment.create({
    data: {
      assistantId: f.a1.assistant.id,
      deploymentType: 'website_widget',
      publicKey: widgetKey,
      status: 'active',
      allowedDomains: [],
    },
  })
})

afterAll(async () => {
  await f?.teardown()
  await client.$disconnect()
})

describe('A share token opens exactly one demo', () => {
  it('resolves from any origin — a forwarded link still works', async () => {
    // The origin allow-list is deliberately not applied to shareable_demo: the
    // prospect forwards the link to a colleague and it has to keep working.
    const fromNowhere = await resolveWidgetRequest(shareToken, 'https://mail.google.com')
    expect(fromNowhere.ok).toBe(true)
    if (fromNowhere.ok) {
      expect(fromNowhere.context.clientWorkspaceId).toBe(demoWorkspaceId)
      expect(fromNowhere.context.channel).toBe('shareable_demo')
    }
  })

  it('a website widget key is not a demo, so /d/<key> cannot serve a real client', async () => {
    // resolveWidgetRequest matches publicKey OR shareToken, so the public demo
    // page must discriminate on channel. This pins the field it discriminates
    // on: if this ever stops being 'web_chat', that page leaks a live widget.
    const asDemo = await resolveWidgetRequest(widgetKey, null)
    expect(asDemo.ok).toBe(true)
    if (asDemo.ok) expect(asDemo.context.channel).toBe('web_chat')
  })

  it('an unknown token is a 404, indistinguishable from a revoked one', async () => {
    const unknown = await resolveWidgetRequest(randomBytes(12).toString('base64url'), null)
    expect(unknown.ok).toBe(false)
    if (!unknown.ok) expect(unknown.status).toBe(404)
  })
})

describe('A demo stops working when it should', () => {
  it('a revoked link is refused while the demo data survives', async () => {
    await client.assistantDeployment.update({
      where: { id: demoDeploymentId },
      data: { status: 'revoked', revokedAt: new Date() },
    })

    const revoked = await resolveWidgetRequest(shareToken, null)
    expect(revoked.ok).toBe(false)
    if (!revoked.ok) expect(revoked.code).toBe('deployment_inactive')

    // Revoking the link must not destroy the evidence the demo produced.
    const workspace = await client.clientWorkspace.findUnique({ where: { id: demoWorkspaceId } })
    expect(workspace).not.toBeNull()

    await client.assistantDeployment.update({
      where: { id: demoDeploymentId },
      data: { status: 'active', revokedAt: null },
    })
  })

  it('an expired link reports expiry, not a dead end', async () => {
    await client.assistantDeployment.update({
      where: { id: demoDeploymentId },
      data: { expiresAt: new Date(Date.now() - DAY) },
    })

    const expired = await resolveWidgetRequest(shareToken, null)
    expect(expired.ok).toBe(false)
    if (!expired.ok) {
      expect(expired.status).toBe(410)
      expect(expired.code).toBe('deployment_expired')
    }

    await client.assistantDeployment.update({
      where: { id: demoDeploymentId },
      data: { expiresAt: new Date(Date.now() + 14 * DAY) },
    })
  })

  it('an expired workspace expires the demo even when the link itself is live', async () => {
    await client.clientWorkspace.update({
      where: { id: demoWorkspaceId },
      data: { expiresAt: new Date(Date.now() - DAY) },
    })

    const expired = await resolveWidgetRequest(shareToken, null)
    expect(expired.ok).toBe(false)
    if (!expired.ok) expect(expired.code).toBe('demo_expired')

    await client.clientWorkspace.update({
      where: { id: demoWorkspaceId },
      data: { expiresAt: new Date(Date.now() + 14 * DAY) },
    })
  })
})

describe('Demos are metered separately from clients', () => {
  it('a prospect demo does not consume a client-workspace slot', async () => {
    const clients = await checkEntitlement(f.orgA.id, 'maximum_client_workspaces', 0)
    const demos = await checkEntitlement(f.orgA.id, 'maximum_prospect_demos', 0)

    // The fixture seeds exactly two real workspaces in org A, and this file
    // added one demo. If the demo were counted as a client, the first number
    // would be three.
    expect(clients.used).toBe(2n)
    expect(demos.used).toBe(1n)
  })

  it('an expired demo stops counting against the demo allowance', async () => {
    await client.clientWorkspace.update({
      where: { id: demoWorkspaceId },
      data: { expiresAt: new Date(Date.now() - DAY) },
    })

    const demos = await checkEntitlement(f.orgA.id, 'maximum_prospect_demos', 0)
    expect(demos.used).toBe(0n)

    await client.clientWorkspace.update({
      where: { id: demoWorkspaceId },
      data: { expiresAt: new Date(Date.now() + 14 * DAY) },
    })
  })

  it('converting a demo moves it onto the client count', async () => {
    await client.clientWorkspace.update({
      where: { id: demoWorkspaceId },
      data: { workspaceType: 'active_client', convertedAt: new Date(), expiresAt: null },
    })

    const clients = await checkEntitlement(f.orgA.id, 'maximum_client_workspaces', 0)
    const demos = await checkEntitlement(f.orgA.id, 'maximum_prospect_demos', 0)
    expect(clients.used).toBe(3n)
    expect(demos.used).toBe(0n)

    await client.clientWorkspace.update({
      where: { id: demoWorkspaceId },
      data: {
        workspaceType: 'prospect_demo',
        convertedAt: null,
        expiresAt: new Date(Date.now() + 14 * DAY),
      },
    })
  })
})

describe('Engagement is only recorded for a real demo', () => {
  it('records an open against the deployment the token names', async () => {
    const written = await recordDemoEngagement({
      shareToken,
      eventType: 'opened',
      anonymousId: 'anon-test',
      ip: '203.0.113.7',
      userAgent: 'vitest',
    })
    expect(written).toBe(true)

    const events = await client.deploymentEngagementEvent.findMany({
      where: { deploymentId: demoDeploymentId, eventType: 'opened' },
    })
    expect(events).toHaveLength(1)
    // The raw IP is never stored — only a salted daily hash.
    expect(events[0].ipHash).not.toBe('203.0.113.7')
    expect(events[0].ipHash).toHaveLength(32)
  })

  it('writes nothing for an unknown token', async () => {
    const written = await recordDemoEngagement({
      shareToken: randomBytes(12).toString('base64url'),
      eventType: 'opened',
    })
    expect(written).toBe(false)

    const total = await client.deploymentEngagementEvent.count({
      where: { deploymentId: demoDeploymentId },
    })
    expect(total).toBe(1)
  })

  it('writes nothing once the link is revoked', async () => {
    await client.assistantDeployment.update({
      where: { id: demoDeploymentId },
      data: { status: 'revoked' },
    })

    const written = await recordDemoEngagement({ shareToken, eventType: 'cta_clicked' })
    expect(written).toBe(false)

    await client.assistantDeployment.update({
      where: { id: demoDeploymentId },
      data: { status: 'active' },
    })
  })

  it('rejects an event type that is not one of the three', async () => {
    const written = await recordDemoEngagement({
      shareToken,
      eventType: 'exfiltrate' as never,
    })
    expect(written).toBe(false)
  })
})
