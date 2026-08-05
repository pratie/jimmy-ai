import type * as React from 'react'
import { ArrowRight, Ban } from 'lucide-react'

import { Reveal } from '@/components/landing/reveal'

/**
 * The sales motion, not the product.
 *
 * Most agencies can install a widget. Far fewer can run the call that sells
 * one, and that gap is the real reason a tool like this sits unused. So this
 * section ships the diagnostic rather than another feature grid.
 *
 * Deliberately contains no statistics. Every claim here is either arithmetic
 * the reader does themselves or a judgement stated as a judgement — there is
 * no "studies show" and no conversion-lift number, because we do not have one
 * we could defend.
 */

const QUESTIONS: { q: string; why: string }[] = [
  {
    q: 'How much traffic does the site get in a month?',
    why: 'Everything downstream is a percentage of this number. Ask for it before you ask for anything else, because it decides whether the rest of the call is worth having.',
  },
  {
    q: 'What share of those visitors actually buy or book?',
    why: 'Then ask what they think it should be. The distance between those two numbers is the proposal, and they will have said it themselves. Watch for a figure that cannot be right — someone quoting a conversion rate in the tens is describing a different metric, and the whole business case rests on getting it straight.',
  },
  {
    q: 'What happens after somebody decides they want it?',
    why: 'Follow the path yourself while they answer. If the visitor has to call during office hours to finish, no assistant fixes that on its own, and you need to know before you promise a number.',
  },
  {
    q: 'What are you capturing from the people who leave without buying?',
    why: 'Often the answer is nothing, and that alone can justify the fee. It is also the easiest thing to show working in the first week.',
  },
  {
    q: 'Who answers the phone when somebody asks about hours or pricing?',
    why: 'Usually a person whose time is worth more than that. This is a second budget line, it comes out of a different pocket than marketing, and it is frequently the easier yes.',
  },
]

const WALK_AWAY = [
  'The arithmetic does not clear your fee. Do it out loud with them: monthly visits, times the conversion gap they just named, times what one customer is worth. If that is smaller than what you would charge, say so and move on.',
  'Nobody owns the website. If a copy change takes three weeks and a committee, an assistant will take longer.',
  'There is no next step to send anyone to. Fix the booking path first, or you are selling a faster queue for a door that does not open.',
]

export default function FirstCall() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Reveal className="rounded-2xl border border-[#E4E7EC] bg-white p-6 sm:p-8">
          <ol className="space-y-6">
            {QUESTIONS.map((item, index) => (
              <li key={item.q} className="grid grid-cols-[auto_1fr] gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#F5F5FE] text-[12px] font-bold tabular-nums text-[#5B5CE2] ring-1 ring-[#5B5CE2]/15">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-[16px] font-bold leading-snug tracking-tight text-[#101828]">
                    {item.q}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-6 text-[#667085]">{item.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={120} className="rounded-2xl border border-[#FFFAEB] bg-[#FFFAEB] p-6">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-[#B54708] ring-1 ring-[#DC6803]/20">
              <Ban className="h-[18px] w-[18px]" />
            </span>
            <h3 className="mt-4 font-heading text-[17px] font-bold leading-snug tracking-tight text-[#101828]">
              When not to pitch
            </h3>
            <ul className="mt-3 space-y-3">
              {WALK_AWAY.map((reason) => (
                <li key={reason} className="text-[13.5px] leading-6 text-[#7A4A12]">
                  {reason}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={200} className="rounded-2xl border border-[#E4E7EC] bg-white p-6">
            <h3 className="font-heading text-[17px] font-bold leading-snug tracking-tight text-[#101828]">
              Then stop describing it
            </h3>
            <p className="mt-2.5 text-[14px] leading-6 text-[#667085]">
              The moment a prospect asks whether you can show them something is the moment the call turns.
              Build the assistant on their own website before you dial, and answer that question by opening
              a tab.
            </p>
            <a
              href="/demo"
              className="press mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5B5CE2] text-[14px] font-semibold text-white transition-colors hover:bg-[#4A4BD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2"
            >
              Build one on their site <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
