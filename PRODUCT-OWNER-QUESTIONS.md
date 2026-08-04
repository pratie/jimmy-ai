# Product owner questions — agency-first rebuild

Raised 2026-08-04 during the Phase 1 audit.

**How to use this:** every question has a **default** I will proceed with if you
say nothing. Answer the ones marked 🔴 before I cut over the schema — those
change the data model and are expensive to reverse once code depends on them.
Everything else can be changed later without a migration headache.

---

## ✅ Blockers — all resolved 2026-08-04

### B1. Database credentials — RESOLVED
Vercel CLI access provided (`prathapkr` → project `jimmy-ai` → www.chatdock.io).
118 production env vars pulled to `.env.local` (gitignored). Live database
reached: Supabase `pgmwdkbipsysitqnthnf`, us-east-2.

Phase 1 ran to completion against production, read-only:
- `.private/db-audit.json` — 17 tables, 923 rows, extensions, HNSW index, routines
- `.private/chatdock-email-backup.{csv,json}` — 31 records, 25 unique valid, 0 invalid
- `.private/schema-drift.json` — drift between `schema.prisma` and the live DB
- `.private/backup-2026-08-04T19-40-40-624Z/` — full logical backup, **verified**
  (17/17 tables, SHA-256 per file, live row counts re-matched, 0 problems)

### B2. Active paid subscriptions — RESOLVED
Two non-FREE rows found; **both confirmed by the product owner as his own**:

| Email | Plan | Provider | External subscription ID |
|---|---|---|---|
| karthik@bookmyplayground.com | STARTER | `dodo` | `sub_nL87XAF1tnWEAVVweay5f` |
| prathapsaik17@gmail.com | PRO | `null` | `null` (self-granted, never billed) |

**Owner's answer to Q15: Dodo Payments is not actually set up yet — it will be
configured later.** So the `dodo` row above is a test-mode artefact, not live
revenue, and there is no real billing relationship to protect.

⚠ Still true regardless: wiping the database does not touch the payment
provider. If `sub_nL87XAF1tnWEAVVweay5f` exists in any Dodo environment it keeps
its own lifecycle there. Clean it up provider-side when Dodo is configured
properly — that is a dashboard action, not a database one.

### B3. Go-ahead before destruction — SATISFIED
The brief authorises the wipe, a verified backup now exists, and the owner has
reaffirmed twice. Destructive steps proceed on a branch, with the verified
backup as the rollback path. No further gate.

---

## Product structure

| # | Question | Default if unanswered |
|---|---|---|
| 🔴 1 | Can one client have multiple websites? | **Yes** — `Website` is its own model. Schema supports it; UI shows one primary website initially. |
| 🔴 2 | Can one client have multiple active assistants? | **Yes** — `Assistant` hangs off `ClientWorkspace`, not `Website`. UI ships with one. |
| 3 | Should assistants be separated by use case (sales vs support)? | Not in v1. `Assistant.mode` already carries this; no separate model. |
| 🔴 4 | Should direct businesses (non-agency) remain supported? | **Yes** — `Organization.organizationType = direct_business`, auto-created single workspace, agency UI hidden. Dropping this later is easy; adding it later is not. |
| 5 | Should prospect demos expire automatically? | Yes — 30 days, `ClientWorkspace.expiresAt`. |
| 6 | Convert a demo to a live client without recreating it? | Yes — `workspaceType` flip + `convertedAt`, re-checking the workspace entitlement. |

## Team access

| # | Question | Default |
|---|---|---|
| 🔴 7 | Which agency roles for the first release? | Ship **owner / admin / member**. `manager`, `analyst`, `billing` exist in the enum but are unused — enum values are cheap now, expensive later. |
| 🔴 8 | Can clients log in during the first agency release? | **No.** `ClientWorkspaceMembership` and the client roles are in the schema so the door is open, but no client-facing login ships in v1. This matches what the homepage currently says. |
| 9 | Can clients edit knowledge, or only view reports and leads? | View only (`client_viewer` / `client_admin` distinction preserved for later). |
| 10 | Can agency members be restricted to selected clients? | Yes — that is what `ClientWorkspaceMembership` is for. Owners/admins get implicit access to all. |

## Billing

| # | Question | Default |
|---|---|---|
| 🔴 11 | Limit plans by clients, assistants, messages, or a combination? | **Combination**, via the central `Entitlement` service. Current live limits (workspaces + messages + KB size + sources) are preserved as entitlement keys so nothing changes for existing plans. |
| 🔴 12 | Explicit limits on crawl pages and file storage? | **Yes** — `monthly_crawl_pages` and `storage_bytes`. Today crawling is effectively uncapped, which is a direct cost-attack surface. |
| 13 | Should agencies see estimated AI cost per client? | Yes, internally — `UsageEvent.estimatedCost`. **Not** shown on client-facing reports. |
| 🔴 14 | Over-limit behaviour: hard block, or allow overage? | **Hard block**, matching today's behaviour, and stated on the pricing page. Overage billing would need a pricing decision and new Dodo products. |
| 15 | Are current Dodo subscriptions/customers active? | **ANSWERED: no.** Dodo is not set up yet; it will be configured later. Billing is therefore greenfield — `Subscription` / `Plan` / `PlanEntitlement` can be modelled correctly from the start with no legacy provider state to honour. The `DODO_PRODUCT_ID_*` env vars currently in Vercel should be treated as unverified until the real products exist. |

> **Please read #14 alongside a real defect:** message credits are currently
> pooled per *user*. When the pool empties, `/api/bot/stream` 429s **every** bot
> that user owns. So one busy client can silently take a whole roster offline.
> The rebuild attributes usage per workspace. Do you want per-client caps too, or
> just per-client *reporting* on a shared pool?

## Leads and bookings

| # | Question | Default |
|---|---|---|
| 🔴 16 | Is email required, or are phone-only leads supported? | **Phone-only supported.** Today `Customer` is uniquely keyed on `(email, domainId)`, which makes a phone-only lead impossible to store. For HVAC/roofing/plumbing that is the *common* case, so this is a real capture loss today. |
| 🔴 17 | Should the assistant confirm appointments, or only collect requests? | **Collect requests only.** `BookingRequest.status` starts at `requested`; `confirmed` requires a calendar integration or a human. Showing "confirmed" when nobody checked a calendar is a claim we cannot back. |
| 18 | Which calendar integration first? | Google Calendar. Not built in this phase. |
| 19 | Custom lead qualification fields per assistant? | Yes — `LeadFieldDefinition` / `LeadFieldValue`. |
| 20 | CSV export of leads? | Yes — and the FAQ currently says export does **not** exist, so shipping it means updating that copy. |

## White-labelling

| # | Question | Default |
|---|---|---|
| 21 | Which plans may hide ChatDock branding? | Pro & Business, unchanged (`white-label-form.tsx:176`). Now an entitlement key. |
| 22 | Is custom agency branding required in the first release? | Yes — fields already exist on `User` today and move to `Organization`. |
| 23 | Custom agency domain now or later? | **Later.** `Organization.customDomain` exists but is unenforced. Requires DNS + cert work. |
| 🔴 24 | Should client-facing emails come from ChatDock or from the agency? | **From ChatDock**, with the agency's name in the body. Sending as the agency needs per-org SPF/DKIM and is a real project. Affects mailer architecture. |

## Knowledge

| # | Question | Default |
|---|---|---|
| 25 | Which crawler is currently used? | Firecrawl (`src/lib/firecrawl.ts`) with a mock fallback. |
| 🔴 26 | Which replacement crawlers are available? | None assumed. The provider interface makes it swappable — but tell me if you already intend to move, since it affects `CrawlJob.configuration`. |
| 🔴 27 | Which file types must be supported initially? | PDF, DOCX, TXT, MD. Anything more (spreadsheets, images/OCR) changes the extraction provider. |
| 28 | Shared knowledge sources across assistants? | Yes — `AssistantKnowledgeSource` join table. |
| 🔴 29 | Should citations be visible in the **public** widget? | **Yes.** The homepage already shows a "From /services · /hours-location" citation as a trust feature. If you don't want them public, that copy has to change. |
| 30 | Is Jina reranking required or optional? | Optional — already falls back to vector order. Kept behind the provider interface. |

## Reporting

| # | Question | Default |
|---|---|---|
| 31 | Three most important client-facing metrics? | Conversations handled · qualified leads · appointment requests. Matches the homepage report section. |
| 32 | Downloadable monthly reports? | Yes, later phase. |
| 33 | Auto-emailed reports? | Later phase. |
| 🔴 34 | Display estimated opportunity value? | **Off by default**, only enabled when the agency enters a per-appointment value. Inventing a number would be a fabricated metric. |

## Data and legal

| # | Question | Default |
|---|---|---|
| 🔴 35 | Are any existing emails real prospective customers? | Unknown — needs B1. The export flags likely test data but **cannot** determine commercial intent. |
| 🔴 36 | Was consent collected for product-update emails? | **Assume no.** Nothing in the schema records consent. If no consent exists, emailing `Customer` / `Bookings` addresses — those are your *clients'* end customers, not yours — is a GDPR/CAN-SPAM problem. See the warning in the export summary. |
| 37 | Are conversation-retention controls required? | Assumed yes, later. Current plans imply 30-day history on Free. |
| 38 | Target countries with special privacy requirements? | Assuming EU + UK apply. Affects retention and data residency. |
| 🔴 39 | Any compliance claims currently on the site? | **No** — I removed/withheld all of them in the homepage rebuild because none were verified. Do not add any until legal review. |

## Future voice (design only — nothing built)

| # | Question | Default |
|---|---|---|
| 40 | First voice use case? | Assumed inbound website voice. Affects nothing structural yet. |
| 41 | Phone calling, or voice in the website only? | Website only assumed. Telephony needs `PhoneNumber` + `Call` models. |
| 42 | Preferred provider? | None chosen. No voice keys requested. |
| 43 | Shared config for web and voice, or separate channel settings? | **Separate**, via a future `AssistantChannel`. `Conversation.channel` and `AssistantDeployment.deploymentType` already carry the enum values so this needs no redesign. |

---

## Things I found that you did not ask about, but should decide

1. **Aggressive cascades.** Today deleting a `User` cascades away the entire
   business — domains, customers, conversations, everything. In an agency model
   that is data loss on a member offboarding. The rebuild uses `Restrict` +
   soft-delete on tenant roots. Confirm you want soft deletes.
2. **`Bookings.domainId` has no foreign key and no schema index.** It is a bare
   column. Any booking data there may already be orphaned.
3. **NextAuth tables (`Account`, `Session`, `VerificationToken`) are dead** —
   Clerk is the live provider. Dropping them, per your §"Remove unused NextAuth
   infrastructure".
4. **`/preview/[domainId]` is a public route exposing an internal primary key**
   ([`middleware.ts:12`](src/middleware.ts)). Anyone who learns a domain ID can
   open that agency's assistant. Replaced by opaque `AssistantDeployment.shareToken`.
5. **No rate limiting anywhere on `/api/bot/stream`.** It is public, unauthenticated
   and calls a paid LLM on every request. This is a live cost-attack surface today,
   independent of the rebuild.
