import 'server-only'

import { currentUser } from '@clerk/nextjs/server'
import { OrganizationType, Prisma } from '@prisma/client'

import { client } from '@/lib/prisma'
import {
  type ActorContext,
  type Permission,
  type WorkspaceAccess,
  AuthorizationError,
  getActorContext,
  listAccessibleWorkspaceIds,
  resolveWorkspaceAccess,
  assertCanInWorkspace,
  assertCan,
} from '@/lib/permissions'

/**
 * Clerk identity → tenant context.
 *
 * This is the only place a request turns into "who is acting, in which
 * organization, on which client". Server actions must not reach for
 * `currentUser()` and then query by a client-supplied id — that is the pattern
 * that leaks across tenants.
 *
 * Every exported helper returns *verified* ids. Pass those into queries, never
 * the ones that arrived in the request.
 */

export type TenantContext = {
  actor: ActorContext
  organizationId: string
  userId: string
}

/** The signed-in Clerk user's row, or null. Does not create anything. */
export async function getCurrentUser() {
  const clerk = await currentUser()
  if (!clerk) return null

  return client.user.findUnique({
    where: { clerkId: clerk.id },
    select: { id: true, clerkId: true, email: true, fullName: true, status: true, deletedAt: true },
  })
}

/**
 * First sign-in provisioning. Idempotent.
 *
 * Creates User → Organization → owner membership → FREE subscription, and for a
 * direct business also its single ClientWorkspace, so that customer never sees
 * agency machinery they did not ask for.
 *
 * Wrapped in a transaction: a half-provisioned tenant (user with no
 * organization) is a state nothing else in the app knows how to handle.
 */
export async function ensureUserAndOrganization(input: {
  clerkId: string
  email: string
  fullName?: string | null
  avatarUrl?: string | null
  organizationName?: string | null
  organizationType?: OrganizationType
}) {
  const existing = await client.user.findUnique({
    where: { clerkId: input.clerkId },
    select: {
      id: true,
      organizationMemberships: {
        where: { status: 'active' },
        select: { organizationId: true },
        take: 1,
      },
    },
  })

  if (existing?.organizationMemberships.length) {
    return {
      userId: existing.id,
      organizationId: existing.organizationMemberships[0].organizationId,
      created: false,
    }
  }

  const orgType = input.organizationType ?? 'agency'
  const baseName =
    input.organizationName?.trim() ||
    (input.fullName?.trim() ? `${input.fullName.trim()}'s workspace` : null) ||
    input.email.split('@')[0]

  return client.$transaction(async (tx) => {
    const user =
      existing ??
      (await tx.user.create({
        data: {
          clerkId: input.clerkId,
          email: input.email.toLowerCase().trim(),
          fullName: input.fullName ?? null,
          avatarUrl: input.avatarUrl ?? null,
          lastLoginAt: new Date(),
        },
        select: { id: true, organizationMemberships: { select: { organizationId: true } } },
      }))

    const organization = await tx.organization.create({
      data: {
        name: baseName,
        slug: await uniqueSlug(tx, baseName),
        organizationType: orgType,
        onboardingStatus: 'organization_created',
      },
    })

    await tx.organizationMembership.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: 'owner',
        status: 'active',
        acceptedAt: new Date(),
      },
    })

    // Every tenant gets a subscription row so entitlement resolution has a
    // plan to read. Without one it falls back to FREE anyway, but an explicit
    // row keeps billing state inspectable.
    const freePlan = await tx.plan.findUnique({ where: { code: 'FREE' }, select: { id: true } })
    await tx.subscription.create({
      data: {
        organizationId: organization.id,
        planId: freePlan?.id ?? null,
        provider: 'none',
        status: 'active',
        billingInterval: 'monthly',
      },
    })

    if (orgType === 'direct_business') {
      await tx.clientWorkspace.create({
        data: {
          organizationId: organization.id,
          name: baseName,
          slug: 'main',
          businessName: baseName,
          workspaceType: 'direct_business',
          createdByUserId: user.id,
        },
      })
      await tx.organization.update({
        where: { id: organization.id },
        data: { onboardingStatus: 'first_client_created' },
      })
    }

    return { userId: user.id, organizationId: organization.id, created: true }
  })
}

/** Slugify with a numeric suffix on collision. */
async function uniqueSlug(tx: Prisma.TransactionClient, name: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'workspace'

  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}-${n}`
    const clash = await tx.organization.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!clash) return candidate
  }
  return `${base}-${Date.now()}`
}

/**
 * The acting tenant context for the current request.
 * Returns null when unauthenticated or without an active membership — callers
 * must treat null as denied.
 */
export async function getTenantContext(organizationId?: string): Promise<TenantContext | null> {
  const clerk = await currentUser()
  if (!clerk) return null

  const orgId = organizationId ?? (await getDefaultOrganizationId(clerk.id))
  if (!orgId) return null

  const actor = await getActorContext(clerk.id, orgId)
  if (!actor) return null

  return { actor, organizationId: actor.organizationId, userId: actor.userId }
}

/** Throws instead of returning null. Use in server actions. */
export async function requireTenantContext(organizationId?: string): Promise<TenantContext> {
  const ctx = await getTenantContext(organizationId)
  if (!ctx) throw new AuthorizationError('viewOrganization', 'not signed in or no active membership')
  return ctx
}

/**
 * The organization a user lands in when they have not picked one. Most users
 * belong to exactly one; multi-org members get their earliest membership until
 * an explicit switcher exists.
 */
export async function getDefaultOrganizationId(clerkId: string): Promise<string | null> {
  const membership = await client.organizationMembership.findFirst({
    where: {
      status: 'active',
      user: { clerkId, status: 'active', deletedAt: null },
      organization: { deletedAt: null },
    },
    orderBy: { createdAt: 'asc' },
    select: { organizationId: true },
  })
  return membership?.organizationId ?? null
}

/**
 * Verify a client-supplied workspace id and a permission in one call.
 * Returns the verified ids — use these, discard the request's.
 */
export async function requireWorkspace(
  clientWorkspaceId: string,
  permission: Permission,
  organizationId?: string
): Promise<{ ctx: TenantContext; access: WorkspaceAccess }> {
  const ctx = await requireTenantContext(organizationId)
  const access = await resolveWorkspaceAccess(ctx.actor, clientWorkspaceId)
  assertCanInWorkspace(access, permission)
  return { ctx, access }
}

/** Organization-level permission gate (billing, team, org settings). */
export async function requireOrganizationPermission(
  permission: Permission,
  organizationId?: string
): Promise<TenantContext> {
  const ctx = await requireTenantContext(organizationId)
  assertCan(ctx.actor, permission)
  return ctx
}

/**
 * Every workspace id the actor may read. The canonical way to scope a
 * cross-client query — `where: { clientWorkspaceId: { in: ids } }`.
 */
export async function accessibleWorkspaceIds(ctx: TenantContext): Promise<string[]> {
  return listAccessibleWorkspaceIds(ctx.actor)
}

/** Workspaces for the client switcher, newest activity first. */
export async function listWorkspacesForActor(ctx: TenantContext) {
  const ids = await accessibleWorkspaceIds(ctx)
  if (ids.length === 0) return []

  return client.clientWorkspace.findMany({
    where: { id: { in: ids }, deletedAt: null },
    orderBy: [{ archivedAt: 'asc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      businessName: true,
      workspaceType: true,
      status: true,
      logoUrl: true,
      primaryColor: true,
      websiteUrl: true,
      industry: true,
      expiresAt: true,
      _count: { select: { assistants: true, leads: true, conversations: true } },
    },
  })
}
