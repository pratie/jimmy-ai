/**
 * Homepage objection-handling FAQ.
 *
 * Kept out of the client component so the server page can also emit it as
 * FAQPage JSON-LD from the same source — the rendered answers and the
 * structured data can never disagree.
 *
 * Honesty rules applied here:
 * - Every "yes" corresponds to something shipped today.
 * - Client logins and CSV export are answered with a plain "not yet".
 * - No compliance, encryption or certification claims are made anywhere,
 *   because none have been verified.
 */

export type Faq = { question: string; answer: string }

export const FAQS: Faq[] = [
  {
    question: 'Will the assistant make up answers?',
    answer:
      'It answers from content you approve (the client’s website pages and the documents you upload) and nothing else. When a question falls outside that, it says it cannot confirm and offers to take the visitor’s details so a person can follow up. You will still want to test it before launch, which is why every workspace has a private test chat.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'An afternoon for the first client, and less for the ones after it. Roughly: two minutes to paste the website and upload documents, ten minutes to review what it learned and test real questions, ten minutes to set branding and the lead questions, five minutes to paste the embed snippet.',
  },
  {
    question: 'Can I test it before adding it to a client’s website?',
    answer:
      'Yes. Every workspace has a private test chat that only you can see. Ask it the questions a real customer would ask, fix the gaps, and only then copy the embed snippet. Nothing is visible to visitors until the snippet is on the site.',
  },
  {
    question: 'Can I manage multiple clients from one account?',
    answer:
      'Yes. That is the point of the product. Each client gets a separate workspace and you run all of them from one agency dashboard with one login. How many workspaces you can have live depends on your plan: one on Free and Starter, five on Pro, unlimited on Business.',
  },
  {
    question: 'Does each client’s data stay separate?',
    answer:
      'Yes. Knowledge, branding, conversations, leads and appointments belong to one workspace. One client’s content is never used to answer another client’s visitor, and the workspaces do not share a knowledge base.',
  },
  {
    question: 'Can the widget match the client’s website?',
    answer:
      'Yes. You set the client’s logo, colours, assistant name, greeting and tone per workspace, so it reads as part of their site rather than a third-party tool bolted on.',
  },
  {
    question: 'Can it capture leads and book appointments?',
    answer:
      'Yes. You define the questions that qualify a lead for that specific business, and the assistant asks them inside the conversation, saves the visitor’s name and contact details, and guides serious visitors toward booking. Leads and appointment requests appear in your dashboard.',
  },
  {
    question: 'Does it work with WordPress, Webflow, Wix, Shopify, Squarespace and custom sites?',
    answer:
      'Yes. Installation is a single script tag placed before the closing body tag, which every one of those platforms supports. There is no plugin to install and no theme to modify.',
  },
  {
    question: 'Can my client log in and see their own results?',
    answer:
      'Not yet. Today you open the client’s workspace and walk them through conversations, leads and appointments on a review call. A simplified client-facing view is on the roadmap, and we would rather say that plainly than sell you something that is not built.',
  },
  {
    question: 'Can I remove ChatDock branding from the widget?',
    answer:
      'Yes, on the Pro and Business plans. The “Powered by” badge is removed from the widget entirely so the assistant carries only your client’s brand. On Free and Starter the badge stays.',
  },
  {
    question: 'What happens when I reach the message limit?',
    answer:
      'The assistant stops replying to new visitors until your allowance resets on the next 30-day cycle, or until you upgrade. There is no automatic overage charge. Messages are pooled across all of your client workspaces rather than allocated to each one.',
  },
  {
    question: 'Can I export conversations and leads?',
    answer:
      'Not today. Full conversation history and every captured lead are readable in the dashboard, but there is no CSV or API export yet. It is on the roadmap.',
  },
  {
    question: 'Is there a human handoff?',
    answer:
      'Yes. You can open any live conversation from the dashboard and take over from the assistant to reply as a person. That matters most on the high-value conversations where a human closes better than an assistant does.',
  },
  {
    question: 'How should an agency price this service?',
    answer:
      'That is your call and it depends on your market and what the client’s existing retainer looks like. You can fold it into an existing website or SEO retainer as an added line item, or sell it standalone. Use the margin calculator on this page to model your own numbers. We do not publish a recommended price, because we do not have enough real customer data to responsibly claim one.',
  },
]
