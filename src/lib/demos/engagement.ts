import 'server-only'

import { createHash } from 'node:crypto'

import { client } from '@/lib/prisma'
import { devError } from '@/lib/utils'

/**
 * Prospect-demo engagement.
 *
 * Answers the only question an agency has after sending a link — *did they
 * open it?* — without polluting conversation analytics with rows that are not
 * conversations.
 *
 * Everything here is written from an unauthenticated public page, so the token
 * is the only credential and nothing the caller sends is trusted beyond it.
 * The deployment id is resolved from the token server-side; an unknown or
 * revoked token records nothing at all rather than creating a row that says a
 * demo was opened when it was not.
 */

export type EngagementEvent = 'opened' | 'conversation_started' | 'cta_clicked'

const EVENTS: EngagementEvent[] = ['opened', 'conversation_started', 'cta_clicked']

export function isEngagementEvent(value: unknown): value is EngagementEvent {
  return typeof value === 'string' && EVENTS.includes(value as EngagementEvent)
}

/**
 * A per-day salted hash, not an IP.
 *
 * Enough to tell two openings apart on the same afternoon, useless as a
 * long-term identifier for the prospect's staff — which is the right trade for
 * a page their employees open without ever agreeing to anything.
 */
function hashIp(ip: string | null): string | null {
  if (!ip) return null
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256').update(`${day}:${ip}`).digest('hex').slice(0, 32)
}

/**
 * Records one engagement event against the deployment a share token names.
 *
 * Never throws: analytics failing must not take down the page a prospect is
 * looking at.
 */
export async function recordDemoEngagement(input: {
  shareToken: string
  eventType: EngagementEvent
  anonymousId?: string | null
  ip?: string | null
  userAgent?: string | null
  metadata?: Record<string, unknown>
}): Promise<boolean> {
  try {
    if (!input.shareToken || !isEngagementEvent(input.eventType)) return false

    const deployment = await client.assistantDeployment.findFirst({
      where: {
        shareToken: input.shareToken,
        deploymentType: 'shareable_demo',
        status: 'active',
      },
      select: { id: true, expiresAt: true },
    })
    // An expired link is still a real link someone clicked, and knowing the
    // prospect opened it three days late is worth recording. A revoked or
    // unknown one is not.
    if (!deployment) return false

    await client.deploymentEngagementEvent.create({
      data: {
        deploymentId: deployment.id,
        eventType: input.eventType,
        anonymousId: input.anonymousId?.slice(0, 128) ?? null,
        ipHash: hashIp(input.ip ?? null),
        userAgent: input.userAgent?.slice(0, 512) ?? null,
        metadata: (input.metadata ?? {}) as never,
      },
    })

    return true
  } catch (error) {
    devError('[Demos] recordDemoEngagement failed:', error)
    return false
  }
}
