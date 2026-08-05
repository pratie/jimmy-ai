# Permission & entitlement matrices

Derived from [`src/lib/permissions.ts`](../../src/lib/permissions.ts) and
[`src/lib/entitlements.ts`](../../src/lib/entitlements.ts). Those files are
authoritative — if this document and the code disagree, the code wins and this
document is the bug.

---

## 1. Permission matrix — organization roles

`owner` has everything. Everything else is a subset.

| Permission | owner | admin | manager | member | analyst | billing |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| viewOrganization | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| manageOrganization | ✅ | — | — | — | — | — |
| manageBilling | ✅ | ✅ | — | — | — | ✅ |
| inviteOrganizationMember | ✅ | ✅ | — | — | — | — |
| createClientWorkspace | ✅ | ✅ | ✅ | — | — | — |
| viewClientWorkspace | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| manageClientWorkspace | ✅ | ✅ | ✅ | — | — | — |
| archiveClientWorkspace | ✅ | ✅ | — | — | — | — |
| inviteClientUser | ✅ | ✅ | ✅ | — | — | — |
| createAssistant | ✅ | ✅ | ✅ | ✅ | — | — |
| editAssistant | ✅ | ✅ | ✅ | ✅ | — | — |
| publishAssistant | ✅ | ✅ | ✅ | — | — | — |
| manageKnowledge | ✅ | ✅ | ✅ | ✅ | — | — |
| viewConversations | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| takeOverConversation | ✅ | ✅ | ✅ | ✅ | — | — |
| exportConversations | ✅ | ✅ | ✅ | — | — | — |
| viewLeads | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| manageLeads | ✅ | ✅ | ✅ | ✅ | — | — |
| viewBookings | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| manageBookings | ✅ | ✅ | ✅ | ✅ | — | — |
| viewReports | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| manageIntegrations | ✅ | ✅ | ✅ | — | — | — |

**Deliberate choices:**

- `admin` cannot `manageOrganization` — renaming, transferring or deleting the
  tenant stays with the owner.
- `analyst` can read but **cannot `exportConversations`**. Reading a report and
  walking out with the lead list are different acts, and only one of them is
  reversible.
- `billing` can see the organization exists and pay for it, and **cannot read a
  single client conversation or lead**. A bookkeeper does not need the leads.
- `member` cannot `publishAssistant`. Going live on a client's real website is a
  deliberate act, not a side effect of editing.
- A **suspended** organization drops to read-only: only `view*` and
  `manageBilling` survive, so an unpaid account can still see its data and fix
  the payment, but cannot keep growing.

## 2. Permission matrix — workspace roles

Applied when an agency member is scoped to selected clients, or when a
client-side user logs in. **Effective permissions are the intersection of the
organization role and the workspace role** — a workspace assignment can never
grant more than the org role already allows. Otherwise assignment would be a
privilege-escalation path.

| Permission | agency_manager | agency_member | client_admin | client_member | client_viewer |
|---|:--:|:--:|:--:|:--:|:--:|
| viewClientWorkspace | ✅ | ✅ | ✅ | ✅ | ✅ |
| manageClientWorkspace | ✅ | — | — | — | — |
| inviteClientUser | ✅ | — | — | — | — |
| createAssistant | ✅ | ✅ | — | — | — |
| editAssistant | ✅ | ✅ | — | — | — |
| publishAssistant | ✅ | — | — | — | — |
| manageKnowledge | ✅ | ✅ | — | — | — |
| viewConversations | ✅ | ✅ | ✅ | ✅ | — |
| takeOverConversation | ✅ | ✅ | — | — | — |
| exportConversations | ✅ | — | ✅ | — | — |
| viewLeads | ✅ | ✅ | ✅ | ✅ | — |
| manageLeads | ✅ | ✅ | ✅ | — | — |
| viewBookings | ✅ | ✅ | ✅ | ✅ | — |
| manageBookings | ✅ | ✅ | ✅ | — | — |
| viewReports | ✅ | ✅ | ✅ | ✅ | ✅ |
| manageIntegrations | ✅ | — | — | — | — |

**Client roles never carry** `manageBilling`, `viewOrganization`,
`createClientWorkspace`, `manageKnowledge` or `publishAssistant`. Clients see
outcomes; agencies see configuration. `client_admin` does get
`exportConversations` and `manageLeads` — it is their own lead data.

## 3. How a request is authorized

```
authorizeWorkspaceAction(clerkId, organizationId, clientWorkspaceId, permission)
  │
  ├─ getActorContext ─────── active OrganizationMembership?      no → deny
  │
  ├─ resolveWorkspaceAccess ─ workspace.organizationId ==
  │                           actor.organizationId?              no → deny  ← tenant boundary
  │                           │
  │                           ├─ owner/admin → implicit access
  │                           └─ otherwise  → explicit ClientWorkspaceMembership?  no → deny
  │
  └─ assertCanInWorkspace ─── permission in (orgRole ∩ workspaceRole)?  no → deny
```

The tenant check lives in the **`WHERE` clause** of the workspace lookup, not in
application code afterwards. A workspace id from another organization does not
resolve at all, so there is nothing to accidentally leak.

> **Rule for every server action:** never pass a client-supplied
> `organizationId` or `clientWorkspaceId` into a query. Pass the **verified**
> ids returned by `authorizeWorkspaceAction`.

## 4. Entitlement matrix

`null` = unlimited. Booleans are 0/1. Defined in
[`prisma/seed-plans.mjs`](../../prisma/seed-plans.mjs) — re-runnable, upsert-based.

> ⚠ **Not yet the single source.** `src/lib/plans.ts` still exists and is read by
> nine files, including the landing pricing section and margin calculator. The
> product *enforces* `PlanEntitlement`; the marketing page *advertises*
> `plans.ts`. The two agree today (verified 2026-08-05) but nothing keeps them
> in sync, so this is live drift risk. Closing it means having the pricing page
> read plans from the database and deleting `plans.ts`. Tracked in STATUS.md.

| Entitlement | Free | Starter | Pro | Business |
|---|--:|--:|--:|--:|
| maximum_client_workspaces | 1 | 1 | 5 | ∞ |
| maximum_assistants | 1 | 2 | 10 | ∞ |
| monthly_messages | 100 | 2,000 | 5,000 | 10,000 |
| monthly_crawl_pages | 50 | 500 | 2,000 | 10,000 |
| maximum_training_sources | 5 | 15 | 50 | ∞ |
| storage_bytes | 1 MB | 20 MB | 50 MB | 200 MB |
| maximum_team_members | 1 | 2 | 5 | 20 |
| maximum_client_users | 0 | 0 | 5 | ∞ |
| maximum_prospect_demos | 3 | 5 | 15 | 50 |
| hide_branding | — | — | ✅ | ✅ |
| shareable_demos | ✅ | ✅ | ✅ | ✅ |
| client_portal | — | — | — | — |
| custom_domain | — | — | — | — |
| advanced_reporting | — | — | ✅ | ✅ |
| api_access | — | — | — | — |

Workspace, message, source, storage and branding values carry the previously
shipped limits forward unchanged, so no existing plan gets worse.
`client_portal`, `custom_domain` and `api_access` are **off on every plan**
because none of them are built — they turn on when they ship, not before.

**Prospect demos do not consume a client-workspace slot.** `maximum_client_workspaces`
counts only `active_client` and `direct_business`; demos have their own limit.
Otherwise demoing to a prospect would eat a paid client slot, which defeats the
entire outreach workflow.

## 5. How usage is measured

| Kind | Entitlements | Source |
|---|---|---|
| Count-based | workspaces, assistants, team members, client users, prospect demos | live `COUNT(*)` with tenant + soft-delete filters |
| Period-based | monthly_messages, monthly_crawl_pages | `SUM(UsageEvent.quantity)` within the billing period |
| Running total | storage_bytes | `SUM(UsageEvent.quantity)`, all time |
| Boolean | hide_branding, shareable_demos, … | limit > 0 |

Two fixes over the old design:

1. **Usage is attributable.** `UsageEvent` carries `organizationId`,
   `clientWorkspaceId` and `assistantId`, so "which client burned the quota" is
   answerable. The old pooled `Billings.messagesUsed` counter could not.
2. **Periods come from the provider.** `Subscription.currentPeriodStart/End` are
   authoritative, falling back to the calendar month. The old code reset credits
   30 days after whenever the last chat happened, drifting from the invoice date.

`recordUsage` writes are idempotent on `idempotencyKey` — a retried request
records its consumption exactly once instead of double-charging. A duplicate key
is swallowed as success, not raised as an error.

**No overage.** Per the owner's answer to Q14, exceeding a limit blocks the
action (`EntitlementError`). There is no automatic overage billing, and the
pricing page says so.
