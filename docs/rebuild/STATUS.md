# Rebuild status

Live tracker for the agency-first rebuild. Updated 2026-08-05.

> Several rows in this file were corrected on 2026-08-05 after being checked
> against the code — the widget resolver, `api/bot/stream`, `actions/bot` and
> rate limiting were all marked outstanding while already shipped. If a claim
> here disagrees with [`../START-HERE.md`](../START-HERE.md), that file wins.

## Current state

**The backend port is complete.** 209 → 0 type errors, `npx next build`
compiles, 30/30 pages generate, and both security suites pass — 26 tenant
isolation + 7 publish gate.

**The publish path shipped 2026-08-05**, which was the last thing standing
between an installed widget and a working one. An agency can now take a client
live and take them offline again.

**Prospect demos shipped the same day** (Phase 7): an agency builds a demo from
a prospect's URL, sends `/d/<shareToken>`, sees whether it was opened, and
converts it into a client without rebuilding anything.

**2026-08-06 — lead alerts, an onboarding fix, and one problem that outranks
both.** New-lead and booking-request emails go out through Resend
(`src/lib/notifications/lead-alert.ts`, domain `mail.chatdock.io`). First-client
setup no longer hangs: Server Actions inherit `maxDuration` from their page and
none was set, so Vercel killed the function at 10–15s without a response.

The problem to fix next is not in the code: **the database answers `SELECT 1` in
~1.3 seconds**, which is why a one-page ingest takes 49s and why the test suite
cannot finish. Details in [`../BACKLOG.md`](../BACKLOG.md) step 0 and
[`../ENGINEERING-HANDOFF.md`](../ENGINEERING-HANDOFF.md) §7b.

⚠ The security suites were **last fully green on 2026-08-05** (46/46). Since
then they fail on connection drops, not assertions; `publish-gate` (7/7) still
passes in isolation. Do not read a red run here as a regression without
checking query latency first.

Verified live against the dev server on the rebuilt production database:

| Check | Result |
|---|---|
| Public chat, valid key + allowed origin | ✅ streams a grounded-format reply |
| Conversation / message persistence | ✅ 2 messages, correct roles, model recorded |
| Usage attribution | ✅ `assistant_message` against org + workspace + assistant |
| Unknown or revoked key | ✅ 404 `unknown_deployment` (indistinguishable, by design) |
| Disallowed origin | ✅ 403 `origin_not_allowed` |
| Rate limit | ✅ 20/min then 429, bucketed per visitor |

The widget contract has landed: `public/embed.min.js` now sends `data-key`
(an `AssistantDeployment.publicKey`), the settings panel issues and rotates one,
and the marketing site's self-embed is env-driven.

**Ready to deploy, with three caveats:**

1. Every pre-existing embed on a client site is dead regardless of this change —
   the ids they carried referenced rows the rebuild removed. Each live client
   needs the new snippet copied from Settings → Code snippet.
2. `NEXT_PUBLIC_CHATDOCK_WIDGET_KEY` must be set in Vercel or the marketing site
   renders no widget of its own (deliberate — better than a broken one).
3. Vercel already sets `GOOGLE_GENERATIVE_AI_API_KEY`; the code now reads it.
   No action needed, but it is what fixed the default chat model.

Rollback path if production must be restored:
1. `docs/rebuild/legacy-sql/schema.legacy.prisma` → `prisma/schema.prisma`
2. Reload `.private/backup-2026-08-04T19-40-40-624Z/` (verified, 17 tables, 923 rows)
3. `npx prisma generate`

---

## Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Audit & preservation | ✅ **Complete** |
| 2 | New database foundation | ✅ **Complete** |
| 3 | Authentication & permissions | ✅ **Complete** — Clerk→tenant provisioning, permission service, 26 isolation tests |
| 4 | Knowledge & RAG | ✅ **Complete** — crawl/index jobs, provider seams, tenant-scoped retrieval, citations |
| 5 | Core product flows | ✅ **Complete** — onboarding, client creation, assistant, widget, conversations, leads, bookings |
| 6 | Billing & reporting | 🟡 Subscriptions, entitlements, usage and idempotent webhooks done; agency/client reporting outstanding |
| 7 | Prospect demos | ✅ **Complete** — create/share/expire/revoke/convert, engagement events, prospect page at `/d/[token]`, 13 tests (2026-08-05) |
| 8 | Frontend redesign | ⬜ Not started |
| 9 | Reliability & launch | ⬜ Not started |

## Deliverables (§32)

| # | Deliverable | Status | Where |
|---|---|---|---|
| 1 | Current architecture audit | ✅ | `docs/database-architecture.md` |
| 2 | Email export files | ✅ | `.private/chatdock-email-backup.{csv,json}` |
| 3 | Email export summary | ✅ | `.private/chatdock-email-summary.json` |
| 4 | Database backup instructions | 🟡 | scripts done; prose doc outstanding |
| 5 | Product-owner questions | ✅ | `PRODUCT-OWNER-QUESTIONS.md` |
| 6 | New ERD | ⬜ | outstanding |
| 7 | New Prisma schema | ✅ | `prisma/schema.prisma` — 32 models, 42 enums |
| 8 | Tracked pgvector SQL migration | ✅ | `prisma/migrations/20260804000100_pgvector_index_and_search/` |
| 9 | Complete migration baseline | ✅ | `20260804000000_init_agency_foundation` + `migration_lock.toml` |
| 10 | Seed script | ✅ | `prisma/seed-plans.mjs` (reference data) + `prisma/seed.mjs` (dev, guarded by `ALLOW_SEED=1`) |
| 11 | Permission matrix | ✅ | `docs/rebuild/authorization-and-entitlements.md` |
| 12 | Entitlement matrix | ✅ | same |
| 13 | API architecture | ⬜ | outstanding |
| 14 | Background-job architecture | ⬜ | outstanding |
| 15 | Provider-interface design | ⬜ | outstanding |
| 16 | Updated backend | ✅ | 0 type errors; build compiles; verified live end to end |
| 17 | Updated frontend | ⬜ | outstanding |
| 18 | Unit tests | ⬜ | outstanding |
| 19 | Integration tests | ⬜ | outstanding |
| 20 | Multi-tenant security tests | ✅ | `tests/security/tenant-isolation.test.ts` — **26/26 passing** |
| 21 | End-to-end tests | ⬜ | outstanding |
| 22 | Env-var documentation | 🟡 | `.env.example` updated; prose guide outstanding |
| 23 | Deployment guide | 🟡 | `build` now runs `migrate deploy`; prose outstanding |
| 24 | Security review | ⬜ | outstanding |
| 25 | Voice-readiness document | ⬜ | outstanding (seams are in the schema) |
| 26 | Remaining backlog | 🟡 | this file |
| 27 | Final launch checklist | ⬜ | outstanding |

## What Phase 1 actually found

- 17 tables, **923 rows** total — 19 users, 10 domains, 413 messages, 378 chunks.
- **31 email records**, 25 unique valid, 0 invalid. 19 agency accounts;
  12 third-party (leads/bookings) that must **not** receive product email.
- 2 non-FREE plans, both the owner's own. **Dodo is not actually configured**
  (owner's answer to Q15), so billing is greenfield.
- **Schema drift:** `User.agencyName/agencyLogo/agencyColor/agencyDomain/hideBranding`
  were declared in `schema.prisma` but had never been applied to production —
  white-labelling was broken in prod. `Billings.credits` existed in the DB but
  not the schema.

## Fixes already landed

| Old problem | Fix |
|---|---|
| Manual SQL pasted into the Supabase editor | Tracked Prisma migrations, `migration_lock.toml`, `build` runs `migrate deploy` |
| `match_knowledge_chunks` searched the whole corpus | `match_knowledge_chunks_scoped` — tenant id is a required first argument, applied in-query, `SECURITY INVOKER` |
| `User` was both person and tenant | `User` / `Organization` / `OrganizationMembership` |
| `Domain` was both website and client | `ClientWorkspace` / `Website` / `Assistant` / `AssistantDeployment` |
| One chatbot per domain | Many assistants per workspace, many deployments per assistant |
| `ChatRoom.live` ambiguous boolean | `Conversation.handoffStatus` enum (6 states) |
| `Customer @@unique([email, domainId])` blocked phone-only leads | `Lead` with no email uniqueness; dedupe is an application decision |
| `FilterQuestions.answered` overwritten per visitor | `LeadFieldDefinition` (reusable) + `LeadFieldValue` (per lead) |
| Bookings shown as confirmed when only a time was collected | `BookingRequest.status` starts at `requested` |
| Plan limits scattered and drifting | Central entitlement service enforces `PlanEntitlement` (⚠ `src/lib/plans.ts` still feeds the marketing page — see gaps) |
| Usage pooled per user, unattributable | Append-only `UsageEvent` with org + workspace + assistant |
| Credits reset 30 days after last activity | Provider period boundaries from `Subscription` |
| Webhooks could double-process | `BillingEvent(provider, externalEventId)` unique |
| Cascade from `User` deleted an entire business | `SetNull` on authorship, soft deletes on tenant roots |
| NextAuth tables unused alongside Clerk | Dropped |
| `/preview/[domainId]` leaked an internal PK publicly | `AssistantDeployment.publicKey` / `shareToken`, revocable |

## Security suite (deliverable 20)

`npm test` — 26 tests, all passing. Runs against real Postgres; mocking would
prove nothing, since isolation is enforced in SQL.

| Group | Proves |
|---|---|
| Org A ↛ Org B | no actor context cross-org; a valid foreign workspace id does not resolve; forged `organizationId` denied; listings never leak |
| Client A1 ↛ A2 | scoped member reaches only assigned workspaces; owners keep implicit access |
| Client users ↛ billing | client user has no org membership; `billing` role cannot read leads/conversations; `analyst` can read but not export; workspace role cannot escalate past org role |
| Vector isolation | scoped search never returns another tenant's chunks; assistant source selection honoured; disabling a source removes it; legacy unscoped function gone |
| Entitlements | usage attributed per org; no-subscription falls back to FREE not unlimited; prospect demos excluded from workspace count; `recordUsage` idempotent |
| Data reads | lead queries scoped; scoped member's export limited to assigned workspace |

**Non-vacuity is asserted in the suite itself.** A1 and B1 hold byte-identical
chunk text, so their embeddings — and distances — are identical to within 1e-6.
One test proves an *unscoped* query returns both; the rest prove the scoped
function returns one. Without that guard the isolation tests could pass for the
wrong reason, and nobody would know.

> ⏱ The suite takes ~150s because every query is a network round trip to remote
> Supabase. Moving to a local Postgres for tests would cut this to seconds and is
> worth doing before the suite grows.

## Backend port — in progress

**209 → 125 type errors.** The build still does not compile and the site is
still down.

| Area | Status |
|---|---|
| `lib/tenant.ts` — Clerk → org → workspace resolution | ✅ |
| `lib/knowledge/ingest.ts` — source/document/chunk lifecycle + jobs | ✅ |
| `lib/widget/resolve.ts` — public widget auth + rate limit | ✅ built **and wired** — `api/bot/stream` calls it on every request (corrected 2026-08-05) |
| `lib/vector-search.ts` — tenant-scoped retrieval | ✅ |
| actions: auth, settings, dashboard, conversation, appointment, firecrawl | ✅ |
| assistant publish / pause (`onSetAssistantStatus`) | ✅ shipped 2026-08-05, 7 tests |
| `api/bot/stream` route (17) | ✅ resolve → session → retrieve → stream → persist (corrected 2026-08-05) |
| `actions/bot` (17) | ✅ `src/actions/bot/index.ts` exists |
| `hooks/firecrawl/use-scrape` (29) | ⬜ consumes old return shapes |
| Dodo billing + webhook + payments (21) | ⬜ |
| `actions/mail` (9) | ⬜ |
| dashboard pages + UI wiring (~30) | ⬜ |

### Remaining known risks

- **The rate limiter is process-local.** It stops casual abuse of the public
  chat endpoint, not a distributed attack. Move to Redis or an edge limiter
  before real traffic returns.
- ~~**The widget still sends a raw id.**~~ Closed — `public/embed.min.js` sends
  `data-key` (an `AssistantDeployment.publicKey`), as the top of this file
  already records. Corrected 2026-08-05.
- **Prompt injection** — `formatResultsForPrompt` now fences retrieved content
  and labels it untrusted, but callers must keep it in a user/context message.
  Never concatenate it into `Assistant.systemInstructions`.
- **Supabase RLS** is still unconfigured. Application-level scoping is proven by
  the test suite; row-level policies would be defence in depth.

## Phase 8 (frontend) — parked ideas

- **Orbs** — https://orbs.jakubantalik.com/ — raised by the owner 2026-08-04 for
  the dashboard redesign. ⚠ Use with care: the homepage design direction (§10)
  explicitly lists "glowing orbs" under *avoid*, and the rebuilt landing page
  deliberately removed them. If this is used it should be for something
  structural or illustrative, not decorative background blobs — otherwise it
  reintroduces exactly the "AI toy" read we just designed out.

## Known gaps to close before launch

- **Two sources of truth for plan limits.** `PlanEntitlement` (enforced) and
  `src/lib/plans.ts` (advertised, read by 9 files incl. the pricing page and
  margin calculator). Verified identical on 2026-08-05, but nothing keeps them
  that way — the first divergence makes the pricing page lie. Fix: have the
  pricing page read plans server-side from the database, then delete
  `plans.ts`.
- **No conversation-retention enforcement.** `conversationHistoryDays` existed
  only in `plans.ts` and nothing ever pruned history, so the pricing page was
  advertising a 30-day Free limit that did not exist. The claim has been
  removed. If retention is wanted, it needs a real entitlement key plus a
  pruning job — see Q37 in PRODUCT-OWNER-QUESTIONS.md.

- ~~**No rate limiting** on the public chat endpoint.~~ Corrected 2026-08-05:
  `checkRateLimit` runs in `api/bot/stream` before any database or model call,
  at 20 requests / 60s per `key:anonymousId`. The **real** remaining risk is
  that the bucket is a module-level `Map` — process-local, so it does not hold
  across serverless instances (see the first bullet above).
- **Prompt injection**: crawled content must never be concatenated into system
  instructions. `Assistant.systemInstructions` is operator-authored and must stay
  structurally separate from retrieved chunks.
- **Supabase RLS** is not configured. Application-level scoping is in place, but
  defence in depth wants row-level policies too.
- **Dodo** products do not exist yet; `DODO_PRODUCT_ID_*` in Vercel are unverified.
