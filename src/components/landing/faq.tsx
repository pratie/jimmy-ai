'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'What do my client’s website visitors actually see?',
    answer:
      'A small chat bubble in the corner of the website, styled in your client’s colors and logo. When a visitor opens it, they can ask questions in plain language — “How much does a cleaning cost?”, “Are you open Saturdays?” — and get an instant, friendly answer. No app to download, nothing to install for the visitor.',
  },
  {
    question: 'Where do the answers come from? Will it make things up?',
    answer:
      'The assistant only answers from content you approve — the client’s website pages and any documents you upload. If someone asks something outside that knowledge, it says so and offers to take the visitor’s details instead of guessing. You can test every agent privately before it goes live.',
  },
  {
    question: 'Do I need to know how to code?',
    answer:
      'No. You paste the client’s website address, review what the assistant learned, adjust the greeting and questions, and copy one line of embed code onto the site. It works on WordPress, Webflow, Wix, Shopify, Squarespace, and custom-built sites.',
  },
  {
    question: 'How does it turn conversations into appointments?',
    answer:
      'You decide what a good lead looks like for each client — for a dentist that might be “new patient, wants whitening, this week.” The assistant asks those qualifying questions naturally in the conversation, saves the visitor’s name and contact details, and guides them to book a time. Every lead and booking lands in your dashboard.',
  },
  {
    question: 'Can I manage more than one client in the same account?',
    answer:
      'Yes — that’s the point. Each client gets their own workspace with separate knowledge, branding, conversations, and leads. You see everything from one agency dashboard instead of logging into a different tool for every client.',
  },
  {
    question: 'What do I show my clients each month?',
    answer:
      'Real conversations, captured leads, and booked appointments — not “the bot is live.” Open the client’s workspace in a review call and walk through exactly what the assistant handled and what it produced. That’s what keeps retainers renewed.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'Trying it costs nothing — the free plan includes a full workspace and 100 messages. Paid plans start at $19/month for one live client and $49/month for five client workspaces. All plans are monthly with no annual lock-in, and yearly billing saves about 40%.',
  },
]

function FaqItem({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  const id = React.useId()

  return (
    <div className="border-b border-black/[0.07] last:border-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
      >
        <span className="text-[15px] font-semibold text-[#171d3b] sm:text-base">{question}</span>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-black/[0.08] text-[#171d3b] transition-transform duration-300 ease-out-strong ${
            open ? 'rotate-45' : ''
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
        </span>
      </button>
      <div
        id={id}
        className="grid transition-[grid-template-rows] duration-300 ease-out-strong"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="pb-6 pr-10 text-[15px] leading-7 text-[#5a6072]">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl">
      {FAQS.map((faq, index) => (
        <FaqItem key={faq.question} {...faq} defaultOpen={index === 0} />
      ))}
    </div>
  )
}
