import 'server-only'

import { client } from '@/lib/prisma'
import { checkEntitlement } from '@/lib/entitlements'

/**
 * Public widget request resolution.
 *
 * This is the security boundary for the only unauthenticated write path in the
 * product. Everything a public chat request is allowed to do is decided here.
 *
 * What the old endpoint did: took a `domainId` from the request body, looked it
 * up, and answered. Any leaked or guessed domain id was a working API key with
 * no expiry, no revocation and no origin check — and the raw id was already
 * exposed on the public `/preview/[domainId]` route.
 *
 * What happens now: the caller presents an `AssistantDeployment.publicKey`,
 * which is random, rotatable and revocable. Resolution then verifies the whole
 * chain — deployment active and unexpired, assistant published, organization
 * not suspended, request origin allowed, and the plan's message allowance not
 * exhausted — before a single token is spent.
 */

export type WidgetResolution =
  | { ok: true; context: WidgetContext }
  | { ok: false; status: number; code: string; message: string }

export type WidgetContext = {
  deploymentId: string
  assistantId: string
  /**
   * The assistant id to scope RETRIEVAL by — `assistantId` when this assistant
   * has knowledge sources linked to it, and `null` when it has none.
   *
   * `match_knowledge_chunks_scoped` reads an assistant id as "only the sources
   * explicitly enabled for this assistant". An assistant with zero links
   * therefore matches zero chunks, which is how every workspace created through
   * the app answered from an empty knowledge base while its dashboard showed a
   * fully indexed one. Passing null degrades to workspace-wide retrieval — the
   * correct reading of "no subset has been chosen" — so a path that forgets to
   * write the link costs nothing.
   */
  retrievalAssistantId: string | null
  clientWorkspaceId: string
  organizationId: string
  channel: 'web_chat' | 'preview' | 'shareable_demo'
  assistant: {
    name: string
    welcomeMessage: string | null
    fallbackMessage: string | null
    systemInstructions: string | null
    mode: string
    brandTone: string | null
    language: string
    modelProvider: string
    modelName: string
    temperature: number
    leadCaptureEnabled: boolean
    bookingEnabled: boolean
    humanHandoffEnabled: boolean
    citationsEnabled: boolean
    behaviorSettings: unknown
  }
  hideChatDockBranding: boolean
}

const CHANNEL_BY_DEPLOYMENT: Record<string, WidgetContext['channel']> = {
  website_widget: 'web_chat',
  preview: 'preview',
  shareable_demo: 'shareable_demo',
}

/** Normalises an Origin/Referer header to a bare hostname. */
function hostOf(value: string | null): string | null {
  if (!value) return null
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * @param key   `publicKey` for a widget/preview, or `shareToken` for a demo link.
 * @param origin the request's Origin or Referer header.
 */
export async function resolveWidgetRequest(
  key: string,
  origin: string | null
): Promise<WidgetResolution> {
  if (!key) {
    return { ok: false, status: 400, code: 'missing_key', message: 'Missing deployment key' }
  }

  const deployment = await client.assistantDeployment.findFirst({
    where: { OR: [{ publicKey: key }, { shareToken: key }] },
    select: {
      id: true,
      status: true,
      expiresAt: true,
      deploymentType: true,
      allowedDomains: true,
      assistant: {
        select: {
          id: true,
          name: true,
          status: true,
          deletedAt: true,
          welcomeMessage: true,
          fallbackMessage: true,
          systemInstructions: true,
          mode: true,
          brandTone: true,
          language: true,
          modelProvider: true,
          modelName: true,
          temperature: true,
          leadCaptureEnabled: true,
          bookingEnabled: true,
          humanHandoffEnabled: true,
          citationsEnabled: true,
          behaviorSettings: true,
          // One row is all the question needs answering: "does this assistant
          // have any source subset at all?" Folded into the resolution query so
          // the guard costs no extra round trip on the hot path.
          knowledgeSourceLinks: {
            where: { enabled: true, knowledgeSource: { deletedAt: null } },
            select: { id: true },
            take: 1,
          },
          clientWorkspace: {
            select: {
              id: true,
              status: true,
              deletedAt: true,
              expiresAt: true,
              workspaceType: true,
              organization: {
                select: { id: true, status: true, deletedAt: true, hideChatDockBranding: true },
              },
            },
          },
        },
      },
      website: { select: { canonicalDomain: true, allowedWidgetDomains: true, status: true } },
    },
  })

  if (!deployment) {
    // Deliberately indistinguishable from a revoked key: telling a prober which
    // keys exist turns this into an enumeration oracle.
    return { ok: false, status: 404, code: 'unknown_deployment', message: 'Assistant not found' }
  }

  if (deployment.status !== 'active') {
    return { ok: false, status: 403, code: 'deployment_inactive', message: 'This assistant is not active' }
  }

  if (deployment.expiresAt && deployment.expiresAt < new Date()) {
    return { ok: false, status: 410, code: 'deployment_expired', message: 'This link has expired' }
  }

  const assistant = deployment.assistant
  if (!assistant || assistant.deletedAt) {
    return { ok: false, status: 404, code: 'unknown_assistant', message: 'Assistant not found' }
  }

  // A draft assistant is reachable from preview, never from a live website.
  if (assistant.status !== 'published' && deployment.deploymentType === 'website_widget') {
    return { ok: false, status: 403, code: 'assistant_unpublished', message: 'This assistant is not published' }
  }

  const workspace = assistant.clientWorkspace
  if (!workspace || workspace.deletedAt || workspace.status === 'archived') {
    return { ok: false, status: 404, code: 'workspace_unavailable', message: 'Assistant not found' }
  }

  if (workspace.expiresAt && workspace.expiresAt < new Date()) {
    return { ok: false, status: 410, code: 'demo_expired', message: 'This demo has expired' }
  }

  const organization = workspace.organization
  if (!organization || organization.deletedAt) {
    return { ok: false, status: 404, code: 'org_unavailable', message: 'Assistant not found' }
  }
  if (organization.status === 'suspended') {
    return {
      ok: false,
      status: 403,
      code: 'org_suspended',
      message: 'This assistant is temporarily unavailable',
    }
  }

  // Origin allow-list. Only enforced for real website widgets: previews and
  // shared demo links are opened from anywhere by design.
  if (deployment.deploymentType === 'website_widget') {
    const allowed = new Set(
      [
        ...(deployment.allowedDomains ?? []),
        ...(deployment.website?.allowedWidgetDomains ?? []),
        deployment.website?.canonicalDomain,
      ]
        .filter(Boolean)
        .map((d) => String(d).toLowerCase().replace(/^www\./, ''))
    )

    const requestHost = hostOf(origin)
    // An empty allow-list means "not configured yet" and stays permissive; a
    // configured list is enforced. Failing closed on an unconfigured widget
    // would break every existing install on deploy.
    if (allowed.size > 0 && requestHost && !allowed.has(requestHost)) {
      return {
        ok: false,
        status: 403,
        code: 'origin_not_allowed',
        message: 'This assistant is not authorised for this website',
      }
    }
  }

  // Plan allowance. Checked before any model call, so an exhausted plan costs
  // nothing rather than being discovered after the spend.
  const messages = await checkEntitlement(organization.id, 'monthly_messages', 1)
  if (!messages.allowed) {
    return {
      ok: false,
      status: 429,
      code: 'message_limit_reached',
      message:
        'This assistant has reached its monthly message limit. Please contact the website owner.',
    }
  }

  return {
    ok: true,
    context: {
      deploymentId: deployment.id,
      assistantId: assistant.id,
      retrievalAssistantId: assistant.knowledgeSourceLinks.length > 0 ? assistant.id : null,
      clientWorkspaceId: workspace.id,
      organizationId: organization.id,
      channel: CHANNEL_BY_DEPLOYMENT[deployment.deploymentType] ?? 'web_chat',
      assistant: {
        name: assistant.name,
        welcomeMessage: assistant.welcomeMessage,
        fallbackMessage: assistant.fallbackMessage,
        systemInstructions: assistant.systemInstructions,
        mode: assistant.mode,
        brandTone: assistant.brandTone,
        language: assistant.language,
        modelProvider: assistant.modelProvider,
        modelName: assistant.modelName,
        temperature: assistant.temperature,
        leadCaptureEnabled: assistant.leadCaptureEnabled,
        bookingEnabled: assistant.bookingEnabled,
        humanHandoffEnabled: assistant.humanHandoffEnabled,
        citationsEnabled: assistant.citationsEnabled,
        behaviorSettings: assistant.behaviorSettings,
      },
      hideChatDockBranding: organization.hideChatDockBranding,
    },
  }
}

/**
 * In-process sliding-window rate limiter.
 *
 * The public chat endpoint had NO limit at all: unauthenticated, and a paid LLM
 * call per request. This closes the obvious hole.
 *
 * Honest limitation: process-local, so it does not hold across serverless
 * instances. It stops casual abuse, not a distributed attack. Move to Redis or
 * an edge limiter before serious traffic — tracked in docs/rebuild/STATUS.md.
 */
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20
const buckets = new Map<string, number[]>()

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const recent = (buckets.get(identifier) ?? []).filter((t) => now - t < WINDOW_MS)

  if (recent.length >= MAX_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000)
    buckets.set(identifier, recent)
    return { allowed: false, retryAfterSeconds }
  }

  recent.push(now)
  buckets.set(identifier, recent)

  // Opportunistic sweep so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= WINDOW_MS)) buckets.delete(k)
    }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}
