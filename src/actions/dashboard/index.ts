'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

// Get total conversations (anonymous + leads) across all domains
export const getUserConversations = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const conversations = await client.chatRoom.count({
        where: {
          Domain: {
            User: {
              clerkId: user.id,
            },
          },
        },
      })
      return conversations || 0
    }
  } catch (error) {
    console.log(error)
    return 0
  }
}

// Get leads captured (customers with emails)
export const getUserClients = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const clients = await client.customer.count({
        where: {
          Domain: {
            User: {
              clerkId: user.id,
            },
          },
        },
      })
      if (clients) {
        return clients
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// Get appointments booked across all domains
export const getUserAppointments = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const appointments = await client.bookings.count({
        where: {
          Customer: {
            Domain: {
              User: {
                clerkId: user.id,
              },
            },
          },
        },
      })
      return appointments || 0
    }
  } catch (error) {
    console.log(error)
    return 0
  }
}

// Get user's balance from Dodo Payments
// NOTE: Feature temporarily disabled - will be implemented with Dodo Payments API
// When implementing, use: GET https://test.dodopayments.com/payments?status=succeeded
// See documentation: https://docs.dodopayments.com/api-reference/payments/get-payments
export const getUserBalance = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const connectedDodo = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          dodoMerchantId: true,
        },
      })

      if (connectedDodo?.dodoMerchantId) {
        // IMPLEMENTATION PLACEHOLDER:
        // 1. Fetch: GET /payments?status=succeeded&brand_id={merchantId}
        // 2. Sum: payments.reduce((sum, p) => sum + p.total_amount, 0)
        // 3. Return: total / 100 (convert cents to dollars)
        return 0 // Returns $0 until feature is enabled
      }
      return 0
    }
    return 0
  } catch (error) {
    console.log(error)
    return 0 // Safe fallback
  }
}

export const getUserPlanInfo = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const plan = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          _count: {
            select: {
              domains: true,
            },
          },
          subscription: {
            select: {
              plan: true,
              credits: true,
            },
          },
        },
      })
      if (plan) {
        return {
          plan: plan.subscription?.plan,
          credits: plan.subscription?.credits,
          domains: plan._count.domains,
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUserTotalProductPrices = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const products = await client.product.findMany({
        where: {
          Domain: {
            User: {
              clerkId: user.id,
            },
          },
        },
        select: {
          price: true,
        },
      })

      if (products) {
        const total = products.reduce((total, next) => {
          return total + next.price
        }, 0)

        return total
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// Get user's transaction history from Dodo Payments
// NOTE: Feature temporarily disabled - will be implemented with Dodo Payments API
// When implementing, use: GET https://test.dodopayments.com/payments
// See documentation: https://docs.dodopayments.com/api-reference/payments/get-payments
export const getUserTransactions = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const connectedDodo = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          dodoMerchantId: true,
        },
      })

      if (connectedDodo?.dodoMerchantId) {
        // IMPLEMENTATION PLACEHOLDER:
        // 1. Fetch: GET /payments?page_size=100&status=succeeded
        // 2. Transform to: { id, amount, status, customer_email, created }
        // 3. Return: { data: transactions }
        return { data: [] } // Returns empty array until feature is enabled
      }
      return { data: [] }
    }
    return { data: [] }
  } catch (error) {
    console.log(error)
    return { data: [] } // Safe fallback
  }
}
