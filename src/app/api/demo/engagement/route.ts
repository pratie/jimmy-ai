import { NextResponse } from 'next/server'

import { checkRateLimit } from '@/lib/widget/resolve'
import { isEngagementEvent, recordDemoEngagement } from '@/lib/demos/engagement'

export const dynamic = 'force-dynamic'

/**
 * Engagement beacon for a shared prospect demo.
 *
 * A route handler rather than a server action because the page that calls it is
 * public and the call is fire-and-forget — `navigator.sendBeacon` and an
 * unawaited `fetch` both need a plain endpoint.
 *
 * It answers 204 to everything it accepts and 204 to most things it rejects.
 * A caller probing tokens learns nothing from the response; the only signal
 * that matters is written server-side, and an unknown token writes nothing.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      token?: string
      event?: string
      anonymousId?: string
    } | null

    const token = typeof body?.token === 'string' ? body.token : ''
    if (!token || !isEngagementEvent(body?.event)) {
      return new NextResponse(null, { status: 204 })
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip')

    // Same in-process limiter the widget uses. It is not a distributed defence
    // — see the note on `checkRateLimit` — but it stops one open tab from
    // writing an unbounded number of rows.
    if (!checkRateLimit(`demo-engagement:${token}:${ip ?? 'unknown'}`).allowed) {
      return new NextResponse(null, { status: 204 })
    }

    await recordDemoEngagement({
      shareToken: token,
      eventType: body!.event as never,
      anonymousId: typeof body?.anonymousId === 'string' ? body.anonymousId : null,
      ip,
      userAgent: request.headers.get('user-agent'),
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
