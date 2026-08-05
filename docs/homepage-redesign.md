# ChatDock homepage redesign — audit, positioning and plan

Companion document to the implementation in `src/app/(main)/page.tsx` and
`src/components/landing/*`. Written 2026-08-04.

---

## 1. Audit of the previous homepage

The page that existed before this pass was well-built and already agency-aware —
it was not a generic AI landing page. These were the gaps that cost conversions.

| # | Finding | Why it mattered |
|---|---|---|
| 1 | **Headline sold the feature, not the business.** “Give every client's website a receptionist that never sleeps” describes what the visitor's *client* gets. It never says the agency gets a new billable service. | The ICP buys revenue, not a widget. JTBD 6 was invisible above the fold. |
| 2 | **The sandbox's example sites were Stripe, Notion and Airbnb.** | Perfect demo material, zero resemblance to a local-business client roster. An agency owner sees Stripe and concludes “not built for my clients.” |
| 3 | **No revenue or margin argument anywhere.** | JTBD 6 had no section at all. The strongest reason to buy was missing. |
| 4 | **No prospect-demo narrative.** The primary CTA was “Build your first assistant free.” | JTBD 1 — make a demo for a sales call — is the highest-intent job and was unnamed. |
| 5 | **Client reporting was one small panel** with three counters. | JTBD 5 (prove monthly value) is the retention argument and got the least space. |
| 6 | **The grounding objection was answered by assertion**, in a feature bullet and an FAQ. | “Will it lie to my client's customers” is the #1 blocker for this ICP. Assertion does not clear it; demonstration does. |
| 7 | **No industry-specific proof.** A marquee of vertical names, but no example of what the assistant actually *says* to an HVAC caller. | Agencies need to picture the conversation on *their* client's site. |
| 8 | **Pricing hid the limits that matter** — no message-limit behaviour, no branding-removal tier, no annual option surfaced. | Undisclosed limits found post-signup are a churn and trust cost. |
| 9 | **Hero visual was a scripted chat loop only.** | It showed the end state, not the workflow. The agency never saw ingestion, branding or the dashboard. |
| 10 | **Purple gradients, glow orbs, blurred glass panels.** | Reads as “AI toy”, not “platform I show a dental practice.” |
| 11 | **No analytics on the funnel.** DataFast was loaded but no landing events were emitted. | No way to run the A/B tests in §17 or find where the funnel leaks. |
| 12 | **Nav CTA was “Start free”**, the generic SaaS default. | Wastes the most-clicked element on the page. |

**What was already right and was kept:** the live no-signup sandbox (the single
best asset on the site), plan data sourced from `src/lib/plans.ts`, the CSS
reveal motion system, the honest “no fabricated social proof” stance.

---

## 2. Positioning statement

> For small web, SEO and lead-generation agencies that already manage websites
> for local service businesses, ChatDock is the platform that turns any client
> website into a branded AI receptionist — one that answers from the client's
> approved content, qualifies visitors and books appointments. Unlike custom AI
> builds or general-purpose chatbot tools, ChatDock is designed to be *resold*:
> every client gets an isolated workspace, the agency runs the whole roster from
> one dashboard, and each month produces the conversation, lead and appointment
> evidence that renews a retainer.

**Category wedge:** ChatDash helps agencies deliver *voice* agents. ChatDock is
the easiest way to turn client *websites* into lead-generating AI receptionists.
No voice, no call centre, no general automation on this page.

## 3. One-sentence value proposition

> Turn every client website into an AI receptionist you can brand, launch in an
> afternoon, and bill for every month.

---

## 4. Information architecture

Navigation (6 links, mapped to the buying questions in order):
`Product · How it works · For agencies · Pricing · Demo · Resources`
Right side: `Sign in` + dominant `Build a client demo`.

Page order, and the job each section serves:

| # | Section | Anchor | JTBD |
|---|---|---|---|
| 1 | Navigation | — | — |
| 2 | Hero + animated ingestion→booking pipeline | `#main-content` | 1, 3 |
| 3 | Live sandbox + product-driven credibility | `#demo` | 1 |
| 4 | Agency problem | — | 3, 5, 6 |
| 5 | How it works (4 steps, real UI) | `#how-it-works` | 2 |
| 6 | Productised service (4 layers) | — | 4, 6 |
| 7 | Monthly client report | `#results` | 5 |
| 8 | Margin calculator | `#for-agencies` | 6 |
| 9 | Before / after stack | — | 2, 4 |
| 10 | Capabilities by outcome | `#product` | 2, 3, 4, 5 |
| 11 | Grounded answers | `#trust` | 3 |
| 12 | Industry examples | `#industries` | 1, 3 |
| 13 | Pricing | `#pricing` | 6 |
| 14 | Objection FAQ | `#faq` | all |
| 15 | Closing CTA | — | 1 |

---

## 5. Deviations from the brief — and why

Three places where following the spec literally would have meant shipping a lie
or a dead link. Each is flagged rather than silently changed.

| Spec said | Shipped | Reason |
|---|---|---|
| Secondary CTA: “Watch the 90-second product tour” | “Try it on a real website” → `#demo` | **No product tour video exists.** Linking to one would be a dead promise. The live sandbox is a stronger secondary anyway — it converts, a video does not. Restore the spec wording the day the video ships. |
| Palette accent `#16A67A` (green) | Green reserved for *outcomes* only (leads, bookings, live status); ChatDock indigo `#5B5CE2` demoted to interactive accent | The spec's own escape hatch: “use the existing ChatDock brand colours when already established.” Indigo is in the shipped widget and dashboard; replacing it wholesale would desync the marketing site from the product. Neutrals, dark `#0E1726` and white now carry the page, so the purple-AI read is gone without breaking brand continuity. |
| Estimated opportunity value in the client report | Shown as *off by default*, with a note to enable only once the client states a value | Inventing a dollar value per appointment is exactly the fabricated-metric problem §14 forbids. |

---

## 6. Features: current vs proposed

Verified against the codebase, not assumed.

### Live today — safe to advertise
| Feature | Evidence |
|---|---|
| Website ingestion (Firecrawl + fallback) | `src/lib/firecrawl.ts`, `src/actions/landing/index.ts` |
| Document upload / knowledge base | `src/components/upload-button`, `settings/[domain]` |
| Private test chat before publish | `src/components/settings/chatbot-preview.tsx` |
| One-line embed snippet | `public/embed.min.js`, `src/app/chatbot` |
| Per-client workspaces (isolated knowledge) | `domain/[domainId]`, `PLAN_LIMITS.domains` |
| Branding: logo, colours, greeting, tone | `settings/[domain]` |
| Remove “Powered by” badge (Pro & Business) | `src/components/settings/white-label-form.tsx:176` |
| Lead capture + custom qualifying questions | `src/actions/bot`, conversation flow |
| Appointment booking | `(dashboard)/appointment`, `portal/[domainid]/appointment` |
| Conversation inbox across clients | `(dashboard)/conversation` |
| **Human takeover of a live chat** | `src/components/chatbot/real-time.tsx`, `conversations/messenger.tsx` |
| Funnel / analytics charts | `src/components/dashboard/analytics-charts.tsx` |
| Message-limit enforcement, no overage | `src/app/api/bot/stream/route.ts:185` |

### Not built — deliberately **not** advertised anywhere on the page
| Claimed by no one | Status | Where it's honestly disclosed |
|---|---|---|
| Shareable prospect demo links | Roadmap P2 | Capabilities footnote |
| Prospect engagement tracking | Roadmap P2 | — |
| Convert demo → client workspace | Roadmap P2 | — |
| Client-facing login / portal | Roadmap P3 (`/portal/[domainid]` is a *customer booking* page, not an agency client portal) | FAQ “Can my client log in” |
| CSV / API export of leads & conversations | Roadmap P3 | FAQ “Can I export” + Capabilities footnote |
| Custom domains, Stripe billing, per-client usage | Roadmap P4 | — |
| Any compliance / encryption / GDPR / HIPAA claim | Unverified | **No claim made anywhere** |

---

## 7. Analytics event definitions

Implemented in `src/lib/analytics.ts`. Provider-agnostic: forwards to DataFast
(currently loaded), PostHog, or GA4/GTM if present; no-ops otherwise.

| Event | Props | Fired from |
|---|---|---|
| `homepage_viewed` | — | reserved |
| `cta_clicked` | `location`, `label` | navbar, sticky CTA, calculator |
| `demo_url_submitted` | `source`: `input` \| `example` | sandbox |
| `demo_generated` | `grounded`: bool (false = partial scrape fallback) | sandbox |
| `demo_failed` | `reason`: `no_content` \| `exception` \| `unknown` | sandbox |
| `demo_conversation_started` | — | sandbox, first visitor turn |
| `demo_suggested_question_clicked` | `question` | sandbox |
| `margin_calculator_used` | `clients`, `price`, `plan` | calculator (debounced 600ms) |
| `pricing_viewed` | — | pricing, on first intersection |
| `plan_selected` | `plan` | every plan CTA |
| `industry_tab_viewed` | `industry` | industry tabs |
| `walkthrough_booked` | `location` | cal.com links |

**Primary funnel:**
`homepage_viewed → demo_url_submitted → demo_generated → demo_conversation_started → plan_selected → paid workspace`

**Segment by:** traffic source, client industry selected (`industry_tab_viewed`),
device, demo website type (`grounded` true/false), landing variant.

**Not yet wired:** `homepage_viewed` and signup start/complete. Signup events
belong in the Clerk flow, which is outside this pass's scope.

---

## 8. SEO plan

**Implemented now**
- One `<h1>`, 13 semantic `<h2>`s, no heading skips.
- Unique page title + description targeting *“AI receptionists agencies can sell”*.
- `FAQPage` JSON-LD generated from `src/constants/faq.ts` — same source as the
  rendered answers, so schema can never disagree with the page.
- `Organization` + `SoftwareApplication` JSON-LD already in the root layout.
- All section copy is server-rendered; only interaction is client-side.

**Recommended pages (not built in this pass)**

| Path | Target intent |
|---|---|
| `/ai-chatbot-platform-for-agencies` | category head term |
| `/white-label-ai-chatbot-for-agencies` | white-label buyers |
| `/ai-receptionist-for-local-businesses` | end-client framing |
| `/ai-chatbot-for-dental-websites` | vertical |
| `/ai-chatbot-for-med-spas` | vertical |
| `/ai-chatbot-for-hvac-businesses` | vertical |
| `/ai-chatbot-for-law-firms` | vertical |
| `/ai-lead-capture-chatbot` | outcome |
| `/website-chatbot-for-appointment-booking` | outcome |
| `/vs/custom-chatbot-stack` | build-vs-buy |
| `/vs/chatdash` | category clarification — **only** an honest one: ChatDock is website-text receptionists and lead capture; ChatDash is broader voice-AI delivery, dashboards, workflows and billing; the right choice depends on the agency's service model |

Each vertical page needs unique metadata and its own FAQ schema. Do not
duplicate the homepage FAQ across them.

---

## 9. Outreach demo examples

Scripts for the three highest-volume verticals. Sections 12's tabs implement
these; reuse the same wording in the shareable-demo feature when it ships.

### Dental — Bright Smile Dental
- **Share heading:** “We created an AI receptionist for Bright Smile Dental.”
- **Suggested questions:** Do you accept new patients? · Are you open on Saturdays? · How can I book a whitening consultation?
- **Qualifiers:** new or existing patient · which treatment · name and best number
- **Goal:** book a whitening consultation

### HVAC — Cardinal Heating & Air
- **Visitor:** “My AC stopped cooling. Can someone come today?”
- **Behaviour:** confirms the service area before promising anything · asks whether the system is completely down · guides toward emergency scheduling
- **Qualifiers:** postcode · is the unit completely down · name and phone
- **Goal:** same-day emergency dispatch

### Law — Vance & Reed Law
- **Visitor:** “I was rear-ended last week. Do I have a case?”
- **Behaviour:** explicitly declines to assess the case · states the free-consultation policy from the site · collects structured intake
- **Qualifiers:** type of matter · when it happened · name and best number
- **Goal:** schedule an attorney consultation
- **Constraint:** never gives legal advice or predicts an outcome.

The prospect-facing CTA on a shared demo must be **“Add this to my website”**,
and it must notify the agency that created the demo — never route the prospect
to ChatDock directly.

---

## 10. Roadmap (by sales impact)

**Phase 1 — conversion foundation** *(this pass)*
- [x] Rewrite the homepage against the ICP and JTBD
- [x] No-signup demo prominent, ICP-matched examples, real failure copy
- [x] Replace empty/zero dashboard metrics with labelled demonstration data
- [x] Pricing presentation with every limit disclosed
- [x] Funnel analytics events
- [ ] `homepage_viewed` + signup start/complete events (Clerk flow)
- [ ] Real product screenshots to replace the UI reproductions

**Phase 2 — agency sales tools** *(highest priority next; directly serves JTBD 1)*
Shareable prospect demo links · demo branding · suggested industry questions ·
prospect engagement notifications · convert demo → client workspace ·
agency-specific onboarding.

**Phase 3 — client retention tools**
Shareable monthly reports · lead & appointment funnels · unanswered-question
reports · client portal · team members and permissions · scheduled monthly email
summaries.

**Phase 4 — monetisation infrastructure**
Custom domains · deeper white-labelling · Stripe billing · per-client usage
tracking · agency-configured plans and markups · automated overages.

**Phase 5 — integrations and expansion**
CRM · calendar · Zapier/Make/n8n · webhooks · API · **voice only after the
website-assistant wedge produces consistent demand.** Do not chase voice because
ChatDash offers it.

---

## 11. QA checklist

**Verified in this pass**
- [x] `npx tsc --noEmit` clean
- [x] `npm run build` exit 0, no warnings
- [x] Exactly one `<h1>`; 13 `<h2>`; no heading-level skips
- [x] All 12 in-page anchors resolve to a real element
- [x] No horizontal overflow at 375 / 768 / 1440
- [x] Hero stage is fixed-height — the animation cannot shift layout or move the CTAs
- [x] Sandbox failure path returns actionable copy, never an indefinite spinner
- [x] Analytics events fire (confirmed via DataFast console output)
- [x] Every plan price and limit reads from `src/lib/plans.ts`
- [x] No testimonials, logos, user counts, revenue figures or compliance badges
- [x] All sample data labelled “Demo workspace · Illustrative data”
- [x] Scroll-reveal has an immediate-on-screen path and a 2.5s fallback
- [x] Body/secondary text contrast: `#98A2B3` on white measured **2.63:1** and
      failed WCAG AA, so every text use was replaced with `#667085` (**4.95:1**).
      `#98A2B3` now survives only in non-text roles.

**Closed 2026-08-05**
- [x] Widths 390 / 430 / 1024 — no horizontal overflow at any of them; desktop
      nav fits at 1024
- [x] Focus indicators — no global outline reset, and every live component
      pairing `outline-none` with a ring. The only unguarded `outline-none` is
      in `animated-chat-hero.tsx`, an orphaned component with zero importers.
- [x] Accessible names — both sandbox inputs had only a placeholder, which is
      not an accessible name (it disappears on input and several screen readers
      ignore it). Both now carry `aria-label`.
- [x] Contrast — `#16A67A` measured **2.94:1** as small text and failed AA.
      Text uses moved to `#0B6E51` (**6.24:1**); the green is kept for icons and
      dots, which need 3:1 and score 3.1. Two inline styles in the hero
      (`#98A2B3`, `#C6CBD6`) that the earlier class-only sweep could not reach
      are now `#667085` (**4.97:1**). Zero opaque text failures remain.
- [x] `prefers-reduced-motion` — 6 guard blocks cover reveal, draw-line,
      stagger, underline, grow-bars, marquee and the sandbox. The hero loop is
      JS-guarded and jumps to its final frame. `animate-ping` was unguarded and
      now carries `motion-reduce:animate-none`.

**Still open**
- [ ] Lighthouse mobile performance ≥ 90
- [ ] Screen-reader pass on the hero loop (`aria-hidden` coverage)
- [ ] `prefers-reduced-motion` end-to-end
- [ ] Sandbox against a slow/large real site, and against a site that blocks crawling
- [ ] Sticky mobile CTA does not cover the closing section's own CTA
