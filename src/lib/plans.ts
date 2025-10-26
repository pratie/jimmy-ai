// Plan limits configuration - Single source of truth
// All plan limits and pricing defined here

export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'

export const PLAN_LIMITS = {
  FREE: {
    messageCredits: 100,
    domains: 1,
    knowledgeBaseMB: 1,
    trainingSources: 5,
    conversationHistoryDays: 30,
  },
  STARTER: {
    messageCredits: 2000,
    domains: 1,
    knowledgeBaseMB: 20,
    trainingSources: 15,
    conversationHistoryDays: Infinity,
  },
  PRO: {
    messageCredits: 5000,
    domains: 5,
    knowledgeBaseMB: 50,
    trainingSources: 50,
    conversationHistoryDays: Infinity,
  },
  BUSINESS: {
    messageCredits: 10000,
    domains: Infinity,
    knowledgeBaseMB: 200,
    trainingSources: Infinity,
    conversationHistoryDays: Infinity,
  },
} as const

export function getPlanLimits(plan: PlanType | string | null | undefined) {
  const planKey = plan as PlanType
  return PLAN_LIMITS[planKey] || PLAN_LIMITS.FREE
}

export const PLAN_PRICES = {
  FREE: {
    monthly: 0,
    yearly: 0,
  },
  STARTER: {
    monthly: 19,
    yearly: 134, // $134/year
  },
  PRO: {
    monthly: 49,
    yearly: 348, // $348/year
  },
  BUSINESS: {
    monthly: 99,
    yearly: 585, // $585/year
  },
} as const

// Helper to check if user can perform action
export function canPerformAction(
  currentCount: number,
  limit: number
): boolean {
  if (limit === Infinity) return true
  return currentCount < limit
}

// Helper to get plan display name
export function getPlanDisplayName(plan: PlanType | string): string {
  const planMap: Record<string, string> = {
    FREE: 'Free',
    STARTER: 'Starter',
    PRO: 'Pro',
    BUSINESS: 'Business',
  }
  return planMap[plan] || 'Free'
}

// Helper to calculate days until reset
export function getDaysUntilReset(resetDate: Date): number {
  const now = new Date()
  const diff = resetDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Helper to check if credits should reset
export function shouldResetCredits(resetDate: Date): boolean {
  return new Date() >= resetDate
}

// Helper to get next reset date (30 days from now)
export function getNextResetDate(): Date {
  const now = new Date()
  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
}
