# Rebuild status

Live tracker for the agency-first rebuild. Updated 2026-08-04.

## ⚠ Current state

**www.chatdock.io is DOWN.** The production database now holds the new schema;
the deployed application code still targets the old one. This downtime was
chosen deliberately (see §"Target DB" decision) and lasts until the backend port
lands in Phase 5.

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
| 3 | Authentication & permissions | 🟡 In progress — services built, Clerk wiring + tests outstanding |
| 4 | Knowledge & RAG | ⬜ Not started |
| 5 | Core product flows | ⬜ Not started |
| 6 | Billing & reporting | 🟡 Schema + entitlements done; Dodo webhooks outstanding |
| 7 | Prospect demos | 🟡 Schema seams done; flows outstanding |
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
| 7 | New Prisma schema | ✅ | `prisma/schema.prisma` — 32 models, 54 enums |
| 8 | Tracked pgvector SQL migration | ✅ | `prisma/migrations/20260804000100_pgvector_index_and_search/` |
| 9 | Complete migration baseline | ✅ | `20260804000000_init_agency_foundation` + `migration_lock.toml` |
| 10 | Seed script | ✅ | `prisma/seed-plans.mjs` (reference data) + `prisma/seed.mjs` (dev, guarded by `ALLOW_SEED=1`) |
| 11 | Permission matrix | ✅ | `docs/rebuild/authorization-and-entitlements.md` |
| 12 | Entitlement matrix | ✅ | same |
| 13 | API architecture | ⬜ | outstanding |
| 14 | Background-job architecture | ⬜ | outstanding |
| 15 | Provider-interface design | ⬜ | outstanding |
| 16 | Updated backend | ⬜ | **208 TS errors across ~14 legacy files** |
| 17 | Updated frontend | ⬜ | outstanding |
| 18 | Unit tests | ⬜ | outstanding |
| 19 | Integration tests | ⬜ | outstanding |
| 20 | Multi-tenant security tests | ✅ | `tests/security/tenant-isolation.test.ts` — **26/26 passing** |
| 21 | End-to-end tests | ⬜ | outstanding |
| 22 | Env-var documentation | ⬜ | outstanding |
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
| Plan limits scattered and drifting | Central entitlement service; `seed-plans.mjs` is the only definition |
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

## Next up

1. **Provider interfaces** — crawl / extract / embed / rerank, so Firecrawl can
   be swapped without touching product code.
2. **Backend port** — 208 TS errors across ~14 files; this is what brings the
   site back up.
3. **Rate limiting** on the public chat endpoint — must exist before production
   traffic returns.

## Phase 8 (frontend) — parked ideas

- **Orbs** — https://orbs.jakubantalik.com/ — raised by the owner 2026-08-04 for
  the dashboard redesign. ⚠ Use with care: the homepage design direction (§10)
  explicitly lists "glowing orbs" under *avoid*, and the rebuilt landing page
  deliberately removed them. If this is used it should be for something
  structural or illustrative, not decorative background blobs — otherwise it
  reintroduces exactly the "AI toy" read we just designed out.

## Known gaps to close before launch

- **No rate limiting** on the public chat endpoint. It is unauthenticated and
  calls a paid LLM per request — a live cost-attack surface.
- **Prompt injection**: crawled content must never be concatenated into system
  instructions. `Assistant.systemInstructions` is operator-authored and must stay
  structurally separate from retrieved chunks.
- **Supabase RLS** is not configured. Application-level scoping is in place, but
  defence in depth wants row-level policies too.
- **Dodo** products do not exist yet; `DODO_PRODUCT_ID_*` in Vercel are unverified.
