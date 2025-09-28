'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'

// Dodo Payments Configuration
const DODO_API_BASE = process.env.NEXT_PUBLIC_DODO_API_URL || 'https://test.dodopayments.com'
const DODO_API_KEY = process.env.DODO_API_KEY

// Plan to Dodo Product ID mapping
const getPlanProductId = (item: 'STANDARD' | 'PRO' | 'ULTIMATE') => {
  if (item == 'PRO') return process.env.DODO_PRODUCT_ID_PRO || 'pdt_eE8HNUK2QrjpADjwMAqav' // ICON AI - $19.99
  if (item == 'ULTIMATE') return process.env.DODO_PRODUCT_ID_ULTIMATE || 'pdt_ULTIMATE_PLACEHOLDER' // $34.99
  return null // STANDARD is free
}

// Plan pricing (for display purposes)
const setPlanAmount = (item: 'STANDARD' | 'PRO' | 'ULTIMATE') => {
  if (item == 'PRO') return 1999 // $19.99 (in cents)
  if (item == 'ULTIMATE') return 3499 // $34.99 (in cents)
  return 0 // STANDARD is free
}

// Create subscription payment link for platform plans
export const onCreateSubscriptionPaymentLink = async (
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    if (plan === 'STANDARD') {
      // Free plan - just update directly
      return await onUpdateSubscription(plan)
    }

    const productId = getPlanProductId(plan)
    if (!productId) {
      throw new Error(`No product ID configured for plan: ${plan}`)
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
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
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
    const credits = plan == 'PRO' ? 50 : plan == 'ULTIMATE' ? 500 : 10

    const billing = await client.billings.upsert({
      where: { userId: dbUser.id },
      create: {
        userId: dbUser.id,
        plan,
        credits,
      },
      update: {
        plan,
        credits,
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