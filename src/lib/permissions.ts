/**
 * Central authorization service. Server-side only.
 *
 * Rules this module exists to enforce:
 *
 * 1. NOTHING is authorized by frontend visibility. Hiding a button is a UX
 *    decision; `assertCan` is the security boundary.
 * 2. Access is resolved from MEMBERSHIP, never from ownership of a row. There
 *    is no `userId` on tenant data any more.
 * 3. Client-side users see exactly one workspace and never see organization
 *    billing, team, or any sibling workspace.
 * 4. A workspace id arriving from a request is untrusted until
 *    `resolveWorkspaceAccess` has confirmed it belongs to the actor's org.
 *    Callers must pass the *verified* organizationId onward — never the one
 *    the client sent.
 */

import { OrganizationRole, WorkspaceRole } from '@prisma/client'
import { client } from '@/lib/prisma'

export type Permission =
  // Organization
  | 'viewOrganization'
  | 'manageOrganization'
  | 'manageBilling'
  | 'inviteOrganizationMember'
  // Client workspaces
  | 'createClientWorkspace'
  | 'viewClientWorkspace'
  | 'manageClientWorkspace'
  | 'archiveClientWorkspace'
  | 'inviteClientUser'
  // Assistants
  | 'createAssistant'
  | 'editAssistant'
  | 'publishAssistant'
  // Knowledge
  | 'manageKnowledge'
  // Conversations
  | 'viewConversations'
  | 'takeOverConversation'
  | 'exportConversations'
  // Leads & bookings
  | 'viewLeads'
  | 'manageLeads'
  | 'viewBookings'
  | 'manageBookings'
  // Reporting & integrations
  | 'viewReports'
  | 'manageIntegrations'

export class AuthorizationError extends Error {
  constructor(readonly permission: Permission, readonly reason: string) {
    super(`Not permitted: ${permission} (${reason})`)
    this.name = 'AuthorizationError'
  }
}

/* ── Role → permission matrix ───────────────────────────────────────────── */

const ALL: Permission[] = [
  'viewOrganization', 'manageOrganization', 'manageBilling', 'inviteOrganizationMember',
  'createClientWorkspace', 'viewClientWorkspace', 'manageClientWorkspace',
  'archiveClientWorkspace', 'inviteClientUser',
  'createAssistant', 'editAssistant', 'publishAssistant', 'manageKnowledge',
  'viewConversations', 'takeOverConversation', 'exportConversations',
  'viewLeads', 'manageLeads', 'viewBookings', 'manageBookings',
  'viewReports', 'manageIntegrations',
]

const ORG_ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  owner: ALL,

  admin: ALL.filter((p) => p !== 'manageOrganization'),

  // Runs client delivery; cannot touch money or org settings.
  manager: [
    'viewOrganization',
    'createClientWorkspace', 'viewClientWorkspace', 'manageClientWorkspace', 'inviteClientUser',
    'createAssistant', 'editAssistant', 'publishAssistant', 'manageKnowledge',
    'viewConversations', 'takeOverConversation', 'exportConversations',
    'viewLeads', 'manageLeads', 'viewBookings', 'manageBookings',
    'viewReports', 'manageIntegrations',
  ],

  // Day-to-day delivery on assigned clients only. Cannot publish or archive.
  member: [
    'viewOrganization',
    'viewClientWorkspace',
    'createAssistant', 'editAssistant', 'manageKnowledge',
    'viewConversations', 'takeOverConversation',
    'viewLeads', 'manageLeads', 'viewBookings', 'manageBookings',
    'viewReports',
  ],

  // Read-only across the roster. Explicitly no export — reading a report and
  // walking out with the lead list are different acts.
  analyst: [
    'viewOrganization', 'viewClientWorkspace',
    'viewConversations', 'viewLeads', 'viewBookings', 'viewReports',
  ],

  // Money only. Deliberately cannot read client conversations or leads.
  billing: ['viewOrganization', 'manageBilling'],
}

const WORKSPACE_ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  agency_manager: [
    'viewClientWorkspace', 'manageClientWorkspace', 'inviteClientUser',
    'createAssistant', 'editAssistant', 'publishAssistant', 'manageKnowledge',
    'viewConversations', 'takeOverConversation', 'exportConversations',
    'viewLeads', 'manageLeads', 'viewBookings', 'manageBookings',
    'viewReports', 'manageIntegrations',
  ],

  agency_member: [
    'viewClientWorkspace',
    'createAssistant', 'editAssistant', 'manageKnowledge',
    'viewConversations', 'takeOverConversation',
    'viewLeads', 'manageLeads', 'viewBookings', 'manageBookings',
    'viewReports',
  ],

  // ── Client-side roles ──
  // Never include: manageBilling, viewOrganization, createClientWorkspace,
  // manageKnowledge, publishAssistant. Clients see outcomes, not configuration.
  client_admin: [
    'viewClientWorkspace',
    'viewConversations', 'exportConversations',
    'viewLeads', 'manageLeads', 'viewBookings', 'manageBookings',
    'viewReports',
  ],

  client_member: [
    'viewClientWorkspace',
    'viewConversations', 'viewLeads', 'viewBookings', 'viewReports',
  ],

  client_viewer: ['viewClientWorkspace', 'viewReports'],
}

/** True when the role belongs to the client side of the relationship. */
export const isClientRole = (role: WorkspaceRole) =>
  role === 'client_admin' || role === 'client_member' || role === 'client_viewer'

/* ── Actor resolution ───────────────────────────────────────────────────── */

export type ActorContext = {
  userId: string
  clerkId: string
  organizationId: string
  organizationRole: OrganizationRole
  organizationStatus: string
  /** True for owner/admin — implicit access to every workspace in the org. */
  hasImplicitWorkspaceAccess: boolean
}

/**
 * Resolves the acting user within one organization.
 * Returns null when there is no active membership — callers must treat null as
 * "denied", never as "no restrictions".
 */
export async function getActorContext(
  clerkId: string,
  organizationId: string
): Promise<ActorContext | null> {
  const membership = await client.organizationMembership.findFirst({
    where: {
      organizationId,
      status: 'active',
      user: { clerkId, status: 'active', deletedAt: null },
      organization: { deletedAt: null },
    },
    select: {
      role: true,
      userId: true,
      organization: { select: { id: true, status: true } },
    },
  })

  if (!membership) return null

  return {
    userId: membership.userId,
    clerkId,
    organizationId: membership.organization.id,
    organizationRole: membership.role,
    organizationStatus: membership.organization.status,
    hasImplicitWorkspaceAccess:
      membership.role === 'owner' || membership.role === 'admin',
  }
}

/* ── Checks ─────────────────────────────────────────────────────────────── */

/** Organization-scoped permission check. */
export function can(actor: ActorContext, permission: Permission): boolean {
  // A suspended organization is read-only. Preserves access to your own data
  // while payment is sorted out, without letting the account keep growing.
  if (actor.organizationStatus === 'suspended' && !permission.startsWith('view')) {
    return permission === 'manageBilling'
  }
  return ORG_ROLE_PERMISSIONS[actor.organizationRole].includes(permission)
}

export function assertCan(actor: ActorContext | null, permission: Permission): asserts actor is ActorContext {
  if (!actor) throw new AuthorizationError(permission, 'no active organization membership')
  if (!can(actor, permission)) {
    throw new AuthorizationError(permission, `role ${actor.organizationRole} lacks it`)
  }
}

export type WorkspaceAccess = {
  clientWorkspaceId: string
  organizationId: string
  workspaceRole: WorkspaceRole | null
  viaImplicitOrgAccess: boolean
  permissions: Set<Permission>
}

/**
 * Verifies that a workspace id actually belongs to the actor's organization
 * AND that the actor may reach it, then returns the effective permission set.
 *
 * This is the function that stops an id from another tenant being honoured.
 * Never query a workspace by a client-supplied id without going through here.
 */
export async function resolveWorkspaceAccess(
  actor: ActorContext,
  clientWorkspaceId: string
): Promise<WorkspaceAccess | null> {
  const workspace = await client.clientWorkspace.findFirst({
    where: {
      id: clientWorkspaceId,
      // The tenant boundary. Without this, any valid uuid would resolve.
      organizationId: actor.organizationId,
      deletedAt: null,
    },
    select: {
      id: true,
      organizationId: true,
      memberships: {
        where: { userId: actor.userId, status: 'active' },
        select: { role: true },
        take: 1,
      },
    },
  })

  if (!workspace) return null

  const explicitRole = workspace.memberships[0]?.role ?? null

  // Owners and admins reach every workspace without an explicit row.
  if (actor.hasImplicitWorkspaceAccess) {
    return {
      clientWorkspaceId: workspace.id,
      organizationId: workspace.organizationId,
      workspaceRole: explicitRole,
      viaImplicitOrgAccess: true,
      permissions: new Set(ORG_ROLE_PERMISSIONS[actor.organizationRole]),
    }
  }

  if (!explicitRole) return null // scoped member, not assigned to this client

  // Effective permissions are the INTERSECTION of the org role and the
  // workspace role. A workspace role can never grant more than the
  // organization role already allows — that would be privilege escalation by
  // assignment.
  const orgPerms = new Set(ORG_ROLE_PERMISSIONS[actor.organizationRole])
  const effective = new Set(
    WORKSPACE_ROLE_PERMISSIONS[explicitRole].filter((p) => orgPerms.has(p))
  )

  return {
    clientWorkspaceId: workspace.id,
    organizationId: workspace.organizationId,
    workspaceRole: explicitRole,
    viaImplicitOrgAccess: false,
    permissions: effective,
  }
}

export function canInWorkspace(access: WorkspaceAccess, permission: Permission): boolean {
  return access.permissions.has(permission)
}

export function assertCanInWorkspace(
  access: WorkspaceAccess | null,
  permission: Permission
): asserts access is WorkspaceAccess {
  if (!access) throw new AuthorizationError(permission, 'no access to this client workspace')
  if (!canInWorkspace(access, permission)) {
    throw new AuthorizationError(
      permission,
      `workspace role ${access.workspaceRole ?? 'implicit'} lacks it`
    )
  }
}

/**
 * One-call guard for the common case. Resolves the actor, verifies the
 * workspace belongs to them, and checks the permission — throwing on any
 * failure. Returns the verified ids for the caller to scope queries with.
 */
export async function authorizeWorkspaceAction(
  clerkId: string,
  organizationId: string,
  clientWorkspaceId: string,
  permission: Permission
): Promise<{ actor: ActorContext; access: WorkspaceAccess }> {
  const actor = await getActorContext(clerkId, organizationId)
  if (!actor) throw new AuthorizationError(permission, 'no active organization membership')

  const access = await resolveWorkspaceAccess(actor, clientWorkspaceId)
  assertCanInWorkspace(access, permission)

  return { actor, access }
}

/** Workspaces this actor may see. Used for the client switcher. */
export async function listAccessibleWorkspaceIds(actor: ActorContext): Promise<string[]> {
  if (actor.hasImplicitWorkspaceAccess) {
    const all = await client.clientWorkspace.findMany({
      where: { organizationId: actor.organizationId, deletedAt: null },
      select: { id: true },
    })
    return all.map((w) => w.id)
  }

  const assigned = await client.clientWorkspaceMembership.findMany({
    where: {
      userId: actor.userId,
      status: 'active',
      clientWorkspace: { organizationId: actor.organizationId, deletedAt: null },
    },
    select: { clientWorkspaceId: true },
  })
  return assigned.map((m) => m.clientWorkspaceId)
}
