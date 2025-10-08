import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'
import { PlanType } from '@/lib/plans'

const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET!)

// Map old Dodo plan names to new PlanType
function mapDodoPlanToNew(dodoPlan: string): PlanType {
  const mapping: Record<string, PlanType> = {
    'STANDARD': 'STARTER',
    'PRO': 'PRO',
    'ULTIMATE': 'BUSINESS',
  }
  return mapping[dodoPlan] || 'STARTER'
}

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

      case 'subscription.canceled':
        await handleSubscriptionCanceled(payload)
        break

      case 'subscription.on_hold':
        await handleSubscriptionOnHold(payload)
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
    const { subscription_id, metadata, current_period_end } = payload.data || {}
    // Prefer metadata.userId (Clerk ID) if present
    const metadataUserId = metadata?.userId
    const dodoPlan = (metadata?.plan as string) || 'PRO'
    const selectedPlan = mapDodoPlanToNew(dodoPlan)

    if (metadataUserId) {
      const dbUser = await client.user.findUnique({ where: { clerkId: metadataUserId }, select: { id: true } })
      if (dbUser) {
        await client.billings.upsert({
          where: { userId: dbUser.id },
          create: {
            userId: dbUser.id,
            plan: selectedPlan,
            provider: 'dodo',
            providerSubscriptionId: subscription_id,
            status: 'active',
            cancelAtPeriodEnd: false,
            endsAt: current_period_end ? new Date(current_period_end) : null,
          },
          update: {
            plan: selectedPlan,
            provider: 'dodo',
            providerSubscriptionId: subscription_id,
            status: 'active',
            cancelAtPeriodEnd: false,
            endsAt: current_period_end ? new Date(current_period_end) : null,
          },
        })
        return
      }
    }

    // Fallback: update by providerSubscriptionId if userId missing
    if (subscription_id) {
      await client.billings.updateMany({
        where: { providerSubscriptionId: subscription_id },
        data: {
          status: 'active',
          cancelAtPeriodEnd: false,
          endsAt: current_period_end ? new Date(current_period_end) : null,
        },
      })
    }
  } catch (error) {
    console.error('Error handling subscription.active:', error)
  }
}

async function handleSubscriptionRenewed(payload: any) {
  try {
    const { subscription_id, current_period_end } = payload.data || {}
    console.log('Subscription renewed:', subscription_id)
    await client.billings.updateMany({
      where: { providerSubscriptionId: subscription_id },
      data: { status: 'active', endsAt: current_period_end ? new Date(current_period_end) : undefined },
    })
  } catch (error) {
    console.error('Error handling subscription.renewed:', error)
  }
}

async function handleSubscriptionCanceled(payload: any) {
  try {
    const { subscription_id } = payload.data || {}
    if (!subscription_id) return

    // Downgrade to FREE on cancellation
    const billing = await client.billings.findFirst({ where: { providerSubscriptionId: subscription_id }, select: { userId: true } })
    if (billing?.userId) {
      await client.billings.update({
        where: { userId: billing.userId },
        data: {
          plan: 'FREE',
          status: 'canceled',
          cancelAtPeriodEnd: true,
        },
      })
    } else {
      await client.billings.updateMany({
        where: { providerSubscriptionId: subscription_id },
        data: { status: 'canceled', cancelAtPeriodEnd: true },
      })
    }
  } catch (error) {
    console.error('Error handling subscription.canceled:', error)
  }
}

async function handleSubscriptionOnHold(payload: any) {
  try {
    const { subscription_id } = payload.data || {}
    if (!subscription_id) return
    await client.billings.updateMany({
      where: { providerSubscriptionId: subscription_id },
      data: { status: 'on_hold' },
    })
  } catch (error) {
    console.error('Error handling subscription.on_hold:', error)
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
