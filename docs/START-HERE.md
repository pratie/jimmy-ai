# START HERE

**Snapshot taken:** 2026-08-05, 12:43 PDT
**Commit at time of writing:** `05f5f0f` — working tree clean
**Deployed:** chatdock.io (Vercel, auto-deploys every push to `master`)

This is the entry point. Read this file first, then
[`ENGINEERING-HANDOFF.md`](ENGINEERING-HANDOFF.md) for the deep technical
detail. Everything below was verified against the code on the date above, not
copied from older docs — where an older doc disagrees, this file wins.

---

## The 60-second version

ChatDock is a multi-tenant SaaS. Agencies (web, SEO, lead-gen) launch a branded
"AI receptionist" chat widget on their own clients' websites. The agency pays;
the agency's clients get the widget; their visitors do the chatting.

**The platform is built. The marketing site is live. Nobody can use it
end-to-end**, because no code path publishes an assistant. That is blocker #1
and it makes everything else theoretical until it is fixed.

---

## Mind map

```mermaid
mindmap
  root((ChatDock<br/>2026-08-05))
    Product
      Built and working
        Multi-tenant hierarchy
        Knowledge ingest and pgvector retrieval
        Widget resolve and SSE streaming
        Entitlements and usage metering
        Agency dashboard
        Landing site and /demo
      Blocked
        ::icon(fa fa-ban)
        No publish path
        No prospect demo flows
      Deliberately not built
        Voice
        Client-facing login
        CSV or API export
    Money
      Dodo configured
        6 product IDs set
        Monthly and yearly coded
        NEVER tested end to end
      Pricing 19 / 49 / 99
        Competitor at 120 / 300 / 600
        Likely 3x underpriced
      Two sources of truth
        plans.ts advertises
        PlanEntitlement enforces
    Market
      ChatDash competitor
        Verified 547k all time
        214 subscriptions
        ARPU 183
        Flat at ~20k per month
        Voice first, wraps Vapi
      Cold email channel
        ~1 customer per 1800 emails
        ~250 per month tooling
    Decisions open
      SaaS or agency first
      Chat only or add voice
      Reprice now or after proof
```

---

## The next five steps, in order

### 1. Make it possible to publish an assistant — **P0, blocks everything**

Nothing in the codebase writes `status: 'published'` or `publishedAt`. Verified
2026-08-05: the only matches in `src/` are reads (`where`, `select`,
`orderBy`). Meanwhile:

- `src/actions/settings/index.ts:131` creates an assistant with **no status**,
  so it takes the schema default `draft`
- `src/lib/widget/resolve.ts:148` returns `403 assistant_unpublished` for any
  `website_widget` deployment whose assistant is not published

**Every widget an agency installs on a client site fails permanently.**

*Do:* add a server action in `src/actions/settings/index.ts` that calls
`requireWorkspace(workspaceId, 'publishAssistant')` and writes
`{ status: 'published', publishedAt: new Date() }`. Wire it to the existing
status badges.

*Already exists:* the `publishAssistant` permission, the role matrices, the
dashboard badges, the widget-side gate. Only the write is missing.

*Done when:* a widget key that previously returned `403 assistant_unpublished`
serves a real answer, and `tests/security/tenant-isolation.test.ts` is still
green.

*Estimate:* half a day.

---

### 2. Prove the money path works — **never been tested**

Dodo **is** configured, contrary to older notes in this repo. Verified
2026-08-05 in `.env.local` (pulled from Vercel):

| Var | State |
|---|---|
| `DODO_API_KEY` | set |
| `DODO_WEBHOOK_SECRET` | set |
| `DODO_PRODUCT_ID_{STARTER,PRO,BUSINESS}` | set |
| `DODO_PRODUCT_ID_*_YEARLY` | set |
| `DODO_API_BASE` | **missing** — falls back to a default in code |

`src/actions/dodo/index.ts:18` already handles `MONTHLY | YEARLY`. So annual
billing is coded, not just planned.

**But no one has ever run a payment through it.** Configured is not the same as
working.

*Do:* run one real checkout in Dodo test mode. Confirm the webhook at
`src/app/api/dodo/webhook/route.ts` verifies its Standard Webhooks signature,
writes a `Subscription` row, and that `src/lib/entitlements.ts` then returns the
new plan's limits. Set `DODO_API_BASE` explicitly rather than relying on the
fallback.

*Done when:* a test purchase moves an organization from Free to Pro and the
workspace limit actually changes.

*Estimate:* half a day.

---

### 3. Reprice, and collapse the duplicate source of truth — **highest return**

Current: **$19 / $49 / $99**. A verified competitor (see Market intelligence)
charges **$120 / $300 / $600** for the same shape of product. Their blended
ARPU is $183.

At $49, $5,000 MRR needs **102 customers**. At $183 it needs **27**.

*Do:* raise the 5-workspace tier from $49 toward **$149**, create the matching
Dodo products, and update **both** sources at once:

- `src/lib/plans.ts` — what the site advertises
- `prisma/seed-plans.mjs` → `PlanEntitlement` — what actually gets enforced
- `src/components/landing/pricing-section.tsx`

**The trap:** these two disagree today and nothing keeps them in sync.
`src/lib/entitlements.ts` reads only the database; ten other files read only
`plans.ts`. Change one and the site will advertise limits the product does not
enforce. Fix the duplication as part of this step — have the pricing page read
plans server-side from the database, then delete `plans.ts`.

*Done when:* one source of truth, and the number on the pricing page is the
number `entitlements.ts` enforces.

*Estimate:* one day including the Dodo product setup.

---

### 4. Ship shareable prospect demo links — **the growth wedge**

`/demo` builds a working assistant from any URL in about 30 seconds. That is
the single strongest sales asset here: an agency can walk into a call with an
assistant already running on the prospect's own site.

The schema is fully ready and nothing uses it. Verified 2026-08-05:

| Seam | Where | Status |
|---|---|---|
| `workspaceType: prospect_demo` | `prisma/schema.prisma:258` | read-only |
| `shareToken` (unique) | `prisma/schema.prisma:429` | read at `widget/resolve.ts:83`, **never written** |
| `expiresAt` | schema | unused |
| `maximum_prospect_demos` | `src/lib/entitlements.ts:153` | enforced, never reached |
| "Demo" badges | `clients-grid.tsx`, `client-switcher.tsx` | render, never populated |

*Do:* a flow that creates a `prospect_demo` workspace, mints a `shareToken`,
sets an expiry, and returns a public link. See
[`outreach-demo-funnel-plan.md`](outreach-demo-funnel-plan.md), but note it was
written against the **legacy `Domain` schema** — its `isDemo`/`demoToken` design
is superseded by the fields above.

*Estimate:* two to three days.

---

### 5. Decide the go-to-market — **owner decision, not an engineering task**

Two paths, very different builds:

| | Sell ChatDock as SaaS | Run an agency, use ChatDock to deliver |
|---|---|---|
| To reach $5k MRR | 27–102 customers | 4–6 clients at ~$1,200/mo |
| Needs | self-serve onboarding, billing proven, support at scale | almost nothing extra |
| Time | 12+ months | 6–10 weeks |
| Produces | a business | revenue **and** the case studies the SaaS page lacks |

Steps 1–3 are required either way. Step 4 matters far more for the agency path.

**Recommendation on record (2026-08-05):** agency play first, capped at five
clients in one vertical, to fund runway and generate proof — then sell the SaaS
with real numbers on the page. The risk to manage is a services business
quietly eating the product business; cap it deliberately.

---

## State of play

| Area | Status | Evidence |
|---|---|---|
| Multi-tenancy and isolation | Working | 26 tests incl. a non-vacuity assertion |
| Knowledge ingest → retrieval | Working | `match_knowledge_chunks_scoped`, tenant arg required |
| Widget serve | **Blocked** | 403s on unpublished; nothing publishes |
| Billing | Configured, **unproven** | keys + 6 product IDs set; zero transactions |
| Landing site | Live | chatdock.io |
| `/demo` | Live and public | builds an assistant from any URL |
| Prospect demo links | Schema only | no write path |
| Realtime handoff | **Half-wired** | `pusher-client.ts` used by 2 hooks; `pusher-server.ts` imported by nothing — the app subscribes, nothing publishes |
| Voice | Not built, deliberate | schema accommodates it; do not build without a decision |
| Client-facing login | Not built | agency walks the client through instead |
| Export (CSV/API) | Not built | — |

---

## Market intelligence

### ChatDash — the closest competitor

Revenue verified by TrustMRR via Stripe API key (stronger than self-reported).

| | |
|---|---|
| All-time revenue | $547,338 |
| MRR (normalised) | $39,126 across **214 subscriptions** |
| ARPU | **$183** |
| Last 30 days cash | $20,323, **down 14%** vs prior period |
| Founded | April 2024 |
| Pricing | **$120 / $300 / $600** per month (3 / 5 / 10 clients) |
| Domain Rating | 36 — not winning on SEO |

**Read it carefully.** $547,338 over ~28 months is ~$19.5k/month average, and
the last 30 days was $20.3k. They are **flat**, not compounding. The gap between
$39k normalised MRR and $20k monthly cash indicates a heavy **annual prepay**
mix — worth copying, and already supported in `src/actions/dodo/index.ts`.

**What they are:** a white-label ops and billing layer for **voice** agents.
Their customers bring an agent from Retell, Vapi or ElevenLabs and pay for that
separately. They integrate GoHighLevel, HubSpot, Twilio, Google Calendar. They
also offer **performance-based billing** (per appointment, per lead) — ChatDock
has `BookingRequest`, `Lead` and append-only `UsageEvent`, so the data model
could support that; nothing exposes it.

**The wedge:** ChatDock is self-contained — crawl, embed, retrieve, answer, all
in-house. No second AI subscription. **The threat:** the money in this niche has
moved to voice, and ChatDock deliberately deferred it.

### Cold email channel maths

From a public case study (Koushik Bethu, *Operating System 4*), numbers
self-reported in a video that also sells his ebook — treat as one good campaign,
not a baseline:

- 5,332 emails → 2.4% reply (130) → 16 calls → 3 closed at $5,000/mo each
- ≈ **one customer per 1,777 emails**
- Tooling: Instantly + mailboxes + lead data ≈ **$210–300/month**

His pipeline auto-builds a personalised demo on reply using Voiceflow across
~15 steps. `/demo` does the same job from a URL in one. That is the reason step
4 exists.

*Caution:* his cold email claims the agent is already built when it is built
after the reply. The prospect noticed and said so. Do not copy that — it is the
fabrication pattern the landing-page rules in this repo explicitly forbid.

---

## Corrections log

Things previously written in this repo or asserted in planning that turned out
to be **false**. Recorded so nobody rebuilds on them.

| Claim | Reality | Found |
|---|---|---|
| "Dodo Payments is not configured" | All 6 product IDs, API key and webhook secret are set; monthly **and** yearly are coded | 2026-08-05 |
| `STATUS.md`: "32 models, 54 enums" | 32 models, **42** enums — corrected in the file | 2026-08-05 |
| "ChatDash adds ~$1,400 MRR/month" | Bad arithmetic (all-time ÷ months = average revenue, not growth). They are flat at ~$20k/mo | 2026-08-05 |
| `outreach-demo-funnel-plan.md` design | Written against the legacy `Domain` schema; `isDemo`/`demoToken` superseded by `workspaceType`/`shareToken` | earlier |
| `docs/database-architecture.md` | Describes the **legacy** 16-model schema. Historical only | earlier |

---

## Where to go deeper

| Document | For |
|---|---|
| [`ENGINEERING-HANDOFF.md`](ENGINEERING-HANDOFF.md) | Repo map, request lifecycles, data-model invariants, tenancy enforcement, env vars, gotchas |
| [`rebuild/STATUS.md`](rebuild/STATUS.md) | Phase tracker and backlog |
| [`rebuild/authorization-and-entitlements.md`](rebuild/authorization-and-entitlements.md) | Permission and entitlement matrices |
| [`rebuild/dashboard-redesign.md`](rebuild/dashboard-redesign.md) | Dashboard IA and rationale |
| [`homepage-redesign.md`](homepage-redesign.md) | Marketing site design direction |
| [`../PRODUCT-OWNER-QUESTIONS.md`](../PRODUCT-OWNER-QUESTIONS.md) | Product decisions with the owner's answers |
