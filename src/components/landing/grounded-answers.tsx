import type * as React from 'react'
import { CircleHelp, Eye, FileText, FolderLock, MessageSquareText, UserRoundCheck } from 'lucide-react'

import { Reveal } from '@/components/landing/reveal'

/**
 * Section 11 — how answers are grounded.
 *
 * The single biggest objection from this ICP is "what if it tells my client's
 * customer something wrong". Rather than asserting accuracy, the section shows
 * both branches side by side: a question the approved content covers, and one
 * it does not.
 *
 * No compliance, encryption or certification claims appear here — none have
 * been verified, so none are made.
 */

const GUARANTEES = [
  {
    icon: FileText,
    title: 'Approved content only',
    copy: 'The assistant answers from the client’s website pages and the documents you upload. Nothing else is in scope.',
  },
  {
    icon: Eye,
    title: 'Test before it is public',
    copy: 'Run the questions a real customer would ask in a private test chat, and keep editing until the answers are right.',
  },
  {
    icon: FolderLock,
    title: 'Knowledge stays separated',
    copy: 'Each client workspace has its own knowledge base. One client’s content is never used to answer another client’s visitor.',
  },
  {
    icon: UserRoundCheck,
    title: 'Unknowns become leads',
    copy: 'When it cannot answer, it stops and offers to take the visitor’s details so a person can follow up.',
  },
  {
    icon: MessageSquareText,
    title: 'Review and improve',
    copy: 'Every conversation is readable afterwards, so gaps in the client’s content turn into a fix list instead of a surprise.',
  },
]

function ChatCard({
  verdict,
  tone,
  question,
  answer,
  source,
  footnote,
}: {
  verdict: string
  tone: 'known' | 'unknown'
  question: string
  answer: React.ReactNode
  source?: string
  footnote: string
}) {
  const known = tone === 'known'
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] px-4 py-3">
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: known ? '#ECFDF3' : '#FFFAEB' }}
        >
          {known ? (
            <MessageSquareText className="h-3.5 w-3.5 text-[#16A67A]" />
          ) : (
            <CircleHelp className="h-3.5 w-3.5 text-[#DC6803]" />
          )}
        </span>
        <span className="text-[12.5px] font-bold text-[#101828]">{verdict}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-[#5B5CE2] px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
          {question}
        </p>
        <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-md border border-[#E4E7EC] bg-[#F7F8FA] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#344054]">
          {answer}
          {source && (
            <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#667085]">
              <FileText className="h-3 w-3" />
              Source: {source}
            </span>
          )}
        </div>
      </div>

      <p
        className="border-t px-4 py-3 text-[12px] leading-5"
        style={{
          borderColor: known ? '#ECFDF3' : '#FFFAEB',
          backgroundColor: known ? '#ECFDF3' : '#FFFAEB',
          color: known ? '#0B6E51' : '#B54708',
        }}
      >
        {footnote}
      </p>
    </div>
  )
}

export default function GroundedAnswers() {
  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChatCard
            verdict="It knows this one"
            tone="known"
            question="Do you accept walk-ins?"
            answer="Walk-ins are welcome Monday to Friday before 4:00 PM. Same-day emergency slots are held open each morning, so calling ahead gets you seen faster."
            source="/new-patients"
            footnote="Answered from an approved page on the client’s own website."
          />
          <ChatCard
            verdict="It does not know this one"
            tone="unknown"
            question="Can you guarantee my insurance will cover this?"
            answer="I can’t confirm what your specific plan covers — that depends on your policy, and the practice verifies it directly. If you leave your name and number, someone from the front desk will check your benefits and call you back."
            footnote="No answer was invented. The visitor is handed to a person, and you keep the lead."
          />
        </div>
      </Reveal>

      <Reveal delay={140} className="mt-4">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GUARANTEES.map((item, index) => (
            <li
              key={item.title}
              className="stagger-item rounded-2xl border border-[#E4E7EC] bg-white p-5"
              style={{ '--stagger-delay': `${index * 90}ms` } as React.CSSProperties}
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#F7F8FA] text-[#5B5CE2] ring-1 ring-[#E4E7EC]">
                <item.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 font-heading text-[15px] font-bold tracking-tight text-[#101828]">
                {item.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-6 text-[#667085]">{item.copy}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  )
}
