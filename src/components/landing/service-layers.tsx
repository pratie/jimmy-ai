import type * as React from 'react'
import { Building2, LayoutGrid, MessagesSquare, UserRoundCheck } from 'lucide-react'

import { Reveal } from '@/components/landing/reveal'

/**
 * Section 6 — the productised service, shown as four connected layers.
 *
 * Desktop reads left→right along a line that draws itself once the section
 * enters view (the connection is the point: one service, four layers, not four
 * separate features). Mobile stacks the same four cards vertically.
 */

const LAYERS = [
  {
    icon: MessagesSquare,
    eyebrow: 'Layer 1',
    title: 'Visitor experience',
    copy: 'A helpful assistant that answers questions naturally, in the client’s voice, outside business hours as well as during them.',
    detail: ['Answers from approved content', 'Available 24/7', 'Matches the client’s brand'],
  },
  {
    icon: UserRoundCheck,
    eyebrow: 'Layer 2',
    title: 'Lead qualification',
    copy: 'The assistant collects contact details and asks the qualifying questions that matter for that specific business.',
    detail: ['Name and phone captured', 'Business-specific questions', 'Guided toward booking'],
  },
  {
    icon: Building2,
    eyebrow: 'Layer 3',
    title: 'Client workspace',
    copy: 'Knowledge, branding, conversations, leads and appointments stay separated for every client you run.',
    detail: ['Isolated knowledge base', 'Per-client branding', 'Own conversation history'],
  },
  {
    icon: LayoutGrid,
    eyebrow: 'Layer 4',
    title: 'Agency command center',
    copy: 'You manage the whole roster from one account, without maintaining a different tool or login per client.',
    detail: ['One dashboard, every client', 'One login', 'One repeatable setup'],
  },
]

export default function ServiceLayers() {
  return (
    <Reveal className="mx-auto max-w-6xl">
      <div className="relative">
        {/* Connector — draws left→right on desktop only */}
        <div className="absolute left-[12.5%] right-[12.5%] top-[42px] hidden lg:block">
          <div className="draw-line h-px bg-gradient-to-r from-[#5B5CE2]/15 via-[#5B5CE2]/45 to-[#16A67A]/45" />
        </div>

        <ol className="relative grid gap-3 lg:grid-cols-4">
          {LAYERS.map((layer, index) => (
            <li
              key={layer.title}
              className="stagger-item"
              style={{ '--stagger-delay': `${index * 140}ms` } as React.CSSProperties}
            >
              <div className="flex h-full flex-col rounded-2xl border border-[#E4E7EC] bg-white p-5 sm:p-6">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: index === LAYERS.length - 1 ? '#16A67A' : '#5B5CE2' }}
                >
                  <layer.icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                  {layer.eyebrow}
                </p>
                <h3 className="mt-1.5 font-heading text-[17px] font-bold tracking-tight text-[#101828]">
                  {layer.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-6 text-[#667085]">{layer.copy}</p>
                <ul className="mt-4 space-y-1.5 border-t border-[#E4E7EC] pt-4">
                  {layer.detail.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[12.5px] text-[#475467]">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-[#98A2B3]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  )
}
