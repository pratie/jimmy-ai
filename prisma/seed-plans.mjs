/**
 * Plan + entitlement catalogue. REFERENCE DATA, not demo data.
 *
 *   npm run db:seed-plans
 *
 * Idempotent (upsert by plan code), so it is safe to run in any environment
 * and safe to re-run after changing a limit.
 *
 * This file is the ONLY place plan limits are defined. Nothing in the app may
 * hardcode a limit — everything reads it through the entitlement service
 * (src/lib/entitlements.ts). That is the fix for the old architecture, where
 * PLAN_LIMITS in src/lib/plans.ts, the pricing cards, and several components
 * each carried their own copy and drifted.
 *
 * Prices are in minor units (cents). Yearly figures are the TOTAL annual
 * charge, matching the values previously shipped in src/lib/plans.ts.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MB = 1024 * 1024

/** null = unlimited. Booleans are 0 / 1. */
const PLANS = [
  {
    code: 'FREE',
    name: 'Free',
    description: 'Win the first client — test the full flow on a real website.',
    monthlyPriceMinor: 0,
    yearlyPriceMinor: 0,
    entitlements: {
      maximum_client_workspaces: 1n,
      maximum_assistants: 1n,
      monthly_messages: 100n,
      monthly_crawl_pages: 50n,
      maximum_training_sources: 5n,
      storage_bytes: BigInt(1 * MB),
      maximum_team_members: 1n,
      maximum_client_users: 0n,
      maximum_prospect_demos: 3n,
      hide_branding: 0n,
      shareable_demos: 1n,
      client_portal: 0n,
      custom_domain: 0n,
      advanced_reporting: 0n,
      api_access: 0n,
    },
  },
  {
    code: 'STARTER',
    name: 'Starter',
    description: 'Launch the first paid client.',
    monthlyPriceMinor: 1900,
    yearlyPriceMinor: 13400,
    entitlements: {
      maximum_client_workspaces: 1n,
      maximum_assistants: 2n,
      monthly_messages: 2000n,
      monthly_crawl_pages: 500n,
      maximum_training_sources: 15n,
      storage_bytes: BigInt(20 * MB),
      maximum_team_members: 2n,
      maximum_client_users: 0n,
      maximum_prospect_demos: 5n,
      hide_branding: 0n,
      shareable_demos: 1n,
      client_portal: 0n,
      custom_domain: 0n,
      advanced_reporting: 0n,
      api_access: 0n,
    },
  },
  {
    code: 'PRO',
    name: 'Pro',
    description: 'Run a growing client roster.',
    monthlyPriceMinor: 4900,
    yearlyPriceMinor: 34800,
    entitlements: {
      maximum_client_workspaces: 5n,
      maximum_assistants: 10n,
      monthly_messages: 5000n,
      monthly_crawl_pages: 2000n,
      maximum_training_sources: 50n,
      storage_bytes: BigInt(50 * MB),
      maximum_team_members: 5n,
      maximum_client_users: 5n,
      maximum_prospect_demos: 15n,
      hide_branding: 1n, // Pro & Business only — matches the shipped behaviour
      shareable_demos: 1n,
      client_portal: 0n,
      custom_domain: 0n,
      advanced_reporting: 1n,
      api_access: 0n,
    },
  },
  {
    code: 'BUSINESS',
    name: 'Business',
    description: 'Scale the offer across every website client.',
    monthlyPriceMinor: 9900,
    yearlyPriceMinor: 58500,
    entitlements: {
      maximum_client_workspaces: null, // unlimited
      maximum_assistants: null,
      monthly_messages: 10000n,
      monthly_crawl_pages: 10000n,
      maximum_training_sources: null,
      storage_bytes: BigInt(200 * MB),
      maximum_team_members: 20n,
      maximum_client_users: null,
      maximum_prospect_demos: 50n,
      hide_branding: 1n,
      shareable_demos: 1n,
      client_portal: 0n, // not built — stays off until it ships
      custom_domain: 0n, // not built
      advanced_reporting: 1n,
      api_access: 0n, // not built
    },
  },
]

async function main() {
  for (const spec of PLANS) {
    const plan = await prisma.plan.upsert({
      where: { code: spec.code },
      create: {
        code: spec.code,
        name: spec.name,
        description: spec.description,
        monthlyPriceMinor: spec.monthlyPriceMinor,
        yearlyPriceMinor: spec.yearlyPriceMinor,
        currency: 'USD',
        active: true,
      },
      update: {
        name: spec.name,
        description: spec.description,
        monthlyPriceMinor: spec.monthlyPriceMinor,
        yearlyPriceMinor: spec.yearlyPriceMinor,
        active: true,
      },
    })

    for (const [key, limitValue] of Object.entries(spec.entitlements)) {
      await prisma.planEntitlement.upsert({
        where: { planId_key: { planId: plan.id, key } },
        create: { planId: plan.id, key, limitValue },
        update: { limitValue },
      })
    }

    const n = Object.keys(spec.entitlements).length
    console.log(`  ✓ ${spec.code.padEnd(9)} $${(spec.monthlyPriceMinor / 100).toFixed(0).padStart(3)}/mo  ${n} entitlements`)
  }

  const planCount = await prisma.plan.count()
  const entCount = await prisma.planEntitlement.count()
  console.log(`\n${planCount} plans, ${entCount} entitlements.`)
}

main()
  .catch((e) => { console.error('✖', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
