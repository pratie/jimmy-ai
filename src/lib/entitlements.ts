/**
 * Central entitlement service.
 *
 * The old architecture scattered plan limits across `PLAN_LIMITS`, the pricing
 * cards, and individual components, which drifted. Here there is exactly one
 * resolution path:
 *
 *     plan entitlement  →  organization override  →  answer
 *
 * Nothing outside this module may hardcode a limit, and every protected action
 * must call `assertEntitlement` (or `checkEntitlement`) before doing work.
 *
 * Two things that were broken before and are fixed here:
 *
 * 1. USAGE IS ATTRIBUTED. Consumption is summed from the append-only
 *    `UsageEvent` table, which carries organizationId + clientWorkspaceId +
 *    assistantId. The old pooled `Billings.messagesUsed` counter could not tell
 *    you which client burned the quota.
 *
 * 2. PERIODS COME FROM THE BILLING PROVIDER. `Subscription.currentPeriodStart/
 *    End` are authoritative. The old code reset credits 30 days after whenever
 *    the last chat happened, which drifted away from the real invoice date.
 */

import { EntitlementKey, Prisma } from '@prisma/client'
import { client } from '@/lib/prisma'

/** null means unlimited. Booleans are stored as 0 / 1. */
export type LimitValue = bigint | null

export type EntitlementCheck = {
  key: EntitlementKey
  /** null = unlimited */
  limit: LimitValue
  used: bigint
  /** null = unlimited */
  remaining: LimitValue
  allowed: boolean
}

export class EntitlementError extends Error {
  constructor(
    readonly key: EntitlementKey,
    readonly limit: LimitValue,
    readonly used: bigint
  ) {
    super(
      `Plan limit reached for "${key}" (${used}/${limit ?? '∞'}). Upgrade to continue.`
    )
    this.name = 'EntitlementError'
  }
}

/* ── Resolution ─────────────────────────────────────────────────────────── */

/**
 * Resolved limits for an organization: plan values, with any per-org override
 * applied on top. Unexpired overrides win — that is how bespoke deals and
 * grandfathering work without forking a plan.
 */
export async function getEntitlements(
  organizationId: string
): Promise<Map<EntitlementKey, LimitValue>> {
  const [subscription, overrides] = await Promise.all([
    client.subscription.findUnique({
      where: { organizationId },
      select: { plan: { select: { entitlements: { select: { key: true, limitValue: true } } } } },
    }),
    client.organizationEntitlement.findMany({
      where: {
        organizationId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { key: true, limitValue: true },
    }),
  ])

  const resolved = new Map<EntitlementKey, LimitValue>()

  // An organization with no subscription row falls back to the FREE plan
  // rather than to "unlimited" — failing open on billing would be a gift.
  const planEntitlements =
    subscription?.plan?.entitlements ??
    (
      await client.plan.findUnique({
        where: { code: 'FREE' },
        select: { entitlements: { select: { key: true, limitValue: true } } },
      })
    )?.entitlements ??
    []

  for (const e of planEntitlements) resolved.set(e.key, e.limitValue)
  for (const o of overrides) resolved.set(o.key, o.limitValue)

  return resolved
}

export async function getLimit(
  organizationId: string,
  key: EntitlementKey
): Promise<LimitValue> {
  const all = await getEntitlements(organizationId)
  // A key absent from the plan is treated as denied (0), never as unlimited.
  return all.has(key) ? all.get(key)! : 0n
}

/* ── Usage ──────────────────────────────────────────────────────────────── */

/**
 * The window consumption is measured over.
 *
 * Uses the provider's real period boundaries when a subscription exists.
 * Otherwise falls back to the calendar month — a fixed, predictable window,
 * not a rolling one anchored to random activity.
 */
export async function getBillingPeriod(
  organizationId: string
): Promise<{ start: Date; end: Date }> {
  const sub = await client.subscription.findUnique({
    where: { organizationId },
    select: { currentPeriodStart: true, currentPeriodEnd: true },
  })

  if (sub?.currentPeriodStart && sub.currentPeriodEnd) {
    return { start: sub.currentPeriodStart, end: sub.currentPeriodEnd }
  }

  const now = new Date()
  return {
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
  }
}

/** Entitlements measured by counting rows that exist right now. */
const COUNT_BASED: Partial<Record<EntitlementKey, (orgId: string) => Promise<bigint>>> = {
  maximum_client_workspaces: async (organizationId) =>
    BigInt(
      await client.clientWorkspace.count({
        where: {
          organizationId,
          deletedAt: null,
          archivedAt: null,
          // Prospect demos are explicitly NOT client workspaces for billing.
          // They have their own maximum_prospect_demos limit — otherwise
          // demoing to a prospect would consume a paid client slot, which
          // defeats the entire outreach workflow.
          workspaceType: { in: ['active_client', 'direct_business'] },
        },
      })
    ),

  maximum_prospect_demos: async (organizationId) =>
    BigInt(
      await client.clientWorkspace.count({
        where: {
          organizationId,
          deletedAt: null,
          workspaceType: 'prospect_demo',
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      })
    ),

  maximum_assistants: async (organizationId) =>
    BigInt(
      await client.assistant.count({
        where: {
          deletedAt: null,
          archivedAt: null,
          clientWorkspace: { organizationId, deletedAt: null },
        },
      })
    ),

  maximum_team_members: async (organizationId) =>
    BigInt(
      await client.organizationMembership.count({
        where: { organizationId, status: { in: ['invited', 'active'] } },
      })
    ),

  maximum_client_users: async (organizationId) =>
    BigInt(
      await client.clientWorkspaceMembership.count({
        where: {
          status: { in: ['invited', 'active'] },
          role: { in: ['client_admin', 'client_member', 'client_viewer'] },
          clientWorkspace: { organizationId, deletedAt: null },
        },
      })
    ),
}

/** Entitlements measured by summing UsageEvent over the billing period. */
const USAGE_BASED: Partial<Record<EntitlementKey, Prisma.UsageEventWhereInput>> = {
  monthly_messages: { eventType: 'assistant_message' },
  monthly_crawl_pages: { eventType: 'crawl_page' },
  storage_bytes: { eventType: 'storage_used' },
}

async function getUsage(organizationId: string, key: EntitlementKey): Promise<bigint> {
  const counter = COUNT_BASED[key]
  if (counter) return counter(organizationId)

  const filter = USAGE_BASED[key]
  if (filter) {
    // storage_bytes is a running total, not a per-period figure.
    const scope =
      key === 'storage_bytes'
        ? {}
        : await getBillingPeriod(organizationId).then(({ start, end }) => ({
            occurredAt: { gte: start, lt: end },
          }))

    const agg = await client.usageEvent.aggregate({
      where: { organizationId, ...filter, ...scope },
      _sum: { quantity: true },
    })
    return agg._sum.quantity ?? 0n
  }

  // Boolean feature flags have no usage dimension.
  return 0n
}

/* ── Checks ─────────────────────────────────────────────────────────────── */

/**
 * @param increment how many units the caller is about to consume (default 1).
 *   Pass 0 to read current state without asking permission for more.
 */
export async function checkEntitlement(
  organizationId: string,
  key: EntitlementKey,
  increment = 1
): Promise<EntitlementCheck> {
  const [limit, used] = await Promise.all([
    getLimit(organizationId, key),
    getUsage(organizationId, key),
  ])

  if (limit === null) {
    return { key, limit: null, used, remaining: null, allowed: true }
  }

  const remaining = limit - used
  return {
    key,
    limit,
    used,
    remaining: remaining > 0n ? remaining : 0n,
    allowed: used + BigInt(increment) <= limit,
  }
}

/** Throws EntitlementError when the action would exceed the plan. */
export async function assertEntitlement(
  organizationId: string,
  key: EntitlementKey,
  increment = 1
): Promise<void> {
  const result = await checkEntitlement(organizationId, key, increment)
  if (!result.allowed) throw new EntitlementError(key, result.limit, result.used)
}

/** For boolean feature flags: hide_branding, shareable_demos, api_access… */
export async function hasFeature(
  organizationId: string,
  key: EntitlementKey
): Promise<boolean> {
  const limit = await getLimit(organizationId, key)
  return limit === null || limit > 0n
}

/* ── Recording ──────────────────────────────────────────────────────────── */

export type UsageRecord = {
  organizationId: string
  clientWorkspaceId?: string | null
  assistantId?: string | null
  conversationId?: string | null
  eventType: Prisma.UsageEventCreateInput['eventType']
  quantity?: bigint | number
  unit: string
  provider?: string | null
  model?: string | null
  promptTokens?: number | null
  completionTokens?: number | null
  estimatedCostMinor?: number | null
  currency?: string | null
  /** Stable per logical operation — makes retries safe. */
  idempotencyKey: string
  occurredAt?: Date
  metadata?: Prisma.InputJsonValue
}

/**
 * Append-only usage write. Duplicate idempotency keys are swallowed, so a
 * retried request records its consumption exactly once instead of
 * double-charging.
 */
export async function recordUsage(record: UsageRecord): Promise<void> {
  try {
    await client.usageEvent.create({
      data: {
        organizationId: record.organizationId,
        clientWorkspaceId: record.clientWorkspaceId ?? null,
        assistantId: record.assistantId ?? null,
        conversationId: record.conversationId ?? null,
        eventType: record.eventType,
        quantity: BigInt(record.quantity ?? 1),
        unit: record.unit,
        provider: record.provider ?? null,
        model: record.model ?? null,
        promptTokens: record.promptTokens ?? null,
        completionTokens: record.completionTokens ?? null,
        estimatedCostMinor: record.estimatedCostMinor ?? null,
        currency: record.currency ?? null,
        idempotencyKey: record.idempotencyKey,
        occurredAt: record.occurredAt ?? new Date(),
        metadata: record.metadata,
      },
    })
  } catch (error) {
    // P2002 = unique violation on idempotencyKey: this operation was already
    // recorded. That is success, not failure.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return
    }
    throw error
  }
}
