'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, Info } from 'lucide-react'

import { PLAN_LIMITS, PLAN_PRICES, type PlanType } from '@/lib/plans'
import { LANDING_EVENTS, track, trackCta } from '@/lib/analytics'

/**
 * Section 8 — agency economics.
 *
 * Plan selection and platform cost are read from src/lib/plans.ts, so the
 * calculator can never drift from what the product actually charges or what a
 * plan actually allows.
 *
 * Deliberately conservative: it computes gross margin over the ChatDock
 * subscription only, and says so. It does not model the agency's own delivery
 * time, and it never presents the output as expected or guaranteed income.
 */

const MIN_CLIENTS = 1
const MAX_CLIENTS = 25
const MIN_PRICE = 100
const MAX_PRICE = 1000
const PRICE_STEP = 25

/** Smallest plan whose workspace limit covers this many live clients. */
function planForClients(clients: number): PlanType {
  if (clients <= PLAN_LIMITS.STARTER.domains) return 'STARTER'
  if (clients <= PLAN_LIMITS.PRO.domains) return 'PRO'
  return 'BUSINESS'
}

const PLAN_LABEL: Record<PlanType, string> = {
  FREE: 'Free',
  STARTER: 'Starter',
  PRO: 'Pro',
  BUSINESS: 'Business',
}

const currency = (value: number) => `$${value.toLocaleString('en-US')}`

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (value: number) => string
  onChange: (value: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-[#344054]">
          {label}
        </label>
        <span className="font-heading text-[17px] font-bold tabular-nums text-[#101828]">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="cd-range mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-4"
        style={{
          background: `linear-gradient(to right, #5B5CE2 ${pct}%, #E4E7EC ${pct}%)`,
        }}
      />
      <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-[#667085]">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

export default function MarginCalculator() {
  const [clients, setClients] = React.useState(5)
  const [price, setPrice] = React.useState(300)

  const plan = planForClients(clients)
  const platformCost = PLAN_PRICES[plan].monthly
  const revenue = clients * price
  const margin = revenue - platformCost
  const limits = PLAN_LIMITS[plan]

  // One event per settled adjustment rather than one per pixel of drag.
  React.useEffect(() => {
    const id = setTimeout(
      () => track(LANDING_EVENTS.marginCalculatorUsed, { clients, price, plan }),
      600
    )
    return () => clearTimeout(id)
  }, [clients, price, plan])

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white">
      <div className="grid lg:grid-cols-[1fr_360px]">
        {/* Inputs */}
        <div className="space-y-7 p-5 sm:p-7">
          <Slider
            id="calc-clients"
            label="Clients you put the assistant on"
            value={clients}
            min={MIN_CLIENTS}
            max={MAX_CLIENTS}
            step={1}
            format={(v) => `${v}`}
            onChange={setClients}
          />
          <Slider
            id="calc-price"
            label="What you charge each client per month"
            value={price}
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={PRICE_STEP}
            format={currency}
            onChange={setPrice}
          />

          <div className="rounded-xl border border-[#E4E7EC] bg-[#F7F8FA] p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-semibold text-[#344054]">
                ChatDock plan for {clients} {clients === 1 ? 'client' : 'clients'}
              </span>
              <span className="font-heading text-[15px] font-bold text-[#101828]">
                {PLAN_LABEL[plan]} · {currency(platformCost)}/mo
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-5 text-[#667085]">
              {limits.domains === Infinity ? 'Unlimited' : limits.domains} client{' '}
              {limits.domains === 1 ? 'workspace' : 'workspaces'} ·{' '}
              {limits.messageCredits.toLocaleString()} messages a month across all of them. Yearly billing
              lowers this further.
            </p>
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col justify-between bg-[#0E1726] p-5 text-white sm:p-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Monthly service revenue
            </p>
            <p className="mt-2 font-heading text-3xl font-bold tabular-nums tracking-tight">
              {currency(revenue)}
            </p>

            <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-[13px]">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-white/55">
                  {clients} × {currency(price)}
                </dt>
                <dd className="tabular-nums text-white/85">{currency(revenue)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-white/55">ChatDock {PLAN_LABEL[plan]}</dt>
                <dd className="tabular-nums text-white/85">−{currency(platformCost)}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-xl bg-white/[0.06] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Gross margin over platform cost
              </p>
              <p className="mt-1.5 font-heading text-3xl font-bold tabular-nums tracking-tight text-[#4ADE9E]">
                {currency(margin)}
                <span className="ml-1 align-middle text-[13px] font-semibold text-white/45">/mo</span>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="flex items-start gap-2 text-[11.5px] leading-5 text-white/45">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" />
              Illustrative example — not an earnings guarantee. Covers the ChatDock subscription only,
              not your own delivery time. You set your own prices.
            </p>
            <Link
              href="/auth/sign-up"
              onClick={() => trackCta('margin_calculator', 'Build a client demo')}
              className="press mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-[14px] font-semibold text-[#0E1726] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1726]"
            >
              Build a client demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
