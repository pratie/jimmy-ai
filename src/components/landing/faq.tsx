'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

import { FAQS } from '@/constants/faq'

/**
 * Section 14 — objection handling.
 *
 * Answers live in src/constants/faq.ts so the page can emit matching FAQPage
 * JSON-LD from the same source. Accordion is a plain disclosure pattern:
 * button + aria-expanded + aria-controls, keyboard operable by default.
 */

function FaqItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string
  answer: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const id = React.useId()

  return (
    <div className="border-b border-[#E4E7EC] last:border-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2 sm:py-5"
        >
          <span className="text-[14.5px] font-semibold text-[#101828] sm:text-[15px]">{question}</span>
          <span
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#E4E7EC] text-[#667085] transition-transform duration-300 ease-out-strong ${
              open ? 'rotate-45' : ''
            }`}
          >
            <Plus className="h-3 w-3" />
          </span>
        </button>
      </h3>
      <div
        id={id}
        role="region"
        className="grid transition-[grid-template-rows] duration-300 ease-out-strong"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-8 text-[14px] leading-7 text-[#667085]">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-[#E4E7EC] bg-white px-5 sm:px-7">
      {FAQS.map((faq, index) => (
        <FaqItem key={faq.question} {...faq} defaultOpen={index === 0} />
      ))}
    </div>
  )
}
