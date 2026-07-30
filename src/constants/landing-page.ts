// Pricing cards — titles MUST match the PlanType enum in src/lib/plans.ts
// (FREE / STARTER / PRO / BUSINESS) because settings surfaces look plans up
// by title. Features must stay truthful to PLAN_LIMITS in src/lib/plans.ts.
export const pricingCards = [
  {
    title: 'Free',
    description: 'Test everything on a real website',
    price: '$0',
    duration: 'month',
    highlight: 'Includes',
    features: [
      '1 client workspace',
      '100 messages / month',
      'Website & document training',
      'Lead inbox and bookings',
    ],
    priceId: '',
  },
  {
    title: 'Starter',
    description: 'For your first live client',
    price: '$19',
    duration: 'month',
    highlight: 'Everything in Free, plus',
    features: [
      '1 client workspace',
      '2,000 messages / month',
      '20 MB knowledge base',
      '15 training sources',
      'Full conversation history',
    ],
    priceId: 'pdt_Gez1YlhKjDIJz3Asiql8Y',
  },
  {
    title: 'Pro',
    description: 'For agencies with a client roster',
    price: '$49',
    duration: 'month',
    highlight: 'Everything in Starter, plus',
    features: [
      '5 client workspaces',
      '5,000 messages / month',
      '50 MB knowledge base',
      '50 training sources',
      'Your agency branding on the widget',
    ],
    priceId: 'pdt_VvrVsP0saqj0fjjQKVcbc',
  },
  {
    title: 'Business',
    description: 'For agencies scaling the offer',
    price: '$99',
    duration: 'month',
    highlight: 'Everything in Pro, plus',
    features: [
      'Unlimited client workspaces',
      '10,000 messages / month',
      '200 MB knowledge base',
      'Unlimited training sources',
      'Priority support',
    ],
    priceId: 'pdt_2RWqgVJU6XFZ6nKQHRQez',
  },
]
