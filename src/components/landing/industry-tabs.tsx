'use client'

import * as React from 'react'
import { ArrowRight, Check, MessageSquareText, Target } from 'lucide-react'

import { LANDING_EVENTS, track } from '@/lib/analytics'

/**
 * Section 12 — the same product, shown in the six verticals that dominate a
 * local-business client roster.
 *
 * Scope discipline: the assistant handles service, scheduling and intake
 * questions. It does not diagnose, advise or promise outcomes — the legal and
 * med-spa tabs in particular route those questions to a human on purpose.
 */

type Industry = {
  id: string
  label: string
  client: string
  question: string
  answer: string
  behaviour: string[]
  qualifiers: string[]
  goal: string
}

const INDUSTRIES: Industry[] = [
  {
    id: 'dental',
    label: 'Dental',
    client: 'Bright Smile Dental',
    question: 'Do you offer teeth whitening on Saturdays?',
    answer:
      'Yes — in-office whitening is $199 and takes about 45 minutes. Saturday hours are 9:00 AM to 2:00 PM, and we still have openings this week.',
    behaviour: [
      'Quotes the treatment and price from the services page',
      'Confirms Saturday opening hours',
      'Offers the next available slots',
    ],
    qualifiers: ['New or existing patient?', 'Which treatment?', 'Name and best number'],
    goal: 'Book a whitening consultation',
  },
  {
    id: 'medspa',
    label: 'Med spa',
    client: 'Lumen Aesthetics',
    question: 'How many sessions of laser hair removal will I need?',
    answer:
      'Most packages are sold in six sessions, spaced four to six weeks apart. The exact number depends on your skin and hair type, which the practitioner assesses at the consultation — those are complimentary this month.',
    behaviour: [
      'Explains the standard package from the price list',
      'Declines to give a personal treatment plan',
      'Routes the clinical question to a consultation',
    ],
    qualifiers: ['Which treatment area?', 'First visit?', 'Name and best number'],
    goal: 'Book a complimentary consultation',
  },
  {
    id: 'hvac',
    label: 'HVAC',
    client: 'Cardinal Heating & Air',
    question: 'My AC stopped cooling. Can someone come today?',
    answer:
      'We do hold same-day emergency slots. We cover the metro area and the two neighbouring counties — tell me your postcode and whether the unit is running at all, and I’ll get you into the dispatch queue.',
    behaviour: [
      'Confirms the service area before promising anything',
      'Asks whether the system is completely down',
      'Guides toward emergency scheduling',
    ],
    qualifiers: ['Postcode', 'Is the unit completely down?', 'Name and phone number'],
    goal: 'Same-day emergency dispatch',
  },
  {
    id: 'legal',
    label: 'Legal',
    client: 'Vance & Reed Law',
    question: 'I was rear-ended last week. Do I have a case?',
    answer:
      'I can’t assess a case — an attorney has to do that. Consultations for motor-vehicle claims are free and usually happen within 48 hours. If you leave your name and number with a couple of details, the intake team will call you.',
    behaviour: [
      'Explicitly declines to give legal advice',
      'States the consultation policy from the site',
      'Collects structured intake details',
    ],
    qualifiers: ['Type of matter', 'When did it happen?', 'Name and best number'],
    goal: 'Schedule an attorney consultation',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    client: 'Northline Strength',
    question: 'What does membership cost and can I try it first?',
    answer:
      'Membership is $89 a month with no joining fee, and the first class is free. Beginner strength classes run weekday evenings at 6:00 and 7:15 PM.',
    behaviour: [
      'Quotes pricing straight from the membership page',
      'Surfaces the free trial offer',
      'Suggests classes that fit a beginner',
    ],
    qualifiers: ['Training goal', 'Preferred days and times', 'Name and best number'],
    goal: 'Reserve a free trial class',
  },
  {
    id: 'home',
    label: 'Home services',
    client: 'Bramble & Co. Roofing',
    question: 'There’s a leak above my bedroom. How much is a repair?',
    answer:
      'Repairs start around $450, but the price depends on the cause and the roof, so we quote after an inspection. Inspections are free and we can usually get out within two working days.',
    behaviour: [
      'Gives the published starting price honestly',
      'Explains why a firm quote needs an inspection',
      'Offers the free inspection as the next step',
    ],
    qualifiers: ['Property address or postcode', 'Active leak right now?', 'Name and phone number'],
    goal: 'Book a free roof inspection',
  },
]

export default function IndustryTabs() {
  const [active, setActive] = React.useState(0)
  const industry = INDUSTRIES[active]
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const select = (index: number) => {
    setActive(index)
    track(LANDING_EVENTS.industryTabViewed, { industry: INDUSTRIES[index].id })
  }

  // Roving focus so the tablist is fully keyboard-operable.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const next = (active + delta + INDUSTRIES.length) % INDUSTRIES.length
    select(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div
        role="tablist"
        aria-label="Client industries"
        onKeyDown={onKeyDown}
        className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {INDUSTRIES.map((item, index) => {
          const selected = active === index
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`industry-tab-${item.id}`}
              aria-selected={selected}
              aria-controls="industry-panel"
              tabIndex={selected ? 0 : -1}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              onClick={() => select(index)}
              className={`shrink-0 rounded-lg border px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2 ${
                selected
                  ? 'border-[#5B5CE2] bg-[#5B5CE2] text-white'
                  : 'border-[#E4E7EC] bg-white text-[#475467] hover:text-[#101828]'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id="industry-panel"
        aria-labelledby={`industry-tab-${industry.id}`}
        className="mt-4 overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white"
      >
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          {/* The conversation */}
          <div className="border-b border-[#E4E7EC] lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2.5 bg-[#0E1726] px-4 py-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#5B5CE2] text-[10px] font-bold text-white">
                {industry.client
                  .split(' ')
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join('')}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-semibold text-white">{industry.client}</span>
                <span className="block text-[10.5px] text-white/45">Sample data</span>
              </span>
            </div>

            <div className="flex flex-col gap-2.5 p-4 sm:p-5">
              <p className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-[#5B5CE2] px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
                {industry.question}
              </p>
              <p className="w-fit max-w-[92%] rounded-2xl rounded-bl-md border border-[#E4E7EC] bg-[#F7F8FA] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#344054]">
                {industry.answer}
              </p>
            </div>
          </div>

          {/* What it does behind the answer */}
          <div className="space-y-5 p-4 sm:p-5">
            <div>
              <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                <MessageSquareText className="h-3.5 w-3.5" />
                What it does
              </h4>
              <ul className="mt-2.5 space-y-1.5">
                {industry.behaviour.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] leading-5 text-[#475467]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A67A]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                <Target className="h-3.5 w-3.5" />
                What it asks
              </h4>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {industry.qualifiers.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-[#E4E7EC] bg-[#F7F8FA] px-2.5 py-1 text-[12px] font-medium text-[#475467]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-[#16A67A]/25 bg-[#ECFDF3] px-3.5 py-3">
              <ArrowRight className="h-4 w-4 shrink-0 text-[#16A67A]" />
              <span className="min-w-0">
                <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0B6E51]/70">
                  Conversion goal
                </span>
                <span className="block text-[13.5px] font-semibold text-[#101828]">{industry.goal}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
