'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import type { OrganizationType } from '@prisma/client'

import { client } from '@/lib/prisma'
import { ensureUserAndOrganization, listWorkspacesForActor, getTenantContext } from '@/lib/tenant'

/**
 * Authentication actions.
 *
 * Clerk owns identity; this module owns *provisioning* — turning a Clerk
 * identity into a User, an Organization, an owner membership and a
 * subscription. All of that now happens inside one transaction in
 * `ensureUserAndOrganization`, which is why this file lost most of its former
 * bulk: the old version hand-rolled a race-prone create-then-check-then-create
 * dance and a P2002 recovery path.
 */

/** Primary email from a Clerk user, falling back to the first verified one. */
function primaryEmailOf(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>) {
  return (
    user.emailAddresses.find((a) => a.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    null
  )
}

function displayNameOf(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>, email: string) {
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || email.split('@')[0] || 'User'
}

/**
 * Completes registration after Clerk sign-up.
 *
 * @param organizationType `agency` (default) manages many client workspaces;
 *   `direct_business` gets one workspace created automatically and never sees
 *   the client switcher.
 */
export const onCompleteUserRegistration = async (
  fullName: string,
  clerkId: string,
  email: string,
  organizationName?: string,
  organizationType: OrganizationType = 'agency'
) => {
  if (!email?.trim()) {
    return { status: 400, message: 'Email address is required' }
  }

  try {
    const { userId, organizationId, created } = await ensureUserAndOrganization({
      clerkId,
      email,
      fullName,
      organizationName: organizationName ?? null,
      organizationType,
    })

    const user = await client.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    })

    return { status: 200, user: { ...user, organizationId }, created }
  } catch (error: any) {
    console.error('[Auth] Registration failed:', error?.message ?? error)
    return { status: 400, message: 'Could not complete registration' }
  }
}

/**
 * Resolves the signed-in user for the dashboard shell.
 *
 * Self-heals: a user who signed in via OAuth without passing through the
 * sign-up form is provisioned here rather than being bounced.
 */
export const onLoginUser = async () => {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return { status: 401, message: 'No user found' }

    const clerk = await currentUser()
    if (!clerk) return { status: 400, message: 'Unable to retrieve user information' }

    const email = primaryEmailOf(clerk)
    if (!email) {
      return {
        status: 400,
        message: 'No email address is associated with this account.',
      }
    }

    // Idempotent: returns the existing tenant when one is already provisioned.
    const { organizationId } = await ensureUserAndOrganization({
      clerkId,
      email,
      fullName: displayNameOf(clerk, email),
      avatarUrl: clerk.imageUrl ?? null,
    })

    await client.user.update({
      where: { clerkId },
      data: { lastLoginAt: new Date() },
    })

    const ctx = await getTenantContext(organizationId)
    if (!ctx) return { status: 403, message: 'No active membership for this organization' }

    const [user, organization, workspaces] = await Promise.all([
      client.user.findUnique({
        where: { clerkId },
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      }),
      client.organization.findUnique({
        where: { id: organizationId },
        select: {
          id: true,
          name: true,
          slug: true,
          organizationType: true,
          logoUrl: true,
          primaryColor: true,
          hideChatDockBranding: true,
          onboardingStatus: true,
          status: true,
        },
      }),
      listWorkspacesForActor(ctx),
    ])

    return {
      status: 200,
      user,
      organization,
      role: ctx.actor.organizationRole,
      workspaces,
    }
  } catch (error) {
    console.error('[Auth] onLoginUser failed:', error)
    return { status: 400, message: 'Sign-in failed' }
  }
}

/** Current tenant summary for client components that need to branch on it. */
export const onGetCurrentTenant = async () => {
  const ctx = await getTenantContext()
  if (!ctx) return null

  const organization = await client.organization.findUnique({
    where: { id: ctx.organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      organizationType: true,
      hideChatDockBranding: true,
      onboardingStatus: true,
      status: true,
    },
  })

  return { organization, role: ctx.actor.organizationRole, userId: ctx.userId }
}
