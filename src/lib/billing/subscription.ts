import 'server-only'

import { BillingInterval, Prisma, SubscriptionStatus } from '@prisma/client'

import { client } from '@/lib/prisma'
import { devError, devLog } from '@/lib/utils'

/**
 * Subscription state, owned by the Organization.
 *
 * Three things this fixes:
 *
 * 1. Subscriptions belong to a tenant, not a person. Previously `Billings` hung
 *    off `User`, so an agency's plan died with whoever signed up.
 * 2. Plan limits are not copied onto the subscription. The old code wrote
 *    `messageCredits` onto the billing row at purchase time, so changing a plan's
 *    allowance never reached existing customers. Limits are resolved live from
 *    `PlanEntitlement` instead.
 * 3. Period boundaries come from the provider. `messagesResetAt` used to be set
 *    to "30 days from now" at write time, drifting away from the real invoice
 *    date on every plan change.
 */

export type PlanCode = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: 'active',
  trialing: 'trialing',
  on_hold: 'past_due',
  past_due: 'past_due',
  paused: 'paused',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  expired: 'expired',
  failed: 'past_due',
}

export const normaliseStatus = (raw?: string | null): SubscriptionStatus =>
  STATUS_MAP[String(raw ?? '').toLowerCase()] ?? 'active'

export const normaliseInterval = (raw?: string | null): BillingInterval =>
  String(raw ?? '').toLowerCase().startsWith('year') ? 'yearly' : 'monthly'

/**
 * Applies a plan to an organization. Idempotent — safe to call from a webhook
 * that may be delivered more than once.
 */
export async function applyPlanToOrganization(input: {
  organizationId: string
  planCode: PlanCode
  externalCustomerId?: string | null
  externalSubscriptionId?: string | null
  status?: string | null
  billingInterval?: string | null
  currentPeriodStart?: Date | null
  currentPeriodEnd?: Date | null
  cancelAtPeriodEnd?: boolean
  provider?: string
}) {
  const plan = await client.plan.findUnique({
    where: { code: input.planCode },
    select: { id: true, code: true },
  })
  if (!plan) throw new Error(`Unknown plan code: ${input.planCode}`)

  const data = {
    planId: plan.id,
    provider: input.provider ?? 'dodo',
    status: normaliseStatus(input.status),
    billingInterval: normaliseInterval(input.billingInterval),
    ...(input.externalCustomerId ? { externalCustomerId: input.externalCustomerId } : {}),
    ...(input.externalSubscriptionId
      ? { externalSubscriptionId: input.externalSubscriptionId }
      : {}),
    ...(input.currentPeriodStart ? { currentPeriodStart: input.currentPeriodStart } : {}),
    ...(input.currentPeriodEnd ? { currentPeriodEnd: input.currentPeriodEnd } : {}),
    ...(input.cancelAtPeriodEnd !== undefined
      ? { cancelAtPeriodEnd: input.cancelAtPeriodEnd }
      : {}),
  }

  const subscription = await client.subscription.upsert({
    where: { organizationId: input.organizationId },
    create: { organizationId: input.organizationId, ...data },
    update: data,
    select: { id: true, status: true, plan: { select: { code: true } } },
  })

  // Keep the organization's own status in step, so a suspended tenant becomes
  // read-only everywhere without each surface re-deriving it from billing.
  await client.organization.update({
    where: { id: input.organizationId },
    data: {
      status:
        subscription.status === 'past_due'
          ? 'past_due'
          : subscription.status === 'cancelled' || subscription.status === 'expired'
            ? 'active' // downgraded to FREE, not locked out
            : 'active',
    },
  })

  devLog(`[Billing] ${input.organizationId} → ${plan.code} (${subscription.status})`)
  return subscription
}

export async function getOrganizationSubscription(organizationId: string) {
  return client.subscription.findUnique({
    where: { organizationId },
    select: {
      id: true,
      status: true,
      billingInterval: true,
      externalCustomerId: true,
      externalSubscriptionId: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      trialEndsAt: true,
      plan: { select: { code: true, name: true, monthlyPriceMinor: true, yearlyPriceMinor: true } },
    },
  })
}

/** Finds the organization behind a provider subscription or customer id. */
export async function organizationForExternalId(input: {
  subscriptionId?: string | null
  customerId?: string | null
}): Promise<string | null> {
  if (input.subscriptionId) {
    const bySubscription = await client.subscription.findUnique({
      where: { externalSubscriptionId: input.subscriptionId },
      select: { organizationId: true },
    })
    if (bySubscription) return bySubscription.organizationId
  }

  if (input.customerId) {
    const byCustomer = await client.subscription.findFirst({
      where: { externalCustomerId: input.customerId },
      select: { organizationId: true },
    })
    if (byCustomer) return byCustomer.organizationId
  }

  return null
}

/**
 * Webhook idempotency gate.
 *
 * Returns false when this provider event has already been seen, so the caller
 * can return 200 without reprocessing. The unique (provider, externalEventId)
 * constraint means a duplicate is rejected by the database, not by a race-prone
 * "check then insert".
 */
export async function beginBillingEvent(input: {
  provider: string
  externalEventId: string
  eventType: string
  payloadMetadata?: Prisma.InputJsonValue
}): Promise<{ shouldProcess: boolean; eventId: string | null }> {
  try {
    const event = await client.billingEvent.create({
      data: {
        provider: input.provider,
        externalEventId: input.externalEventId,
        eventType: input.eventType,
        processingStatus: 'processing',
        // Metadata only — never the raw payload, which can carry PII and card
        // details we have no reason to retain.
        payloadMetadata: input.payloadMetadata,
      },
      select: { id: true },
    })
    return { shouldProcess: true, eventId: event.id }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      devLog(`[Billing] duplicate event ignored: ${input.externalEventId}`)
      return { shouldProcess: false, eventId: null }
    }
    throw error
  }
}

export async function finishBillingEvent(
  eventId: string | null,
  outcome: 'processed' | 'failed' | 'ignored',
  errorMessage?: string
) {
  if (!eventId) return
  await client.billingEvent
    .update({
      where: { id: eventId },
      data: {
        processingStatus: outcome,
        processedAt: new Date(),
        errorMessage: errorMessage ?? null,
        ...(outcome === 'failed' ? { retryCount: { increment: 1 } } : {}),
      },
    })
    .catch((error) => devError('[Billing] finishBillingEvent failed:', error))
}
