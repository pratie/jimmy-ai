'use server'

import { randomBytes } from 'node:crypto'

import { client } from '@/lib/prisma'
import {
  accessibleWorkspaceIds,
  requireOrganizationPermission,
  requireTenantContext,
  requireWorkspace,
} from '@/lib/tenant'
import { assertEntitlement, EntitlementError, hasFeature } from '@/lib/entitlements'
import { AuthorizationError } from '@/lib/permissions'
import { onScrapeWebsiteForDomain } from '@/actions/firecrawl'
import { devError } from '@/lib/utils'

/**
 * Prospect demos.
 *
 * An agency points this at a prospect's website; it crawls that site, builds a
 * real assistant on it, and returns a public link the prospect can open. The
 * sales pitch is the product already running on their own content.
 *
 * Three things make this different from `/demo`, the public sandbox on the
 * marketing site. This one **persists** — the same workspace/assistant/knowledge
 * models a paying client gets, so a demo that lands converts into a client
 * without rebuilding anything. It goes through the **real** widget path, so the
 * prospect is talking to retrieval over indexed chunks rather than one page
 * stuffed into a prompt. And it is **owned by an organization**, which is what
 * makes `maximum_prospect_demos` enforceable — an anonymous visitor has no
 * tenant to meter against, which is exactly why minting these is authenticated.
 *
 * The demo carries an expiry from the moment it is created. A share link that
 * lives forever is a liability: it is unauthenticated, it costs model spend on
 * every message, and a year from now nobody remembers which prospect it was
 * for. `resolveWidgetRequest` already honours both expiries (`demo_expired` for
 * the workspace, `deployment_expired` for the link).
 */

/** How long a new demo stays open. Long enough for a sales cycle, not forever. */
const DEMO_LIFETIME_DAYS = 14

const MAX_DEMO_LIFETIME_DAYS = 90

export type ProspectDemoRow = {
  workspaceId: string
  name: string
  websiteUrl: string | null
  shareToken: string | null
  expiresAt: Date | null
  convertedAt: Date | null
  createdAt: Date
  knowledgeChunks: number
  conversations: number
  leads: number
  /** Engagement, counted from DeploymentEngagementEvent. */
  opened: number
  started: number
  isExpired: boolean
}

function demoExpiry(days: number) {
  const clamped = Math.min(Math.max(Math.round(days), 1), MAX_DEMO_LIFETIME_DAYS)
  return new Date(Date.now() + clamped * 24 * 60 * 60 * 1000)
}

/** Strips scheme, path and trailing dots down to a bare hostname. */
function canonicalise(input: string) {
  const url = input.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '')
  const host = url.split('/')[0].toLowerCase().replace(/\.+$/, '')
  return host
}

function toResponse(error: unknown, fallback: string) {
  if (error instanceof EntitlementError) {
    return { status: 402 as const, message: error.message, upgradeRequired: true }
  }
  if (error instanceof AuthorizationError) {
    return { status: 403 as const, message: error.message, upgradeRequired: false }
  }
  devError(`[Demos] ${fallback}:`, error)
  return { status: 400 as const, message: fallback, upgradeRequired: false }
}

/* ── Create ─────────────────────────────────────────────────────────────── */

/**
 * Builds a prospect demo from a URL and returns its share token.
 *
 * The crawl runs inline. It takes tens of seconds, which is slow for a server
 * action — but a demo whose knowledge base is still filling is worse than a
 * slow button, because the agency's next move is to send the link. If this
 * grows a queue later, the seam is `IndexingJob`, which already exists.
 *
 * A failed crawl leaves nothing behind: the workspace is deleted rather than
 * left as an empty demo that answers nothing. Fabricated content is never a
 * fallback here, matching the rule `/demo` already follows.
 */
export const onCreateProspectDemo = async (url: string, lifetimeDays = DEMO_LIFETIME_DAYS) => {
  let createdWorkspaceId: string | null = null

  try {
    const ctx = await requireOrganizationPermission('createClientWorkspace')

    const domain = canonicalise(url)
    if (!domain || !domain.includes('.')) {
      return { status: 400 as const, message: 'Enter a website address, like acme.com' }
    }

    if (!(await hasFeature(ctx.organizationId, 'shareable_demos'))) {
      return {
        status: 402 as const,
        message: 'Shareable demos are not included in your plan',
        upgradeRequired: true,
      }
    }
    await assertEntitlement(ctx.organizationId, 'maximum_prospect_demos')

    const existing = await client.clientWorkspace.findFirst({
      where: {
        organizationId: ctx.organizationId,
        slug: `demo-${domain.replace(/[^a-z0-9]+/g, '-')}`,
        deletedAt: null,
      },
      select: { id: true },
    })
    if (existing) {
      return {
        status: 400 as const,
        message: 'You already have a demo for that website',
        workspaceId: existing.id,
      }
    }

    const expiresAt = demoExpiry(lifetimeDays)

    const created = await client.$transaction(async (tx) => {
      const workspace = await tx.clientWorkspace.create({
        data: {
          organizationId: ctx.organizationId,
          name: domain,
          slug: `demo-${domain.replace(/[^a-z0-9]+/g, '-')}`,
          businessName: domain,
          websiteUrl: `https://${domain}`,
          workspaceType: 'prospect_demo',
          expiresAt,
          createdByUserId: ctx.userId,
        },
      })

      // Only owners and admins reach a workspace without a membership row. A
      // manager who creates a demo would otherwise be denied on the very next
      // step — the crawl calls requireWorkspace on the workspace they just
      // made — and the failure would surface as "we couldn't read that site",
      // which is a lie about the prospect's website.
      if (!ctx.actor.hasImplicitWorkspaceAccess) {
        await tx.clientWorkspaceMembership.create({
          data: {
            clientWorkspaceId: workspace.id,
            userId: ctx.userId,
            role: 'agency_manager',
            status: 'active',
            acceptedAt: new Date(),
          },
        })
      }

      await tx.website.create({
        data: {
          clientWorkspaceId: workspace.id,
          name: 'Prospect website',
          url: `https://${domain}`,
          canonicalDomain: domain,
          isPrimary: true,
          allowedWidgetDomains: [domain, `www.${domain}`],
        },
      })

      const assistant = await tx.assistant.create({
        data: {
          clientWorkspaceId: workspace.id,
          name: `${domain} receptionist`,
          slug: 'receptionist',
          welcomeMessage: `Hi — ask me anything about ${domain}.`,
          fallbackMessage:
            "I can't confirm that from what's published on the site. Leave your name and number and someone will follow up.",
          // Published on creation, unlike a real client's assistant. For a
          // client, publishing is a deliberate act because it puts a widget in
          // front of their visitors; for a demo, creating it IS that act, and a
          // draft would only be a trap for whoever sends the link.
          status: 'published',
          publishedAt: new Date(),
          createdByUserId: ctx.userId,
        },
      })

      const deployment = await tx.assistantDeployment.create({
        data: {
          assistantId: assistant.id,
          deploymentType: 'shareable_demo',
          // Both keys exist: `publicKey` is required and non-null on every
          // deployment, `shareToken` is the secret that actually travels in the
          // link. They are independent so the link can be revoked without
          // disturbing anything else.
          publicKey: randomBytes(24).toString('base64url'),
          shareToken: randomBytes(24).toString('base64url'),
          status: 'active',
          expiresAt,
          allowedDomains: [],
          createdByUserId: ctx.userId,
        },
        select: { id: true, shareToken: true },
      })

      return { workspace, assistant, deployment }
    })

    createdWorkspaceId = created.workspace.id

    // Crawl and index. Reuses the client path wholesale — same Firecrawl call,
    // same chunking, same embeddings, same usage metering — so a demo is not a
    // second-class imitation of the product being sold.
    const crawl = await onScrapeWebsiteForDomain(created.workspace.id, `https://${domain}`)
    if (crawl.status !== 200) {
      await client.clientWorkspace.delete({ where: { id: created.workspace.id } })
      createdWorkspaceId = null
      return {
        status: 400 as const,
        message:
          'message' in crawl && crawl.message
            ? crawl.message
            : 'We could not read enough public content from that website',
      }
    }

    return {
      status: 200 as const,
      workspaceId: created.workspace.id,
      shareToken: created.deployment.shareToken,
      expiresAt,
      chunksCreated: 'chunksCreated' in crawl ? crawl.chunksCreated : 0,
      message: 'Demo ready',
    }
  } catch (error) {
    // Never leave a half-built demo behind — an empty one answers nothing and
    // still counts against the entitlement.
    if (createdWorkspaceId) {
      await client.clientWorkspace
        .delete({ where: { id: createdWorkspaceId } })
        .catch((cleanupError) => devError('[Demos] cleanup failed:', cleanupError))
    }
    return toResponse(error, 'Could not build that demo')
  }
}

/* ── Read ───────────────────────────────────────────────────────────────── */

export const onListProspectDemos = async () => {
  try {
    const ctx = await requireTenantContext()
    const ids = await accessibleWorkspaceIds(ctx)
    if (ids.length === 0) return { status: 200 as const, demos: [] as ProspectDemoRow[] }

    const workspaces = await client.clientWorkspace.findMany({
      where: { id: { in: ids }, workspaceType: 'prospect_demo', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        websiteUrl: true,
        expiresAt: true,
        convertedAt: true,
        createdAt: true,
        _count: { select: { knowledgeChunks: true, conversations: true, leads: true } },
        assistants: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: {
            deployments: {
              where: { deploymentType: 'shareable_demo' },
              orderBy: { createdAt: 'asc' },
              take: 1,
              select: { id: true, shareToken: true },
            },
          },
        },
      },
    })

    const deploymentIds = workspaces
      .map((w) => w.assistants[0]?.deployments[0]?.id)
      .filter((id): id is string => Boolean(id))

    const engagement = deploymentIds.length
      ? await client.deploymentEngagementEvent.groupBy({
          by: ['deploymentId', 'eventType'],
          where: { deploymentId: { in: deploymentIds } },
          _count: { _all: true },
        })
      : []

    const now = Date.now()
    const demos: ProspectDemoRow[] = workspaces.map((w) => {
      const deployment = w.assistants[0]?.deployments[0]
      const counts = engagement.filter((e) => e.deploymentId === deployment?.id)
      const countOf = (type: string) =>
        counts.find((c) => c.eventType === type)?._count._all ?? 0

      return {
        workspaceId: w.id,
        name: w.name,
        websiteUrl: w.websiteUrl,
        shareToken: deployment?.shareToken ?? null,
        expiresAt: w.expiresAt,
        convertedAt: w.convertedAt,
        createdAt: w.createdAt,
        knowledgeChunks: w._count.knowledgeChunks,
        conversations: w._count.conversations,
        leads: w._count.leads,
        opened: countOf('opened'),
        started: countOf('conversation_started'),
        isExpired: Boolean(w.expiresAt && w.expiresAt.getTime() < now),
      }
    })

    return { status: 200 as const, demos }
  } catch (error) {
    devError('[Demos] onListProspectDemos failed:', error)
    return { status: 400 as const, demos: [] as ProspectDemoRow[] }
  }
}

/* ── Lifecycle ──────────────────────────────────────────────────────────── */

/** Extends a demo that is still in play, or revives a lapsed one. */
export const onExtendProspectDemo = async (workspaceId: string, days = DEMO_LIFETIME_DAYS) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'manageClientWorkspace')
    const expiresAt = demoExpiry(days)

    await client.clientWorkspace.update({
      where: { id: access.clientWorkspaceId },
      data: { expiresAt },
    })
    await client.assistantDeployment.updateMany({
      where: {
        deploymentType: 'shareable_demo',
        assistant: { clientWorkspaceId: access.clientWorkspaceId },
      },
      data: { expiresAt, status: 'active' },
    })

    return { status: 200 as const, expiresAt, message: 'Demo extended' }
  } catch (error) {
    return toResponse(error, 'Could not extend that demo')
  }
}

/**
 * Kills the link immediately.
 *
 * Revokes the deployment rather than deleting the workspace: the conversations
 * a prospect had are the evidence the demo worked, and throwing them away to
 * close a link is a bad trade. Deleting the demo outright is a separate act.
 */
export const onRevokeProspectDemo = async (workspaceId: string) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'manageClientWorkspace')

    await client.assistantDeployment.updateMany({
      where: {
        deploymentType: 'shareable_demo',
        assistant: { clientWorkspaceId: access.clientWorkspaceId },
      },
      data: { status: 'revoked', revokedAt: new Date() },
    })
    await client.clientWorkspace.update({
      where: { id: access.clientWorkspaceId },
      data: { expiresAt: new Date() },
    })

    return { status: 200 as const, message: 'Link revoked' }
  } catch (error) {
    return toResponse(error, 'Could not revoke that link')
  }
}

/**
 * The demo landed. Turn it into a real client.
 *
 * This is the whole reason a demo is a real workspace rather than a scratch
 * object: conversion is a status change, not a migration. The knowledge base,
 * the assistant, the conversations and the leads the prospect generated all
 * survive, and the agency's next step is to install the widget on the site.
 *
 * It costs a client-workspace slot at this point and not before, which is why
 * the entitlement is asserted here rather than at creation.
 */
export const onConvertProspectDemo = async (workspaceId: string) => {
  try {
    const { ctx, access } = await requireWorkspace(workspaceId, 'manageClientWorkspace')

    const workspace = await client.clientWorkspace.findUnique({
      where: { id: access.clientWorkspaceId },
      select: { workspaceType: true, convertedAt: true },
    })
    if (!workspace) return { status: 404 as const, message: 'Demo not found' }
    if (workspace.workspaceType !== 'prospect_demo') {
      return { status: 400 as const, message: 'That client is already a real client' }
    }

    await assertEntitlement(ctx.organizationId, 'maximum_client_workspaces')

    await client.$transaction(async (tx) => {
      await tx.clientWorkspace.update({
        where: { id: access.clientWorkspaceId },
        data: {
          workspaceType: 'active_client',
          convertedAt: new Date(),
          // A real client does not expire.
          expiresAt: null,
        },
      })
      // The share link stops being a countdown too. It stays live on purpose:
      // the agency may still be walking the client through it while the widget
      // is being installed.
      await tx.assistantDeployment.updateMany({
        where: {
          deploymentType: 'shareable_demo',
          assistant: { clientWorkspaceId: access.clientWorkspaceId },
        },
        data: { expiresAt: null },
      })
    })

    return {
      status: 200 as const,
      workspaceId: access.clientWorkspaceId,
      message: 'Converted — this is a client now',
    }
  } catch (error) {
    return toResponse(error, 'Could not convert that demo')
  }
}
