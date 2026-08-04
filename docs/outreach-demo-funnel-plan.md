# Implementation plan — outreach demo funnel (spec §7)

Scoped 2026-08-04 against the current codebase. This is the feature the rebuilt
homepage sells and the product cannot yet deliver: an agency generating a
brandable, shareable AI receptionist demo for a **prospect they have not signed
yet**, then converting it to a live client workspace when the deal closes.

---

## What exists today

| Piece | Reality |
|---|---|
| Public share URL | `/preview(.*)` is already public — [src/middleware.ts:12](../src/middleware.ts) |
| Preview page | [`/preview/[domainId]`](../src/app/(main)/preview/[domainId]/page.tsx) — but it's agency-facing ("Back to workspace", "Test {domain}"), `noindex`, and leaks the raw `domainId` |
| Test chat | `src/components/settings/chatbot-preview.tsx` → `useChatBot({ domainId })` |
| Chat backend | `/api/bot/stream` resolves by `domainId`, charges the **owner's** credits ([route.ts:120-200](../src/app/api/bot/stream/route.ts)) |
| Ingestion | `scrapeWebsite` + chunk/embed pipeline, already used by domain creation |
| Agency branding | `User.agencyName / agencyLogo / agencyColor / hideBranding` already on the model |
| Email | `src/actions/mailer` (nodemailer) |

**Nothing is temporary.** Every assistant is a permanent `Domain` row that
counts against `PLAN_LIMITS.domains`. That is the core blocker: an agency must
burn a paid workspace slot to demo to someone who hasn't paid them yet.

---

## Design decisions

### 1. A demo is a `Domain` with `isDemo = true`

Rejected: a separate `DemoAssistant` model. The chat pipeline, ingestion,
embedding, branding and conversation storage all key off `domainId`. A parallel
model would mean forking `/api/bot/stream`, the knowledge pipeline and the
settings surfaces. A flag reuses all of it and makes step 9 (convert to
workspace) a single `UPDATE`.

The cost of the flag approach is that **every place that counts or lists domains
must now exclude demos.** That is the main risk in this plan and the checklist
below is exhaustive on purpose.

```prisma
model Domain {
  // ...existing fields
  isDemo             Boolean   @default(false)
  demoToken          String?   @unique          // URL-safe, 32 bytes; the share link
  demoExpiresAt      DateTime?
  demoProspectName   String?                    // "Bright Smile Dental"
  demoSourceUrl      String?                    // what was crawled
  demoQuestions      String[]  @default([])     // the 3 suggested questions
  demoMessagesUsed   Int       @default(0)      // isolated from Billings — see §3
  demoOpenedAt       DateTime?                  // first open
  demoEvents         DemoEvent[]

  @@index([demoToken])
  @@index([userId, isDemo])
}

model DemoEvent {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  domainId    String   @db.Uuid
  type        DemoEventType
  anonymousId String?                          // dedupe repeat opens by same visitor
  createdAt   DateTime @default(now())
  Domain      Domain   @relation(fields: [domainId], references: [id], onDelete: Cascade)

  @@index([domainId, type])
}

enum DemoEventType {
  OPENED
  CONVERSATION_STARTED
  CTA_CLICKED
}
```

The share link is `/demo/[demoToken]`, **not** `/demo/[domainId]`. Today
`/preview/[domainId]` exposes an internal primary key on a public route; the new
surface should not repeat that. A random token is also revocable.

### 2. Demos never consume a plan workspace slot

This is the whole point of the feature. `Domain.isDemo = true` rows must be
excluded from every workspace count, and bounded by their own separate quota so
the escape hatch isn't an abuse vector:

| Plan | Live workspaces (unchanged) | Concurrent active demos |
|---|---|---|
| Free | 1 | 3 |
| Starter | 1 | 5 |
| Pro | 5 | 15 |
| Business | ∞ | 50 |

Add `demoLimit` to `PLAN_LIMITS` in `src/lib/plans.ts` so it stays the single
source of truth the pricing page already reads from.

### 3. Demo messages must NOT draw from the agency's credit pool

**This is the most important safety decision in the plan.** If a prospect's demo
conversation spends `Billings.messageCredits`, then a stranger clicking a link
can exhaust a Free plan's 100 credits and **take every live client bot offline**
— `/api/bot/stream:185` returns 429 for all of that user's domains once the pool
is empty. That turns a sales tool into an outage.

Instead: each demo gets a fixed, isolated allowance (`demoMessagesUsed`, cap
~50). When exhausted, only that demo stops, with prospect-appropriate copy
("this preview has reached its limit — {agency} can set up the full version").
`Billings` is never touched.

### 4. Conversion is a flag flip, not a rebuild

Closing the deal = `isDemo → false`, demo fields nulled, `demoToken` revoked.
Knowledge chunks, embeddings, branding, and the demo conversation history all
carry over untouched. **Must re-check `limits.domains` at conversion time** and
refuse with an upgrade prompt if the agency is at their cap — the check that was
skipped at creation happens here instead.

### 5. Expiry is lazy, not scheduled

There is no cron or job runner in this codebase. `demoExpiresAt` defaults to
+30 days and is checked on read in the share route. A cleanup job can come later;
an expired demo simply refuses to render and offers the agency's contact details.

---

## Build order

Each phase is independently shippable and leaves the app working.

### Phase A — model + the counting invariant (no UI)
1. Migration for the schema above. `isDemo` defaults to `false`, so every
   existing `Domain` is unaffected.
2. Add `demoLimit` to `PLAN_LIMITS`.
3. **Exclude demos from every count and list.** Replace the `_count` relation
   reads with explicit `client.domain.count({ where: { userId, isDemo: false } })`:
   - [`onIntegrateDomain`](../src/actions/settings/index.ts) lines 16–20 and 42 — *gates workspace creation; wrong here means demos silently eat paid slots*
   - [`src/actions/dashboard/index.ts`](../src/actions/dashboard/index.ts) lines 117–136 — plan-usage display
   - `onGetAllAccountDomains` — sidebar, dashboard, conversation inbox, and settings all read it
   - [`src/actions/auth/index.ts`](../src/actions/auth/index.ts) lines ~109, 206, 228 — post-sign-in routing keys off "does this user have domains"; a user holding only demos must still be treated as un-onboarded
4. Regression test: create a demo on a Free plan, confirm the agency can still
   create their 1 live workspace afterwards.

> Ship Phase A on its own and verify the counts before building any UI. Every
> later phase assumes this invariant holds.

### Phase B — create a demo (steps 1–2, 4–5)
- `onCreateProspectDemo(url, prospectName?)` — reuses the existing scrape +
  chunk + embed path, sets `isDemo`, mints `demoToken`, sets `demoExpiresAt`,
  enforces `demoLimit`.
- Auto-suggest three questions per detected vertical, seeded from the same
  copy already written in [`industry-tabs.tsx`](../src/components/landing/industry-tabs.tsx)
  (dental / med spa / HVAC / legal / fitness / home services). Agency can edit.
- Branding form: prospect logo + colour, reusing the existing appearance controls.
- A **Demos** area in the dashboard, listed separately from client workspaces so
  the two are never confused.

### Phase C — the prospect-facing share page (steps 6–7)
- New public route `/demo/[token]` (add `'/demo(.*)'` to `isPublicRoute`),
  `robots: noindex`.
- Copy is fixed by the spec:
  - **“We created an AI receptionist for {prospectName}.”**
  - “It has already learned about your services, opening hours and common
    customer questions. Try asking it something a prospective patient would ask.”
  - Three suggested-question chips
  - **“Add this to my website”**
- Branded as the **agency**, using `User.agencyName / agencyLogo / agencyColor`.
  Respect `hideBranding` (Pro & Business) for the ChatDock badge, consistent with
  how the widget already behaves.
- `/api/bot/stream` gains a demo branch: resolve by token, charge
  `demoMessagesUsed` instead of `Billings`, refuse past `demoExpiresAt`.

### Phase D — engagement + conversion (steps 8–9)
- Record `OPENED` / `CONVERSATION_STARTED` / `CTA_CLICKED` into `DemoEvent`,
  deduped by `anonymousId` (the pattern `ChatRoom.anonymousId` already uses).
- Demo card shows "Opened 3× · 7 messages · CTA clicked 2h ago".
- **“Add this to my website” notifies the agency** (via `src/actions/mailer`) and
  shows the prospect the agency's name — it must never route the prospect to a
  ChatDock signup. The agency owns that relationship; breaking that would make
  the product actively unsafe to use for outreach.
- `onConvertDemoToWorkspace(domainId)` — the flag flip from §4, with the
  workspace-limit re-check.

### Phase E — landing page catches up
Only once C and D are live:
- Remove the "not built" disclaimers from
  [`capabilities.tsx`](../src/components/landing/capabilities.tsx) and the
  shareable-link line in [`faq.ts`](../src/constants/faq.ts).
- Add a section showing the outreach flow, and wire `shared_demo_created`,
  `shared_demo_opened`, `prospect_cta_clicked` into
  [`src/lib/analytics.ts`](../src/lib/analytics.ts) (already specified in
  `docs/homepage-redesign.md`, deliberately unimplemented).

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| A demo count leaks into the workspace limit and gives away paid slots — or blocks a paying agency | **High** | Phase A ships and is verified alone; the four call sites above are enumerated |
| Prospect drains the agency's message credits and takes live client bots offline | **High** | §3 — isolated `demoMessagesUsed`, `Billings` untouched |
| Unbounded demo creation → Firecrawl and LLM cost abuse | Medium | `demoLimit` per plan + 30-day expiry + per-demo message cap |
| Share token guessable, or demos indexed by search engines | Medium | 32-byte random token (not `domainId`), `noindex`, lazy expiry check |
| Prospect converts with ChatDock directly, cutting out the agency | **High — product-trust issue** | The prospect CTA only ever notifies the agency; no ChatDock signup path on the share page |
| Demo conversations pollute the client-facing inbox and reporting | Medium | Filter `isDemo` out of conversation and dashboard queries, or badge them distinctly |

## Effort

Phase A is small but must be exactly right. B and C are the bulk. D is
straightforward once the model exists.

**Recommended first slice:** Phase A + B + C — that alone delivers a sendable,
branded prospect demo, which is the job the homepage promises. D and E can follow.
