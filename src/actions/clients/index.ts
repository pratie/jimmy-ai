'use server'

import { client } from '@/lib/prisma'
import {
  accessibleWorkspaceIds,
  requireTenantContext,
  requireWorkspace,
} from '@/lib/tenant'
import { checkEntitlement } from '@/lib/entitlements'
import { AuthorizationError } from '@/lib/permissions'

/**
 * Agency- and client-level reads for the rebuilt dashboard.
 *
 * Every query is scoped by `accessibleWorkspaceIds` or `requireWorkspace`, so a
 * member assigned to two clients cannot see the other ten by changing a URL.
 * The old dashboard queried by `clerkId` on a nested relation, which happened to
 * be safe but put the tenant check somewhere different in every function.
 */

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/* ── Agency overview ────────────────────────────────────────────────────── */

/**
 * Roll-up across every client the caller can see.
 *
 * Counts are computed over the accessible set, not the whole organization —
 * a scoped member's "total leads" must mean *their* clients' leads, or the
 * number is meaningless to them and leaks the size of the roster.
 */
export const onGetAgencyOverview = async () => {
  try {
    const ctx = await requireTenantContext()
    const workspaceIds = await accessibleWorkspaceIds(ctx)

    if (workspaceIds.length === 0) {
      return {
        status: 200,
        organizationId: ctx.organizationId,
        role: ctx.actor.organizationRole,
        totals: { clients: 0, assistants: 0, conversations: 0, leads: 0, bookings: 0 },
        recentLeads: [],
        needsAttention: [],
        usage: null,
      }
    }

    const since = new Date(Date.now() - THIRTY_DAYS_MS)
    const scope = { clientWorkspaceId: { in: workspaceIds } }

    const [clients, assistants, conversations, leads, bookings, recentLeads, messagesUsage] =
      await Promise.all([
        client.clientWorkspace.count({
          where: {
            id: { in: workspaceIds },
            deletedAt: null,
            workspaceType: { in: ['active_client', 'direct_business'] },
          },
        }),
        client.assistant.count({ where: { ...scope, deletedAt: null } }),
        client.conversation.count({ where: { ...scope, startedAt: { gte: since } } }),
        client.lead.count({ where: { ...scope, archivedAt: null, createdAt: { gte: since } } }),
        client.bookingRequest.count({ where: { ...scope, createdAt: { gte: since } } }),
        client.lead.findMany({
          where: { ...scope, archivedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
            clientWorkspace: { select: { id: true, name: true, businessName: true } },
          },
        }),
        checkEntitlement(ctx.organizationId, 'monthly_messages', 0),
      ])

    // Clients whose assistant is not live, or that have no knowledge — the two
    // states where the agency is paying attention to nothing happening.
    const attention = await client.clientWorkspace.findMany({
      where: {
        id: { in: workspaceIds },
        deletedAt: null,
        workspaceType: { in: ['active_client', 'direct_business'] },
        OR: [
          { assistants: { none: { status: 'published', deletedAt: null } } },
          { knowledgeChunks: { none: {} } },
        ],
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        _count: { select: { assistants: true, knowledgeChunks: true } },
        assistants: { where: { deletedAt: null }, select: { status: true }, take: 1 },
      },
      take: 6,
    })

    return {
      status: 200,
      organizationId: ctx.organizationId,
      role: ctx.actor.organizationRole,
      totals: { clients, assistants, conversations, leads, bookings },
      recentLeads,
      needsAttention: attention.map((w) => ({
        id: w.id,
        name: w.businessName ?? w.name,
        reason:
          w._count.knowledgeChunks === 0
            ? ('no_knowledge' as const)
            : ('not_published' as const),
      })),
      usage: {
        messagesUsed: Number(messagesUsage.used),
        messagesLimit: messagesUsage.limit === null ? null : Number(messagesUsage.limit),
      },
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403 as const, message: error.message }
    console.error('[Clients] onGetAgencyOverview failed:', error)
    return { status: 400 as const, message: 'Could not load the overview' }
  }
}

/* ── Client list ────────────────────────────────────────────────────────── */

export type ClientRow = {
  id: string
  name: string
  businessName: string | null
  slug: string
  workspaceType: string
  status: string
  logoUrl: string | null
  primaryColor: string | null
  websiteUrl: string | null
  industry: string | null
  expiresAt: Date | null
  assistantStatus: string | null
  knowledgeChunks: number
  conversations30d: number
  leads30d: number
  bookings30d: number
}

/** Every client the caller may see, with the numbers a roster view needs. */
export const onGetClients = async (): Promise<
  { status: 200; clients: ClientRow[] } | { status: number; message: string; clients: [] }
> => {
  try {
    const ctx = await requireTenantContext()
    const workspaceIds = await accessibleWorkspaceIds(ctx)
    if (workspaceIds.length === 0) return { status: 200, clients: [] }

    const since = new Date(Date.now() - THIRTY_DAYS_MS)

    const workspaces = await client.clientWorkspace.findMany({
      where: { id: { in: workspaceIds }, deletedAt: null },
      orderBy: [{ workspaceType: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        businessName: true,
        slug: true,
        workspaceType: true,
        status: true,
        logoUrl: true,
        primaryColor: true,
        websiteUrl: true,
        industry: true,
        expiresAt: true,
        assistants: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { status: true },
        },
        _count: {
          select: {
            knowledgeChunks: true,
            conversations: { where: { startedAt: { gte: since } } },
            leads: { where: { createdAt: { gte: since }, archivedAt: null } },
            bookingRequests: { where: { createdAt: { gte: since } } },
          },
        },
      },
    })

    return {
      status: 200,
      clients: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        businessName: w.businessName,
        slug: w.slug,
        workspaceType: w.workspaceType,
        status: w.status,
        logoUrl: w.logoUrl,
        primaryColor: w.primaryColor,
        websiteUrl: w.websiteUrl,
        industry: w.industry,
        expiresAt: w.expiresAt,
        assistantStatus: w.assistants[0]?.status ?? null,
        knowledgeChunks: w._count.knowledgeChunks,
        conversations30d: w._count.conversations,
        leads30d: w._count.leads,
        bookings30d: w._count.bookingRequests,
      })),
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403, message: error.message, clients: [] }
    console.error('[Clients] onGetClients failed:', error)
    return { status: 400, message: 'Could not load clients', clients: [] }
  }
}

/* ── Client detail ──────────────────────────────────────────────────────── */

/**
 * One client's overview — the screen an agency opens on a monthly review call.
 *
 * Returns null when the id does not belong to the caller's organization or they
 * are not assigned to it, so the page can 404 rather than leak existence.
 */
export const onGetClientOverview = async (workspaceId: string) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'viewClientWorkspace')
    const id = access.clientWorkspaceId
    const since = new Date(Date.now() - THIRTY_DAYS_MS)

    const [workspace, conversations, leads, bookings, resolved, afterHours, topQuestions, gaps] =
      await Promise.all([
        client.clientWorkspace.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            businessName: true,
            slug: true,
            workspaceType: true,
            status: true,
            logoUrl: true,
            primaryColor: true,
            websiteUrl: true,
            industry: true,
            contactEmail: true,
            expiresAt: true,
            createdAt: true,
            websites: {
              where: { deletedAt: null },
              select: { id: true, name: true, url: true, canonicalDomain: true, isPrimary: true, status: true },
            },
            assistants: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'asc' },
              select: {
                id: true, name: true, slug: true, status: true, mode: true,
                publishedAt: true,
                _count: { select: { deployments: true, conversations: true } },
              },
            },
            knowledgeSources: {
              where: { deletedAt: null },
              select: { id: true, name: true, sourceType: true, syncStatus: true, lastSyncedAt: true },
            },
            _count: { select: { knowledgeChunks: true, knowledgeDocuments: true } },
          },
        }),
        client.conversation.count({ where: { clientWorkspaceId: id, startedAt: { gte: since } } }),
        client.lead.count({ where: { clientWorkspaceId: id, archivedAt: null, createdAt: { gte: since } } }),
        client.bookingRequest.count({ where: { clientWorkspaceId: id, createdAt: { gte: since } } }),
        client.conversation.count({
          where: {
            clientWorkspaceId: id,
            startedAt: { gte: since },
            resolutionStatus: 'resolved_by_assistant',
          },
        }),
        // Conversations that started outside 9–17 UTC. Approximate — the
        // client's real opening hours are not modelled yet, so this is labelled
        // as "outside 9–5" in the UI rather than "after hours".
        client.$queryRawUnsafe<{ n: bigint }[]>(
          `SELECT COUNT(*)::bigint AS n FROM "Conversation"
           WHERE "clientWorkspaceId" = $1::uuid AND "startedAt" >= $2
             AND (EXTRACT(HOUR FROM "startedAt") < 9 OR EXTRACT(HOUR FROM "startedAt") >= 17)`,
          id,
          since
        ),
        client.$queryRawUnsafe<{ content: string; n: bigint }[]>(
          `SELECT m.content, COUNT(*)::bigint AS n
           FROM "Message" m
           WHERE m."clientWorkspaceId" = $1::uuid AND m.role = 'visitor' AND m."createdAt" >= $2
           GROUP BY m.content ORDER BY n DESC LIMIT 5`,
          id,
          since
        ),
        // Turns where the assistant produced no citation — the closest signal
        // we have to "asked something the knowledge base could not answer".
        client.$queryRawUnsafe<{ content: string; n: bigint }[]>(
          `SELECT prev.content, COUNT(*)::bigint AS n
           FROM "Message" m
           JOIN LATERAL (
             SELECT p.content FROM "Message" p
             WHERE p."conversationId" = m."conversationId" AND p.role = 'visitor'
               AND p."createdAt" < m."createdAt"
             ORDER BY p."createdAt" DESC LIMIT 1
           ) prev ON TRUE
           WHERE m."clientWorkspaceId" = $1::uuid AND m.role = 'assistant'
             AND m."createdAt" >= $2
             AND NOT EXISTS (SELECT 1 FROM "MessageCitation" c WHERE c."messageId" = m.id)
           GROUP BY prev.content ORDER BY n DESC LIMIT 5`,
          id,
          since
        ),
      ])

    if (!workspace) return { status: 404 as const, message: 'Client not found' }

    return {
      status: 200 as const,
      workspace,
      canManage: access.permissions.has('manageClientWorkspace'),
      metrics: {
        conversations,
        leads,
        bookings,
        resolvedByAssistant: resolved,
        outsideNineToFive: Number(afterHours[0]?.n ?? 0),
        resolutionRate: conversations > 0 ? Math.round((resolved / conversations) * 100) : 0,
      },
      topQuestions: topQuestions.map((q) => ({ question: q.content, count: Number(q.n) })),
      contentGaps: gaps.map((q) => ({ question: q.content, count: Number(q.n) })),
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403 as const, message: error.message }
    console.error('[Clients] onGetClientOverview failed:', error)
    return { status: 400 as const, message: 'Could not load this client' }
  }
}

/** Lightweight list for the switcher — no counts, so it stays cheap. */
export const onGetWorkspaceSwitcherOptions = async () => {
  try {
    const ctx = await requireTenantContext()
    const ids = await accessibleWorkspaceIds(ctx)

    const [workspaces, organization] = await Promise.all([
      ids.length
        ? client.clientWorkspace.findMany({
            where: { id: { in: ids }, deletedAt: null, archivedAt: null },
            orderBy: [{ workspaceType: 'asc' }, { name: 'asc' }],
            select: {
              id: true, name: true, businessName: true, logoUrl: true,
              primaryColor: true, workspaceType: true,
            },
          })
        : Promise.resolve([]),
      client.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { id: true, name: true, organizationType: true, logoUrl: true },
      }),
    ])

    return { status: 200 as const, workspaces, organization, role: ctx.actor.organizationRole }
  } catch {
    return { status: 400 as const, workspaces: [], organization: null, role: null }
  }
}

/* ── Activity ───────────────────────────────────────────────────────────── */

export type ActivityItem = {
  id: string
  kind: 'lead' | 'booking' | 'handoff' | 'published' | 'knowledge'
  title: string
  clientName: string
  clientId: string
  at: Date
}

/**
 * Recent events worth an operator's attention, across accessible clients.
 *
 * Deliberately excludes message-level noise: an agency owner does not need a
 * feed entry per chat turn, and burying a booking request under two hundred of
 * them is how a feed becomes something people stop reading.
 */
export const onGetRecentActivity = async (limit = 12) => {
  try {
    const ctx = await requireTenantContext()
    const ids = await accessibleWorkspaceIds(ctx)
    if (ids.length === 0) return { status: 200 as const, activity: [] as ActivityItem[] }

    const scope = { clientWorkspaceId: { in: ids } }
    const naming = { clientWorkspace: { select: { id: true, name: true, businessName: true } } }

    const [leads, bookings, handoffs, published] = await Promise.all([
      client.lead.findMany({
        where: { ...scope, archivedAt: null },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, name: true, email: true, phone: true, createdAt: true, ...naming },
      }),
      client.bookingRequest.findMany({
        where: scope,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, status: true, requestedStartAt: true, createdAt: true, ...naming },
      }),
      client.conversation.findMany({
        where: { ...scope, handoffStatus: { in: ['requested', 'accepted', 'active'] } },
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
        select: { id: true, handoffStatus: true, lastMessageAt: true, startedAt: true, ...naming },
      }),
      client.assistant.findMany({
        where: { ...scope, status: 'published', publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: { id: true, name: true, publishedAt: true, ...naming },
      }),
    ])

    const label = (w: { name: string; businessName: string | null }) => w.businessName ?? w.name

    const activity: ActivityItem[] = [
      ...leads.map((l) => ({
        id: `lead-${l.id}`,
        kind: 'lead' as const,
        title: `New lead — ${l.name ?? l.email ?? l.phone ?? 'contact captured'}`,
        clientName: label(l.clientWorkspace),
        clientId: l.clientWorkspace.id,
        at: l.createdAt,
      })),
      ...bookings.map((b) => ({
        id: `booking-${b.id}`,
        kind: 'booking' as const,
        // "requested", never "confirmed" — nothing has checked a calendar.
        title: `Booking ${b.status === 'confirmed' ? 'confirmed' : 'requested'}`,
        clientName: label(b.clientWorkspace),
        clientId: b.clientWorkspace.id,
        at: b.createdAt,
      })),
      ...handoffs.map((h) => ({
        id: `handoff-${h.id}`,
        kind: 'handoff' as const,
        title: 'Human handoff waiting',
        clientName: label(h.clientWorkspace),
        clientId: h.clientWorkspace.id,
        at: h.lastMessageAt ?? h.startedAt,
      })),
      ...published.map((a) => ({
        id: `published-${a.id}`,
        kind: 'published' as const,
        title: `${a.name} published`,
        clientName: label(a.clientWorkspace),
        clientId: a.clientWorkspace.id,
        at: a.publishedAt as Date,
      })),
    ]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, limit)

    return { status: 200 as const, activity }
  } catch (error) {
    console.error('[Clients] onGetRecentActivity failed:', error)
    return { status: 400 as const, activity: [] as ActivityItem[] }
  }
}
