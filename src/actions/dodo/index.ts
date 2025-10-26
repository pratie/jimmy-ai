'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { getPlanLimits, getNextResetDate } from '@/lib/plans'

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
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        User: {
          select: {
            dodoMerchantId: true,
          },
        },
      },
    })

    if (!domain?.User?.dodoMerchantId) {
      throw new Error('Domain owner has not connected Dodo Payments account')
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
  plan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS',
  providerSubscriptionId?: string,
  status?: string,
  billingInterval: 'MONTHLY' | 'YEARLY' = 'MONTHLY'
) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    // First, get the user's database ID
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) throw new Error('User not found in database')

    // Update or create billing record directly
    const limits = getPlanLimits(plan)
    const nextReset = getNextResetDate()

    const billing = await client.billings.upsert({
      where: { userId: dbUser.id },
      create: {
        userId: dbUser.id,
        plan,
        messageCredits: limits.messageCredits,
        messagesUsed: 0,
        messagesResetAt: nextReset,
        billingInterval,
        provider: 'dodo',
        providerSubscriptionId,
        status: status || 'active',
        cancelAtPeriodEnd: false,
        endsAt: null,
      },
      update: {
        plan,
        messageCredits: limits.messageCredits,
        messagesUsed: 0,
        messagesResetAt: nextReset,
        billingInterval,
        provider: 'dodo',
        // Only set providerSubscriptionId if provided (avoid overwriting with undefined)
        ...(providerSubscriptionId ? { providerSubscriptionId } : {}),
        status: status || 'active',
        cancelAtPeriodEnd: false,
        endsAt: null,
      },
    })

    if (billing) {
      return {
        status: 200,
        message: 'Subscription updated successfully',
        plan: billing.plan,
      }
    }
  } catch (error) {
    console.error('Subscription update error:', error)
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
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, subscription: { select: { providerSubscriptionId: true } } },
    })

    const subscriptionId = dbUser?.subscription?.providerSubscriptionId
    if (!subscriptionId) {
      return { status: 400, message: 'No active subscription found' }
    }

    // Call Dodo API to cancel (at period end by default)
    await callDodoCancel(subscriptionId, atPeriodEnd)

    // Mark as scheduled to cancel, keep plan active until webhook confirms
    await client.billings.update({
      where: { userId: dbUser!.id },
      data: {
        cancelAtPeriodEnd: true,
        status: 'active',
      },
    })

    return { status: 200, message: 'Subscription cancellation scheduled at period end' }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return { status: 400, message: 'Failed to cancel subscription' }
  }
}

// Change current user's subscription plan (no new checkout), using Dodo change-plan API
export const onChangeSubscriptionPlan = async (
  newPlan: 'STARTER' | 'PRO' | 'BUSINESS',
  proration: 'prorated_immediately' | 'full_immediately' | 'difference_immediately' = 'prorated_immediately'
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'User not authenticated' }

    // Get DB user + current subscription id
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, subscription: { select: { providerSubscriptionId: true, plan: true } } },
    })

    const subscriptionId = dbUser?.subscription?.providerSubscriptionId
    if (!subscriptionId) {
      return { status: 400, message: 'No active subscription found. Please subscribe first.' }
    }

    // Map target plan to Dodo product id
    const productId = getPlanProductId(newPlan)
    if (!productId) {
      return { status: 400, message: 'Invalid target plan or product id not configured' }
    }

    // Make Dodo change-plan call
    const res = await fetch(`${DODO_API_BASE}/subscriptions/change-plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: subscriptionId,
        product_id: productId,
        proration_option: proration,
      }),
    })

    if (!res.ok) {
      const err = await res.text().catch(() => '')
      console.error('[Dodo change-plan] Error:', res.status, err)
      return { status: 400, message: 'Failed to change plan' }
    }

    // Update local billing record to reflect new plan immediately
    const limits = getPlanLimits(newPlan)
    await client.billings.update({
      where: { userId: dbUser.id },
      data: {
        plan: newPlan,
        messageCredits: limits.messageCredits,
        status: 'active',
        cancelAtPeriodEnd: false,
      },
    })

    return { status: 200, message: 'Plan changed successfully', plan: newPlan }
  } catch (error) {
    console.error('Change subscription plan error:', error)
    return { status: 400, message: 'Failed to change plan' }
  }
}

// Connect user to Dodo Payments for receiving payments (marketplace functionality)
export const onConnectDodoPayments = async () => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    // Note: Dodo Payments might not have direct marketplace/connect functionality like Stripe
    // This would need to be implemented based on Dodo's actual capabilities
    // For now, we'll store a placeholder merchant ID

    // In a real implementation, this would:
    // 1. Create a merchant account with Dodo
    // 2. Get the merchant ID
    // 3. Store it in the database

    const merchantId = `dodo_merchant_${user.id}_${Date.now()}`

    const updatedUser = await client.user.update({
      where: { clerkId: user.id },
      data: { dodoMerchantId: merchantId },
    })

    return {
      success: true,
      merchantId: updatedUser.dodoMerchantId,
      message: 'Dodo Payments account connected successfully',
    }
  } catch (error) {
    console.error('Dodo connect error:', error)
    throw error
  }
}
