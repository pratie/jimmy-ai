import type * as React from 'react'
import { Check, X } from 'lucide-react'

import { Reveal } from '@/components/landing/reveal'

/**
 * Section 9 — before/after.
 *
 * The layout carries the argument: the custom-stack column is deliberately
 * dense, tight-leading and desaturated (nine cramped rows), while the ChatDock
 * column is roomy and legible (seven calm rows). Same section height, very
 * different amount of work.
 */

const CUSTOM_STACK = [
  'Find and configure a crawler',
  'Build and maintain prompts',
  'Add a third-party widget',
  'Create lead forms',
  'Connect a separate inbox',
  'Build appointment automation',
  'Maintain separate accounts',
  'Manually prepare client reports',
  'Fix integrations when they break',
]

const WITH_CHATDOCK = [
  'One guided setup',
  'One client workspace',
  'One branded assistant',
  'One conversation inbox',
  'One lead and appointment view',
  'One agency dashboard',
  'One repeatable monthly service',
]

export default function StackComparison() {
  return (
    <Reveal className="mx-auto max-w-5xl">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {/* Compressed: the pile you rebuild per client */}
        <div className="rounded-2xl border border-[#E4E7EC] bg-[#F7F8FA] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-[15px] font-bold tracking-tight text-[#667085]">
              Building the stack yourself
            </h3>
            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#667085] ring-1 ring-[#E4E7EC]">
              9 things · per client
            </span>
          </div>

          <ul className="mt-4 space-y-1">
            {CUSTOM_STACK.map((item, index) => (
              <li
                key={item}
                className="stagger-item flex items-center gap-2 rounded-md border border-[#E4E7EC] bg-white px-2.5 py-1.5"
                style={{ '--stagger-delay': `${index * 45}ms` } as React.CSSProperties}
              >
                <X className="h-3 w-3 shrink-0 text-[#C6CBD6]" />
                <span className="min-w-0 flex-1 truncate text-[12px] leading-tight text-[#667085]">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[12px] leading-5 text-[#667085]">
            Every new client repeats the list. So does every time one of the pieces changes underneath you.
          </p>
        </div>

        {/* Expanded: the repeatable service */}
        <div className="rounded-2xl border border-[#5B5CE2]/25 bg-white p-5 shadow-[0_8px_28px_-14px_rgba(16,24,40,0.18)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-[15px] font-bold tracking-tight text-[#101828]">With ChatDock</h3>
            <span className="shrink-0 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#0B6E51]">
              1 workflow · every client
            </span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {WITH_CHATDOCK.map((item, index) => (
              <li
                key={item}
                className="stagger-item flex items-center gap-3 rounded-lg border border-[#E4E7EC] px-3.5 py-3"
                style={{ '--stagger-delay': `${200 + index * 90}ms` } as React.CSSProperties}
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ECFDF3]">
                  <Check className="h-3 w-3 text-[#16A67A]" />
                </span>
                <span className="text-[13.5px] font-medium text-[#101828]">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[12.5px] leading-5 text-[#667085]">
            The second client takes the same afternoon as the first. That is what makes it a service you can
            sell repeatedly instead of a project you quote each time.
          </p>
        </div>
      </div>
    </Reveal>
  )
}
