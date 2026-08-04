'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

import { requireOrganizationPermission, requireTenantContext } from '@/lib/tenant'
import {
  applyPlanToOrganization,
  getOrganizationSubscription,
  type PlanCode,
} from '@/lib/billing/subscription'

// Dodo Payments Configuration
const DODO_API_BASE = process.env.NEXT_PUBLIC_DODO_API_URL || 'https://test.dodopayments.com'
const DODO_API_KEY = process.env.DODO_API_KEY

// Plan to Dodo Product ID mapping (defaults to monthly)
const getPlanProductId = (item: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS', interval: 'MONTHLY' | 'YEARLY' = 'MONTHLY') => {
  if (item === 'FREE') return null

  // Yearly subscriptions
  if (interval === 'YEARLY') {
    if (item === 'STARTER') return process.env.DODO_PRODUCT_ID_STARTER_YEARLY || 'pdt_4WrJSCwPMmqIAT8tVr2Kk'
    if (item === 'PRO') return process.env.DODO_PRODUCT_ID_PRO_YEARLY || 'pdt_suAOuFzuuXYGSntIZ8S94'
    if (item === 'BUSINESS') return process.env.DODO_PRODUCT_ID_BUSINESS_YEARLY || 'pdt_md26pGqUBcoGv8n0lWe1v'
  }

  // Monthly subscriptions (default)
  if (item === 'STARTER') return process.env.DODO_PRODUCT_ID_STARTER || 'pdt_Gez1YlhKjDIJz3Asiql8Y'
  if (item === 'PRO') return process.env.DODO_PRODUCT_ID_PRO || 'pdt_VvrVsP0saqj0fjjQKVcbc'
  if (item === 'BUSINESS') return process.env.DODO_PRODUCT_ID_BUSINESS || 'pdt_2RWqgVJU6XFZ6nKQHRQez'

  return null
}

// Plan pricing (for display purposes)
const setPlanAmount = (item: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS') => {
  if (item == 'STARTER') return 1900 // $19 (in cents)
  if (item == 'PRO') return 4900 // $49 (in cents)
  if (item == 'BUSINESS') return 9900 // $99 (in cents)
  return 0 // FREE plan
}

// Create subscription payment link for platform plans
export const onCreateSubscriptionPaymentLink = async (
  plan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS',
  interval: 'MONTHLY' | 'YEARLY' = 'MONTHLY'
) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    if (plan === 'FREE') {
      // Free plan - just update directly
      return await onUpdateSubscription(plan, undefined, undefined, interval)
    }

    const productId = getPlanProductId(plan, interval)
    if (!productId) {
      throw new Error(`No product ID configured for plan: ${plan} (${interval})`)
    }

    const response = await fetch(`${DODO_API_BASE}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DODO_API_KEY}`,
      },
      body: JSON.stringify({
        billing: {
          city: 'Default City',
          country: 'US',
          state: 'Default State',
          street: 'Default Street',
          zipcode: 12345,
        },
        customer: {
          email: user.emailAddresses[0]?.emailAddress,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        },
        payment_link: true,
        product_id: productId,
        quantity: 1,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?payment=success&plan=${plan}`,
        metadata: {
          plan: plan,
          userId: user.id,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Dodo API Error:', errorData)
      throw new Error('Failed to create subscription payment link')
    }

    const data = await response.json()
    return {
      paymentLink: data.payment_link,
      subscriptionId: data.subscription_id
    }
  } catch (error) {
    console.error('Subscription payment link creation error:', error)
    throw error
  }
}

// Create payment link for customer purchases (domain owner products)
export const onCreateCustomerPaymentLink = async (
  products: { id: string; name: string; price: number }[],
  customerEmail: string,
  domainId: string,
  customerId: string
) => {
  try {
    // Marketplace payments run through a connected-account Integration on the
    // organization. The merchant id used to sit on `User.dodoMerchantId`, a
    // column that had never actually been applied to production.
    const workspace = await client.clientWorkspace.findUnique({
      where: { id: domainId },
      select: {
        organizationId: true,
        organization: {
          select: {
            integrations: {
              where: { provider: 'dodo', status: 'connected' },
              select: { configuration: true },
              take: 1,
            },
          },
        },
      },
    })

    const merchantId = (workspace?.organization?.integrations?.[0]?.configuration as
      | { merchantId?: string }
      | null)?.merchantId

    if (!merchantId) {
      throw new Error('This client\'s agency has not connected a Dodo Payments account')
    }

    // Calculate total amount
    const totalAmount = products.reduce((sum, product) => sum + product.price, 0)

    const response = await fetch(`${DODO_API_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DODO_API_KEY}`,
      },
      body: JSON.stringify({
        billing: {
          city: 'Default City',
          country: 'US',
          state: 'Default State',
          street: 'Default Street',
          zipcode: 12345,
        },
        customer: {
          email: customerEmail,
          name: 'Customer',
        },
        payment_link: true,
        product_cart: products.map(product => ({
          product_id: product.id,
          quantity: 1,
        })),
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${domainId}/payment/${customerId}/success`,
        metadata: {
          domainId,
          customerId,
          totalAmount: totalAmount.toString(),
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Dodo API Error:', errorData)
      throw new Error('Failed to create customer payment link')
    }

    const data = await response.json()
    return {
      paymentLink: data.payment_link,
      paymentId: data.payment_id
    }
  } catch (error) {
    console.error('Customer payment link creation error:', error)
    throw error
  }
}

// Update user subscription after successful payment
export const onUpdateSubscription = async (
  plan: PlanCode,
  providerSubscriptionId?: string,
  status?: string,
  billingInterval: 'MONTHLY' | 'YEARLY' = 'MONTHLY'
) => {
  try {
    const ctx = await requireOrganizationPermission('manageBilling')

    // Plan limits are NOT copied onto the subscription. They resolve live from
    // PlanEntitlement, so changing a plan's allowance reaches existing
    // customers — the old code snapshotted messageCredits at purchase time and
    // those customers never saw an update.
    const subscription = await applyPlanToOrganization({
      organizationId: ctx.organizationId,
      planCode: plan,
      externalSubscriptionId: providerSubscriptionId ?? null,
      status,
      billingInterval,
      cancelAtPeriodEnd: false,
    })

    return {
      status: 200,
      message: 'Subscription updated successfully',
      plan: subscription.plan?.code ?? plan,
    }
  } catch (error) {
    console.error('[Dodo] Subscription update failed:', error)
    throw error
  }
}

// Internal helper: call Dodo API to cancel a subscription
async function callDodoCancel(subscriptionId: string, atPeriodEnd: boolean) {
  // Attempt 1: POST /subscriptions/cancel (body with subscription_id)
  const attempt1 = async () => {
    const url = `${DODO_API_BASE}/subscriptions/cancel`
    const body = {
      subscription_id: subscriptionId,
      cancel_at_period_end: atPeriodEnd,
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Attempt1 ${res.status}`)
    try { return await res.json() } catch { return { success: true } }
  }

  // Attempt 2: PATCH /subscriptions/{id} (toggle cancel_at_period_end)
  const attempt2 = async () => {
    const url = `${DODO_API_BASE}/subscriptions/${subscriptionId}`
    const body = { cancel_at_period_end: atPeriodEnd }
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Attempt2 ${res.status}`)
    try { return await res.json() } catch { return { success: true } }
  }

  try {
    return await attempt1()
  } catch (e1) {
    // Fallback to PATCH shape
    try {
      return await attempt2()
    } catch (e2) {
      throw new Error(`Dodo cancel failed: ${String(e1)}; ${String(e2)}`)
    }
  }
}

// Cancel current user's subscription
export const onCancelSubscription = async ({ atPeriodEnd = true }: { atPeriodEnd?: boolean }) => {
  try {
    const ctx = await requireOrganizationPermission('manageBilling')
    const subscription = await getOrganizationSubscription(ctx.organizationId)

    const subscriptionId = subscription?.externalSubscriptionId
    if (!subscriptionId) return { status: 400, message: 'No active subscription found' }

    await callDodoCancel(subscriptionId, atPeriodEnd)

    // Flagged only. The plan stays active until the provider's webhook confirms
    // the period actually ended — cancelling locally first would cut off a
    // customer who has already paid for the rest of the month.
    await client.subscription.update({
      where: { organizationId: ctx.organizationId },
      data: { cancelAtPeriodEnd: true },
    })

    return { status: 200, message: 'Subscription will cancel at the end of the current period' }
  } catch (error) {
    console.error('[Dodo] Cancel failed:', error)
    return { status: 400, message: 'Could not cancel the subscription' }
  }
}

export const onChangeSubscriptionPlan = async (
  plan: PlanCode,
  interval: 'MONTHLY' | 'YEARLY' = 'MONTHLY'
) => {
  try {
    const ctx = await requireOrganizationPermission('manageBilling')
    const subscription = await getOrganizationSubscription(ctx.organizationId)

    // Downgrade to FREE: cancel upstream, then apply locally.
    if (plan === 'FREE') {
      if (subscription?.externalSubscriptionId) {
        await callDodoCancel(subscription.externalSubscriptionId, true).catch((error) =>
          console.error('[Dodo] upstream cancel failed, applying FREE anyway:', error)
        )
      }
      await applyPlanToOrganization({
        organizationId: ctx.organizationId,
        planCode: 'FREE',
        status: 'active',
        billingInterval: interval,
        cancelAtPeriodEnd: false,
      })
      return { status: 200, message: 'Moved to the Free plan' }
    }

    // Paid plans go through a fresh checkout link; the webhook applies the plan
    // once payment actually succeeds. Applying it here would grant the new plan
    // before any money moved.
    const link = await onCreateSubscriptionPaymentLink(plan, interval)
    return { status: 200, ...link }
  } catch (error) {
    console.error('[Dodo] Plan change failed:', error)
    return { status: 400, message: 'Could not change the plan' }
  }
}

export const onConnectDodoPayments = async () => {
  try {
    const ctx = await requireOrganizationPermission('manageIntegrations')

    // Placeholder: Dodo has no Stripe-Connect-style onboarding wired up yet.
    // The record is created so the integration surface is real, and the
    // merchant id is stored in `configuration` rather than on a user column.
    const merchantId = `dodo_merchant_${ctx.organizationId}`

    const integration = await client.integration.upsert({
      where: {
        id:
          (
            await client.integration.findFirst({
              where: { organizationId: ctx.organizationId, provider: 'dodo' },
              select: { id: true },
            })
          )?.id ?? '00000000-0000-0000-0000-000000000000',
      },
      create: {
        organizationId: ctx.organizationId,
        integrationType: 'crm',
        provider: 'dodo',
        status: 'connected',
        configuration: { merchantId },
        connectedByUserId: ctx.userId,
      },
      update: { status: 'connected', configuration: { merchantId } },
      select: { id: true, configuration: true },
    })

    return { success: true, merchantId, integrationId: integration.id }
  } catch (error) {
    console.error('[Dodo] Connect failed:', error)
    return { success: false, message: 'Could not connect Dodo Payments' }
  }
}
