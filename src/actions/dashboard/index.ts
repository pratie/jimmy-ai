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

export const getUserBalance = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const connectedStripe = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          dodoMerchantId: true,
        },
      })

      if (connectedStripe) {
        // TODO: Implement Dodo Payments transaction retrieval
        // For now, return mock data to prevent errors
        const transactions = {
          pending: [{ amount: 0, currency: 'usd' }],
          available: [{ amount: 0, currency: 'usd' }]
        }

        if (transactions) {
          const sales = transactions.pending.reduce((total, next) => {
            return total + next.amount
          }, 0)

          return sales / 100
        }
      }
    }
  } catch (error) {
    console.log(error)
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

export const getUserTransactions = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const connectedStripe = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          dodoMerchantId: true,
        },
      })

      if (connectedStripe) {
        // TODO: Implement Dodo Payments charge list retrieval
        // For now, return mock data to prevent errors
        const transactions = {
          data: [] // Empty array for now - will be populated with Dodo transaction data
        }
        if (transactions) {
          return transactions
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}
