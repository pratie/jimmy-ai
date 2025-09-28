import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'

const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET!)

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    const webhookHeaders = {
      'webhook-id': request.headers.get('webhook-id') || '',
      'webhook-signature': request.headers.get('webhook-signature') || '',
      'webhook-timestamp': request.headers.get('webhook-timestamp') || '',
    }

    // Verify webhook signature
    await webhook.verify(rawBody, webhookHeaders)
    const payload = JSON.parse(rawBody)

    console.log('Dodo webhook received:', payload.type)

    switch (payload.type) {
      case 'subscription.active':
        await handleSubscriptionActive(payload)
        break

      case 'subscription.renewed':
        await handleSubscriptionRenewed(payload)
        break

      case 'payment.succeeded':
        await handlePaymentSucceeded(payload)
        break

      case 'payment.failed':
        await handlePaymentFailed(payload)
        break

      default:
        console.log('Unhandled webhook type:', payload.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

async function handleSubscriptionActive(payload: any) {
  try {
    const { customer, subscription_id } = payload.data

    // Find user by email
    const user = await client.user.findFirst({
      where: {
        // Assuming email is stored in fullname or we need to get it from Clerk
        // This would need to be adjusted based on how you store user emails
      }
    })

    if (user) {
      // Update subscription status
      await client.billings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          plan: 'PRO', // Default, should be determined from product_id
          credits: 50,
        },
        update: {
          plan: 'PRO',
          credits: 50,
        },
      })
    }
  } catch (error) {
    console.error('Error handling subscription.active:', error)
  }
}

async function handleSubscriptionRenewed(payload: any) {
  try {
    // Handle subscription renewal
    console.log('Subscription renewed:', payload.data.subscription_id)
    // Add logic to reset credits or update billing cycle
  } catch (error) {
    console.error('Error handling subscription.renewed:', error)
  }
}

async function handlePaymentSucceeded(payload: any) {
  try {
    const { payment_id, customer, metadata } = payload.data

    // Check if this is a customer purchase (has domainId in metadata)
    if (metadata?.domainId && metadata?.customerId) {
      // Handle customer purchase success
      console.log('Customer payment succeeded:', payment_id)

      // You might want to:
      // 1. Send confirmation email
      // 2. Update order status
      // 3. Trigger fulfillment process

    } else {
      // Handle subscription payment success
      console.log('Subscription payment succeeded:', payment_id)
    }
  } catch (error) {
    console.error('Error handling payment.succeeded:', error)
  }
}

async function handlePaymentFailed(payload: any) {
  try {
    const { payment_id, customer } = payload.data
    console.log('Payment failed:', payment_id)

    // Handle payment failure:
    // 1. Send notification email
    // 2. Update subscription status
    // 3. Trigger retry logic if applicable
  } catch (error) {
    console.error('Error handling payment.failed:', error)
  }
}