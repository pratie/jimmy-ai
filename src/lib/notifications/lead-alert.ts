import 'server-only'

import { client } from '@/lib/prisma'
import { devError, devLog } from '@/lib/utils'

/**
 * "Someone just left their number."
 *
 * A receptionist that takes a message and tells nobody is a bucket with no
 * tap. Until this existed, a lead captured at 11pm sat in Postgres until
 * somebody happened to open the dashboard — which, for an agency selling this
 * as a managed service, is the difference between keeping the client and
 * refunding them.
 *
 * Sent through Resend rather than the Gmail transport used for lead follow-ups
 * elsewhere in the app. That transport sends from a personal mailbox with an
 * app password: ~500/day, no SPF or DKIM alignment for the sending domain, and
 * it lands in spam often enough that an alert nobody sees is indistinguishable
 * from no alert at all. This one is an operational message the business must
 * receive, so it gets a real sending domain.
 *
 * Everything here is fire-and-forget and swallows its own failures. A visitor
 * mid-conversation must never see a stream break because an email provider had
 * a bad minute.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

type Recipients = {
  to: string[]
  clientName: string
  workspaceId: string
  isProspectDemo: boolean
}

/**
 * Who hears about it: the client's own contact address when the agency has
 * filled one in, and always the agency owner. The owner is copied
 * unconditionally on purpose — they are the one being paid to notice, and
 * early on they will be the only one watching.
 */
async function recipientsFor(clientWorkspaceId: string): Promise<Recipients | null> {
  const workspace = await client.clientWorkspace.findUnique({
    where: { id: clientWorkspaceId },
    select: {
      id: true,
      name: true,
      businessName: true,
      contactEmail: true,
      workspaceType: true,
      organization: {
        select: {
          memberships: {
            where: { role: 'owner', status: 'active' },
            take: 1,
            select: { user: { select: { email: true } } },
          },
        },
      },
    },
  })
  if (!workspace) return null

  const isProspectDemo = workspace.workspaceType === 'prospect_demo'
  const ownerEmail = workspace.organization?.memberships[0]?.user?.email ?? null

  // On a demo the only recipient is the agency. `contactEmail` on a demo
  // workspace, if it were ever set, would be the prospect's own address — and
  // mailing the prospect to tell them they filled in a form would be absurd.
  const to = Array.from(
    new Set(
      (isProspectDemo ? [ownerEmail] : [workspace.contactEmail, ownerEmail]).filter(
        (e): e is string => Boolean(e)
      )
    )
  )
  if (to.length === 0) return null

  return {
    to,
    clientName: workspace.businessName || workspace.name,
    workspaceId: workspace.id,
    isProspectDemo,
  }
}

async function send(input: { to: string[]; subject: string; text: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.LEAD_ALERT_FROM

  // Absent configuration is a no-op, not a crash. The app has to keep working
  // on a laptop and in any environment where these were never set.
  if (!apiKey || !from) {
    devLog('[LeadAlert] RESEND_API_KEY or LEAD_ALERT_FROM unset — skipping', input.subject)
    return false
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: input.to, subject: input.subject, text: input.text }),
  })

  if (!response.ok) {
    // Body, not just status: Resend returns the actual reason (unverified
    // domain, bad key), and without it every failure looks the same.
    devError('[LeadAlert] send failed', response.status, await response.text().catch(() => ''))
    return false
  }

  return true
}

/** Fires when a lead is created for the first time, never on later edits. */
export async function notifyNewLead(input: {
  clientWorkspaceId: string
  name?: string | null
  email?: string | null
  phone?: string | null
  /** What the visitor said in the turn that produced the contact details. */
  message?: string | null
}): Promise<void> {
  try {
    const recipients = await recipientsFor(input.clientWorkspaceId)
    if (!recipients) return

    const contact = [input.email, input.phone].filter(Boolean).join(' · ')
    const who = input.name?.trim() || 'A visitor'

    // A prospect leaving their details inside a demo you sent them is not a
    // lead for a client — it is the prospect raising their hand at you. Same
    // urgency, different meaning, so it must not look identical in an inbox.
    const demo = recipients.isProspectDemo

    await send({
      to: recipients.to,
      // The contact detail goes in the subject line: this gets read on a phone
      // lock screen, and the whole point is acting on it without opening
      // anything.
      subject: demo
        ? `${recipients.clientName} left details in the demo you sent — ${contact}`
        : `New lead for ${recipients.clientName} — ${contact}`,
      text: [
        demo
          ? `${who} used the demo you built for ${recipients.clientName} and left their details. They are interested — follow up now, while it is in front of them.`
          : `${who} left their details on ${recipients.clientName}'s website.`,
        '',
        input.name ? `Name:  ${input.name}` : null,
        input.email ? `Email: ${input.email}` : null,
        input.phone ? `Phone: ${input.phone}` : null,
        '',
        input.message ? `They asked:\n"${input.message.slice(0, 400)}"` : null,
        '',
        `${demo ? 'Demo' : 'Full conversation'}: ${APP_URL}/${demo ? 'demos' : `clients/${recipients.workspaceId}`}`,
      ]
        .filter((line) => line !== null)
        .join('\n'),
    })
  } catch (error) {
    devError('[LeadAlert] notifyNewLead failed:', error)
  }
}

/** Fires when a visitor asks for a specific time. */
export async function notifyBookingRequest(input: {
  clientWorkspaceId: string
  requestedStartAt: Date | null
  rawPreference?: string | null
  email?: string | null
  phone?: string | null
}): Promise<void> {
  try {
    const recipients = await recipientsFor(input.clientWorkspaceId)
    if (!recipients) return

    const when = input.requestedStartAt
      ? input.requestedStartAt.toUTCString()
      : (input.rawPreference ?? 'no specific time given')

    await send({
      to: recipients.to,
      subject: `Appointment requested for ${recipients.clientName} — ${when}`,
      text: [
        `Someone asked to book time with ${recipients.clientName}.`,
        '',
        `Requested: ${when}`,
        input.email ? `Email:     ${input.email}` : null,
        input.phone ? `Phone:     ${input.phone}` : null,
        '',
        // Said plainly because the data model means it: nothing in ChatDock
        // confirms a booking, and an alert that implied otherwise would have
        // someone miss an appointment.
        'This is a request, not a confirmed booking. Nothing has been sent to',
        'the customer — call or email them to confirm.',
        '',
        `Details: ${APP_URL}/clients/${recipients.workspaceId}`,
      ]
        .filter((line) => line !== null)
        .join('\n'),
    })
  } catch (error) {
    devError('[LeadAlert] notifyBookingRequest failed:', error)
  }
}
