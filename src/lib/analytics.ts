/**
 * Landing-page conversion analytics.
 *
 * Provider-agnostic on purpose: the site currently ships DataFast
 * (see the <Script> in src/app/(main)/layout.tsx). This module forwards each
 * event to whichever provider happens to be on the page (DataFast, PostHog,
 * GA4 / GTM) and no-ops silently when none is loaded, so adding or swapping a
 * provider never requires touching call sites.
 *
 * Event names are the single source of truth for the funnel reports in
 * docs/analytics-events.md — do not rename one without updating that doc.
 */

export const LANDING_EVENTS = {
  /** Homepage entered the viewport (fired once per page load). */
  homepageViewed: 'homepage_viewed',
  /** Any primary/secondary CTA click. Props: { location, label }. */
  ctaClicked: 'cta_clicked',
  /** A URL was submitted to the no-signup sandbox. Props: { source }. */
  demoUrlSubmitted: 'demo_url_submitted',
  /** The sandbox finished building an assistant. Props: { grounded }. */
  demoGenerated: 'demo_generated',
  /** The sandbox could not build an assistant. Props: { reason }. */
  demoFailed: 'demo_failed',
  /** First visitor message sent inside the sandbox. */
  demoConversationStarted: 'demo_conversation_started',
  /** A pre-written example question was clicked. Props: { question }. */
  demoSuggestedQuestionClicked: 'demo_suggested_question_clicked',
  /** The margin calculator was adjusted. Props: { clients, price, plan }. */
  marginCalculatorUsed: 'margin_calculator_used',
  /** The pricing section entered the viewport. */
  pricingViewed: 'pricing_viewed',
  /** A plan CTA was clicked. Props: { plan }. */
  planSelected: 'plan_selected',
  /** An industry tab was opened. Props: { industry }. */
  industryTabViewed: 'industry_tab_viewed',
  /** The cal.com walkthrough link was clicked. Props: { location }. */
  walkthroughBooked: 'walkthrough_booked',
} as const

export type LandingEvent = (typeof LANDING_EVENTS)[keyof typeof LANDING_EVENTS]

type Props = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    datafast?: (event: string, props?: Props) => void
    posthog?: { capture: (event: string, props?: Props) => void }
    dataLayer?: Array<Record<string, unknown>>
    gtag?: (command: string, event: string, props?: Props) => void
  }
}

/** Fire-and-forget. Never throws — analytics must not break the page. */
export function track(event: LandingEvent, props?: Props) {
  if (typeof window === 'undefined') return
  try {
    window.datafast?.(event, props)
    window.posthog?.capture(event, props)
    window.gtag?.('event', event, props)
    if (!window.gtag && window.dataLayer) {
      window.dataLayer.push({ event, ...props })
    }
  } catch {
    /* analytics is never load-bearing */
  }
}

/** Convenience for CTA links so every call site records the same shape. */
export function trackCta(location: string, label: string) {
  track(LANDING_EVENTS.ctaClicked, { location, label })
}
