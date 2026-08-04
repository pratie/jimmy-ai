import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'

import { client } from '@/lib/prisma'
import {
  applyPlanToOrganization,
  beginBillingEvent,
  finishBillingEvent,
  organizationForExternalId,
  type PlanCode,
} from '@/lib/billing/subscription'

/**
 * Dodo Payments webhook.
 *
 * Two properties the previous version lacked:
 *
 * 1. IDEMPOTENCY IS STRUCTURAL. Every delivery is claimed in `BillingEvent`
 *    first, guarded by a unique (provider, externalEventId). A replay is
 *    rejected by the database rather than by a check-then-act race, so a
 *    duplicate delivery cannot apply a plan change twice.
 *
 * 2. PERIOD DATES COME FROM THE PROVIDER. `current_period_start/end` are stored
 *    as the authoritative billing window. Usage is measured against them, so
 *    allowances now reset on the real invoice date instead of 30 days after
 *    whenever the customer last chatted.
 *
 * Signature verification still runs before anything is read from the payload.
 */

let webhookInstance: Webhook | null = null

function getWebhookInstance() {
  if (!webhookInstance) {
    webhookInstance = new Webhook(process.env.DODO_WEBHOOK_SECRET || 'build_time_dummy_secret')
  }
  return webhookInstance
}

/** Legacy Dodo plan names → current plan codes. */
function mapDodoPlan(raw?: string | null): PlanCode {
  const mapping: Record<string, PlanCode> = {
    STANDARD: 'STARTER',
    STARTER: 'STARTER',
    PRO: 'PRO',
    ULTIMATE: 'BUSINESS',
    BUSINESS: 'BUSINESS',
    FREE: 'FREE',
  }
  return mapping[String(raw ?? '').toUpperCase()] ?? 'STARTER'
}

const asDate = (value: unknown): Date | null => {
  if (!value) return null
  const parsed = new Date(value as string)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Resolves the tenant a webhook refers to.
 *
 * Tries the stored subscription/customer ids first, then falls back to the
 * Clerk id in metadata — which is how a brand-new subscription, whose external
 * id we have never seen, gets attached.
 */
async function resolveOrganizationId(data: Record<string, any>): Promise<string | null> {
  const direct = await organizationForExternalId({
    subscriptionId: data.subscription_id ?? null,
    customerId: data.customer?.customer_id ?? data.customer_id ?? null,
  })
  if (direct) return direct

  const clerkId = data.metadata?.userId
  if (!clerkId) return null

  const membership = await client.organizationMembership.findFirst({
    where: { status: 'active', role: { in: ['owner', 'admin'] }, user: { clerkId } },
    orderBy: { createdAt: 'asc' },
    select: { organizationId: true },
  })
  return membership?.organizationId ?? null
}

export async function POST(request: NextRequest) {
  let eventId: string | null = null

  try {
    const rawBody = await request.text()

    // Verified before any parsing, so an unsigned payload never reaches logic.
    await getWebhookInstance().verify(rawBody, {
      'webhook-id': request.headers.get('webhook-id') || '',
      'webhook-signature': request.headers.get('webhook-signature') || '',
      'webhook-timestamp': request.headers.get('webhook-timestamp') || '',
    })

    const payload = JSON.parse(rawBody)
    const data = (payload.data ?? {}) as Record<string, any>
    const externalEventId =
      request.headers.get('webhook-id') || data.subscription_id || data.payment_id || ''

    if (!externalEventId) {
      return NextResponse.json({ error: 'Missing event id' }, { status: 400 })
    }

    const claim = await beginBillingEvent({
      provider: 'dodo',
      externalEventId,
      eventType: payload.type ?? 'unknown',
      // Identifiers only. The raw payload can carry customer PII and card
      // metadata that we have no reason to retain.
      payloadMetadata: {
        subscriptionId: data.subscription_id ?? null,
        paymentId: data.payment_id ?? null,
        plan: data.metadata?.plan ?? null,
      },
    })

    // Already processed — acknowledge so the provider stops retrying.
    if (!claim.shouldProcess) {
      return NextResponse.json({ success: true, duplicate: true })
    }
    eventId = claim.eventId

    const organizationId = await resolveOrganizationId(data)
    if (!organizationId) {
      await finishBillingEvent(eventId, 'ignored', 'No organization matched this event')
      // 200, not 4xx: retrying will not make the tenant appear.
      return NextResponse.json({ success: true, ignored: true })
    }

    const periodStart = asDate(data.current_period_start ?? data.previous_billing_date)
    const periodEnd = asDate(data.current_period_end ?? data.next_billing_date)
    const common = {
      organizationId,
      externalSubscriptionId: data.subscription_id ?? null,
      externalCustomerId: data.customer?.customer_id ?? data.customer_id ?? null,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    }

    switch (payload.type) {
      case 'subscription.active':
      case 'subscription.renewed':
        await applyPlanToOrganization({
          ...common,
          planCode: mapDodoPlan(data.metadata?.plan),
          status: 'active',
          billingInterval: data.payment_frequency_interval,
          cancelAtPeriodEnd: false,
        })
        break

      case 'subscription.on_hold':
      case 'payment.failed':
        // Kept on the paid plan while past due. Downgrading on a single failed
        // charge would take a client's live assistants offline over a card that
        // is about to be retried.
        await applyPlanToOrganization({
          ...common,
          planCode: mapDodoPlan(data.metadata?.plan),
          status: 'past_due',
        })
        break

      case 'subscription.canceled':
      case 'subscription.expired':
        await applyPlanToOrganization({
          ...common,
          planCode: 'FREE',
          status: 'cancelled',
          cancelAtPeriodEnd: true,
        })
        break

      case 'payment.succeeded':
        // Recorded in the ledger by beginBillingEvent; a succeeded payment on an
        // existing subscription needs no plan change of its own.
        break

      default:
        await finishBillingEvent(eventId, 'ignored', `Unhandled type: ${payload.type}`)
        return NextResponse.json({ success: true, unhandled: true })
    }

    await finishBillingEvent(eventId, 'processed')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Dodo webhook] processing failed:', error)
    await finishBillingEvent(
      eventId,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    )
    // 400 so the provider retries; the idempotency claim makes that safe.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 })
  }
}
