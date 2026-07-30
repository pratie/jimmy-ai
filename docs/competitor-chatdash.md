# Competitor brief: ChatDash (chat-dash.com)

_Last updated: 2026-07-30. Sources: chat-dash.com, chat-dash.com/pricing, trustmrr.com/startup/chatdash-llc, trillet.ai/blogs/chatdash-alternative (competitor teardown — biased, structural claims verified against ChatDash's own pages)._

## What it is

White-label "agency operating system" for selling AI agents. **It has no AI engine of its own** — agencies bring agents built in Retell, Vapi, or ElevenLabs (voice) or Voiceflow/OpenAI Assistants (chat, its original 2024 focus), and ChatDash wraps them in the business layer:

- **Deliver** — branded client portal ("Client Command Center"): each end-client logs in under the agency's domain/logo and sees analytics.
- **Automate** — visual workflow builder, unlimited runs ("cancel your Zapier"), call-event triggers, integrations: GoHighLevel, HubSpot, Google Calendar, Gmail, Stripe, Twilio.
- **Monetize** — built-in Stripe billing so the agency charges *its* clients: subscriptions, overages, setup fees, performance-based billing per appointment/lead.

## Verified traction

- ~$39k MRR, ~$544k all-time, 215 paying subscriptions (TrustMRR, July 2026)
- Founded April 2024; claims "600+ agencies"
- Average revenue per account ≈ $182/mo

## Pricing (per client slot — the key insight)

| Plan | Annual | Monthly-equivalent | Client slots | Extra client |
|---|---|---|---|---|
| Starter | $1,200/yr | ~$100–120/mo | 3 | $15 |
| Growth | $3,000/yr | ~$250–300/mo | 5 | $12 |
| Ultimate | $6,000/yr | ~$500–600/mo | 10 | $10 |

HIPAA add-on $200/mo. 7-day free trial. Headline prices require annual prepay.

## Why it wins

It doesn't sell AI — it sells the **agency's ability to charge their clients and look professional doing it**. The white-label portal + billing rails directly enable agencies to bill each client $500–2,000/mo, so a $100–600/mo platform fee is easy math. Pricing scales with the agency's client count.

## Documented weaknesses (= our openings)

1. **It's a shell**: separate Retell/Vapi/ElevenLabs subscription required; multiple vendors, fragmented support, compounding failure points.
2. **Annual prepay** for headline prices.
3. **Slow setup**: ~45–90 min per client, no agent building inside the product.
4. **Thin credibility**: no case studies, no content, no organic search presence.

## Implications for ChatDock

- **Positioning line: "The agent is built in."** ChatDock = paste the website, agent live in an afternoon, one vendor, monthly billing.
- **Adopt per-client-slot pricing** (see `docs/pricing-strategy.md`). Flat $97/mo under-monetizes the exact buyers who pay ChatDash $182/mo average.
- **Roadmap gap to close**: white-label client portal (client-facing login under agency brand) and agency→client billing rails. Our "show clients results" story is the manual version of what ChatDash productized.
- **Content moat is cheap**: they rank for nothing. Agency-focused SEO/content compounds against them.
