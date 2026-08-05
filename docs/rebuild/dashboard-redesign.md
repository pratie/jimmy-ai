# Agency dashboard — audit, IA and design system

Companion to the implementation. Written 2026-08-05, from reading the code
rather than only the screenshot — several of the worst problems are not visible
in a screenshot at all.

---

## 1. UI audit

### Structural

| # | Finding | Cause in code |
|---|---|---|
| 1 | **“Agency Overview” shows no overview.** The client-creation wizard occupies the entire page. | `dashboard-content.tsx:99` — `useState(domains.length === 0)` makes the wizard *replace* the dashboard, not sit inside it. One line, total takeover. |
| 2 | **The setup panel is mostly empty.** A 900px-wide card holds one input and one button. | `add-domain-cta.tsx` allocates a two-column grid where the right column repeats the stepper as prose. |
| 3 | **The right panel duplicates the stepper.** “What happens next” restates Knowledge / Appearance / Install. | Same file — the panel is static copy, carrying no state. |
| 4 | **Hierarchy competes.** “Command Center”, “Agency Overview”, “New client agent”, “Knowledge”, “What happens next” all read at similar weight. | Five headings, no dominant one. |
| 5 | **Client rows push to a colliding route.** `manageWorkspace` navigates to `/settings/<first label of domain>`. | `dashboard-content.tsx:114`. `acme.com` and `acme.co.uk` both resolve to `/settings/acme`. |

### Data correctness — the ones a screenshot cannot show

| # | Finding | Severity |
|---|---|---|
| 6 | **The usage meter always reads 0%.** The component consumes `plan.messageCredits`; the action returns `credits` / `messageLimit`. `credits` resolves to `undefined`, the guard `credits > 0` fails, usage is hardcoded to 0 forever. | **High** — a plan-limit indicator that always says “fine” |
| 7 | TypeScript did not catch #6 because `Props.plan` declares `messageCredits?: number` as optional, so an object lacking it still satisfies the type. | Process |
| 8 | **“Lead → booking” claims confirmations that do not exist.** Detail copy reads “N confirmed bookings”, but `BookingRequest.status` starts at `requested` and nothing confirms it. | **High** — same overclaim already fixed on the appointments page |
| 9 | `conversionRate` divides bookings by *known* leads (email present only), so phone-only leads are excluded from the denominator and the rate reads high. | Medium |

> #6 and #8 are mine. #6 is a regression from the backend port — I renamed the
> field and the optional prop type hid it. Recording that rather than quietly
> fixing it.

### Visual

The dark sidebar / white rounded card / pale grey background / pale-purple
accent combination is the default shape of an AI-generated dashboard. The
specific tells: every active nav item is one large white pill; every container
uses the same heavy radius; `shadow-[0_8px_30px_rgba(15,23,42,0.04)]` is applied
to surfaces that do not sit above anything; accent purple is used decoratively
rather than to mean something.

---

## 2. Information architecture

Two contexts, always distinguishable without reading the switcher.

**Organization level** — `/dashboard`, `/clients`, `/conversation`, `/leads`,
`/appointment`, `/reports`, `/integration` · admin: `/team`, `/billing`,
`/settings`.

**Client level** — `/clients/[id]` and beneath: assistants, knowledge,
conversations, leads, bookings, reports, access, settings.

The context header states the level in words, so context never depends on
noticing which item a dropdown has selected.

## 3. Design tokens

Defined in `src/lib/design-tokens.ts` and mirrored into Tailwind theme extensions
as `cd-*`, so they are usable as utilities without importing anything.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F6F7F9` | application background |
| `surface` | `#FFFFFF` | primary surfaces |
| `surfaceRaised` | `#FFFFFF` + border | genuinely elevated only |
| `ink` | `#0C1424` | headings, primary text |
| `body` | `#3D4A61` | body copy |
| `muted` | `#647087` | secondary — passes AA on canvas |
| `faint` | `#8A94A6` | metadata only, never body |
| `line` | `#E3E7EE` | borders |
| `lineStrong` | `#CBD2DE` | table rules, dividers under headings |
| `accent` | `#4F46E5` | primary actions, active state, focus |
| `accentSoft` | `#EEF0FF` | selected rows, accent surfaces |
| `success` `warning` `danger` | `#0F7B55` `#B45309` `#B42318` | status text, AA on white |
| `successSoft` `warningSoft` `dangerSoft` | `#E7F6EF` `#FEF5E7` `#FEECEB` | status backgrounds |

Radius `10 / 12 / 14`, not one heavy value everywhere. Shadows: `sm` for
dropdowns and drawers only; surfaces use border + background contrast instead.
Spacing on an 8-point scale.

Accent is **reserved**: primary action, active nav, focus ring, progress,
selected data. It is not a decorative tint.

## 4. Component architecture

```
AppShell                     (dashboard layout)
├─ Sidebar
│  ├─ OrganizationIdentity    name + "Agency workspace" + plan
│  ├─ ClientSwitcher          all-clients vs one client
│  └─ SidebarNav              organization group / admin group
└─ ContextHeader              level, title, supporting line, primary action

AgencyOverview                (has ≥1 client)
├─ MetricRow → MetricCard     real data, timeframe stated, links to records
├─ AttentionPanel             renders nothing when nothing is wrong
├─ ClientHealthTable          dense; one next action per row
├─ ActivityFeed               real events only
└─ UsageMeter                 messages/conversations, never tokens

FirstClientSetup              (zero clients)
├─ WebsiteInput               label, validation, error recovery
└─ SetupPreview               idle: what will be built · active: live progress

StatusBadge · EmptyState      shared primitives
```

## 5. Copy

| Before | After | Why |
|---|---|---|
| New client agent | Add a client | “agent” was one of five words for the same thing |
| Add the client website | Start with the client’s website | states the step, not the field |
| Continue | Create client assistant | names the outcome |
| Usually ready in a few minutes | Most websites are ready to preview within a few minutes. Larger sites keep indexing in the background. | sets a real expectation |
| Sneakyguy SAAS's workspace | **Sneakyguy SaaS** + “Agency workspace” | possessive auto-naming read as a bug |
| N confirmed bookings | N booking requests | nothing confirms them |

Vocabulary is fixed: **Assistant** in product controls, **AI receptionist** only
in value-oriented onboarding copy. Not “bot”, “agent” or “chatbot”.

## 6. What this pass does not cover

Client-level sub-pages (assistants, knowledge, access), Team management, the
5-step new-client flow, and Reports remain on the old surfaces. Backlog in
STATUS.md.
