import type { Metadata } from 'next'
import React from 'react'

import DemoStage from '@/components/demos/demo-stage'
import { client } from '@/lib/prisma'
import { resolveWidgetRequest } from '@/lib/widget/resolve'

/**
 * The prospect-facing demo link.
 *
 * An agency mints a `shareable_demo` deployment from a prospect's website and
 * sends this URL. The person who opens it is a stranger who never signed up for
 * anything, so the page carries no product chrome, no auth, and no dashboard
 * vocabulary — it introduces itself, shows a working assistant, and stops.
 *
 * Resolution is the same one the embedded widget uses. It deliberately skips
 * the origin allow-list and the publish gate for this deployment type, so a
 * link forwarded from the prospect's inbox to their colleague still works.
 */

export const metadata: Metadata = {
  title: 'Your AI assistant — a live demo',
  // A demo built for one prospect must never be indexed: the whole page is
  // about a private business, reachable by anyone holding the link.
  robots: { index: false, follow: false },
}

const EXPIRED_CODES = new Set(['deployment_expired', 'demo_expired'])

// The demo is fine and the link is fine — the agency's own plan ran out, or
// their account is suspended. Telling a prospect the demo "expired" would send
// them back to ask for a new link that behaves identically.
const TEMPORARY_CODES = new Set(['message_limit_reached', 'org_suspended'])

type UnavailableReason = 'expired' | 'temporary' | 'gone'

/**
 * The dead-end state.
 *
 * Three variants, and none of them confirms whether the token was ever real —
 * an unknown token and a revoked one read identically on purpose.
 */
function Unavailable({ reason }: { reason: UnavailableReason }) {
  const copy = {
    expired: {
      title: 'This demo has expired',
      body: 'Demo links are only good for a short window. Ask whoever sent it for a fresh link and it will work again.',
    },
    temporary: {
      title: 'This demo is temporarily unavailable',
      body: 'It should be back shortly. Whoever shared it with you will be able to tell you when.',
    },
    gone: {
      title: 'This link is no longer available',
      body: 'The link may have been replaced or turned off. Whoever shared it with you can send a working one.',
    },
  }[reason]

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,.06)]">
        <h1 className="text-lg font-black tracking-tight text-slate-900">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{copy.body}</p>
      </div>
    </main>
  )
}

const Page = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params
  const resolution = await resolveWidgetRequest(token, null)

  if (!resolution.ok) {
    const reason: UnavailableReason = EXPIRED_CODES.has(resolution.code)
      ? 'expired'
      : TEMPORARY_CODES.has(resolution.code)
        ? 'temporary'
        : 'gone'
    return <Unavailable reason={reason} />
  }

  // A widget's `publicKey` also resolves here. It is a valid key, but it is not
  // a demo, and rendering a client's live widget on a public sales page would
  // expose it outside every origin check that key is subject to.
  if (resolution.context.channel !== 'shareable_demo') {
    return <Unavailable reason="gone" />
  }

  const workspace = await client.clientWorkspace.findUnique({
    where: { id: resolution.context.clientWorkspaceId },
    select: { name: true, businessName: true, websiteUrl: true, logoUrl: true, primaryColor: true },
  })

  return (
    <DemoStage
      token={token}
      businessName={workspace?.businessName?.trim() || workspace?.name?.trim() || resolution.context.assistant.name}
      websiteUrl={workspace?.websiteUrl ?? null}
      logoUrl={workspace?.logoUrl ?? null}
      primaryColor={workspace?.primaryColor ?? null}
    />
  )
}

export default Page
