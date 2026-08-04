'use server'

import { client } from '@/lib/prisma'
import { accessibleWorkspaceIds, requireTenantContext } from '@/lib/tenant'
import { checkEntitlement, getBillingPeriod } from '@/lib/entitlements'

/**
 * Agency dashboard aggregates.
 *
 * Every count is scoped by `accessibleWorkspaceIds`, so a member assigned to two
 * clients sees totals for two clients — not for the whole roster. The old
 * versions counted by `clerkId` through a nested relation, which meant a scoped
 * member silently saw organization-wide numbers.
 */

async function scope() {
  const ctx = await requireTenantContext()
  const workspaceIds = await accessibleWorkspaceIds(ctx)
  return { ctx, workspaceIds }
}

export const getUserConversations = async () => {
  try {
    const { workspaceIds } = await scope()
    if (workspaceIds.length === 0) return 0
    return await client.conversation.count({
      where: { clientWorkspaceId: { in: workspaceIds } },
    })
  } catch (error) {
    console.error('[Dashboard] getUserConversations failed:', error)
    return 0
  }
}

export const getUserClients = async () => {
  try {
    const { workspaceIds } = await scope()
    if (workspaceIds.length === 0) return 0
    return await client.lead.count({
      where: { clientWorkspaceId: { in: workspaceIds }, archivedAt: null },
    })
  } catch (error) {
    console.error('[Dashboard] getUserClients failed:', error)
    return 0
  }
}

export const getUserAppointments = async () => {
  try {
    const { workspaceIds } = await scope()
    if (workspaceIds.length === 0) return 0
    return await client.bookingRequest.count({
      where: { clientWorkspaceId: { in: workspaceIds } },
    })
  } catch (error) {
    console.error('[Dashboard] getUserAppointments failed:', error)
    return 0
  }
}

/**
 * Usage and plan state for the organization.
 *
 * Message consumption comes from the entitlement service, which sums
 * `UsageEvent` over the provider's real billing period. The old version read a
 * pooled counter that reset 30 days after whenever the last chat happened.
 */
export const getUserPlanInfo = async () => {
  try {
    const { ctx, workspaceIds } = await scope()

    const [subscription, messages, workspaces, period] = await Promise.all([
      client.subscription.findUnique({
        where: { organizationId: ctx.organizationId },
        select: {
          status: true,
          billingInterval: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          plan: { select: { code: true, name: true } },
        },
      }),
      checkEntitlement(ctx.organizationId, 'monthly_messages', 0),
      checkEntitlement(ctx.organizationId, 'maximum_client_workspaces', 0),
      getBillingPeriod(ctx.organizationId),
    ])

    return {
      plan: subscription?.plan?.code ?? 'FREE',
      planName: subscription?.plan?.name ?? 'Free',
      status: subscription?.status ?? 'active',
      billingInterval: subscription?.billingInterval ?? 'monthly',
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      periodEnd: subscription?.currentPeriodEnd ?? period.end,
      domains: workspaceIds.length,
      // A null limit means unlimited; the UI renders ∞ rather than a number.
      credits: messages.limit === null ? null : Number(messages.limit),
      messageLimit: messages.limit === null ? null : Number(messages.limit),
      messagesUsed: Number(messages.used),
      workspaceLimit: workspaces.limit === null ? null : Number(workspaces.limit),
      workspacesUsed: Number(workspaces.used),
    }
  } catch (error) {
    console.error('[Dashboard] getUserPlanInfo failed:', error)
    return null
  }
}

/**
 * Value of the service catalogue across accessible clients, in minor units.
 * Returns the currency alongside the amount — a bare number was ambiguous the
 * moment more than one currency could exist.
 */
export const getUserTotalProductPrices = async () => {
  try {
    const { workspaceIds } = await scope()
    if (workspaceIds.length === 0) return { amountMinor: 0, currency: 'USD' }

    const items = await client.serviceItem.findMany({
      where: { clientWorkspaceId: { in: workspaceIds }, active: true },
      select: { priceAmountMinor: true, currency: true },
    })

    const amountMinor = items.reduce((total, item) => total + (item.priceAmountMinor ?? 0), 0)
    return { amountMinor, currency: items.find((i) => i.currency)?.currency ?? 'USD' }
  } catch (error) {
    console.error('[Dashboard] getUserTotalProductPrices failed:', error)
    return { amountMinor: 0, currency: 'USD' }
  }
}

/**
 * Recent billing activity, read from the `BillingEvent` ledger rather than by
 * calling the payment provider on every dashboard render.
 */
export const getUserTransactions = async () => {
  try {
    await requireTenantContext()
    const events = await client.billingEvent.findMany({
      where: { processingStatus: 'processed' },
      orderBy: { receivedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        provider: true,
        eventType: true,
        receivedAt: true,
        payloadMetadata: true,
      },
    })
    return { data: events }
  } catch (error) {
    console.error('[Dashboard] getUserTransactions failed:', error)
    return { data: [] }
  }
}

/** Per-client counts for the roster table. */
export const getWorkspaceSummaries = async () => {
  try {
    const { workspaceIds } = await scope()
    if (workspaceIds.length === 0) return []

    return await client.clientWorkspace.findMany({
      where: { id: { in: workspaceIds }, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        businessName: true,
        logoUrl: true,
        status: true,
        workspaceType: true,
        industry: true,
        _count: {
          select: { conversations: true, leads: true, bookingRequests: true, assistants: true },
        },
      },
    })
  } catch (error) {
    console.error('[Dashboard] getWorkspaceSummaries failed:', error)
    return []
  }
}
