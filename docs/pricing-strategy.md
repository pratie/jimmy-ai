# Pricing strategy

_Updated 2026-07-30. Grounded in `ideal-customer-profile.md`, `competitor-chatdash.md`, and the billing code (`src/lib/plans.ts`, Dodo products in `src/actions/dodo/index.ts`)._

## Current state (after the 2026-07-30 unification)

The **real, billable ladder** — enforced in `src/lib/plans.ts` and sold through Dodo — is:

| Plan | Price | Workspaces (domains) | Messages/mo | Knowledge | Sources |
|---|---|---|---|---|---|
| FREE | $0 | 1 | 100 | 1 MB | 5 |
| STARTER | $19 ($134/yr) | 1 | 2,000 | 20 MB | 15 |
| PRO | $49 ($348/yr) | 5 | 5,000 | 50 MB | 50 |
| BUSINESS | $99 ($585/yr) | Unlimited | 10,000 | 200 MB | Unlimited |

Branding removal (agency name on the widget) unlocks at PRO (`src/actions/bot/index.ts`).

Before the unification there were four conflicting narratives: a fictional "$97/mo + $500 setup" on the landing page (mapped to the PRO product that actually bills $49), stale "Self-Service / Managed Agent / Enterprise" cards in `src/constants/landing-page.ts` that broke the in-app plan lookups, and the real `plans.ts`. All surfaces now read from `pricingCards` whose titles match the plan enum. **Keep it that way: any pricing change starts in `src/lib/plans.ts` + Dodo, then `src/constants/landing-page.ts`.**

## Positioning

Price the unit the agency sells: the **client workspace**. The agency's mental math must stay obviously profitable per client (they charge $300–1,500/mo per client; a workspace costs them ~$10–19/mo on PRO). Marketing frames every tier this way.

Counter-position against ChatDash: monthly with no annual lock-in, and the AI engine is built in (they average $182/mo per agency for a shell that requires a separate agent vendor).

## Recommended next moves (in order)

1. **Raise PRO to $79 and BUSINESS to $149 for new customers** once there are ~10 paying agencies and a couple of case studies. The reference market clears far above $49 for 5 client slots. Grandfather existing customers.
2. **Add a metered extra-workspace add-on** ($15/mo per extra workspace on PRO) instead of forcing the jump to BUSINESS.
3. **White-label client portal** (end-client login under agency brand) as the BUSINESS anchor feature — it's ChatDash's whole moat and our biggest roadmap gap.
4. **Keep the concierge launch** as a sales motion (the 15-min call), not a fixed-price SKU, until it's a real product in Dodo.

## What not to do

- Don't publish any price that doesn't exist as a purchasable product (the old $97/$500 problem).
- Don't gate answer quality by tier — gate capacity (workspaces, messages) and agency conveniences (branding, portal, support).
- Don't introduce annual-only pricing while "no lock-in" is a selling point against ChatDash.
