'use server'

import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'

import { client } from '@/lib/prisma'
import {
  accessibleWorkspaceIds,
  requireOrganizationPermission,
  requireTenantContext,
  requireWorkspace,
} from '@/lib/tenant'
import { assertEntitlement, EntitlementError, hasFeature } from '@/lib/entitlements'
import { AuthorizationError } from '@/lib/permissions'

/**
 * Workspace and assistant settings.
 *
 * Every action here goes through `requireWorkspace`, which verifies the id
 * belongs to the caller's organization before anything is read or written. The
 * old versions filtered by `clerkId` on a nested relation, which worked but put
 * the tenant check in a different place in every function — easy to forget once.
 *
 * The UI still speaks in terms of "domains" and "chatBot". Rather than rewrite
 * fourteen consumer files at once, the read actions project the new models into
 * those shapes (see `toLegacyWorkspaceShape`). The projection is a temporary
 * seam for the Phase 8 frontend redesign, not a permanent contract.
 */

/* ── Shape adapters ─────────────────────────────────────────────────────── */

const assistantSelect = {
  id: true,
  name: true,
  welcomeMessage: true,
  fallbackMessage: true,
  mode: true,
  brandTone: true,
  language: true,
  modelName: true,
  modelProvider: true,
  temperature: true,
  status: true,
  citationsEnabled: true,
  leadCaptureEnabled: true,
  bookingEnabled: true,
  humanHandoffEnabled: true,
  behaviorSettings: true,
  brandingSettings: true,
} satisfies Prisma.AssistantSelect

type AssistantRow = Prisma.AssistantGetPayload<{ select: typeof assistantSelect }>

/** Projects an Assistant into the `chatBot` shape the current UI expects. */
function toLegacyChatBot(assistant: AssistantRow | undefined | null) {
  if (!assistant) return null
  const branding = (assistant.brandingSettings ?? {}) as Record<string, unknown>
  const behavior = (assistant.behaviorSettings ?? {}) as Record<string, unknown>

  return {
    id: assistant.id,
    welcomeMessage: assistant.welcomeMessage,
    icon: (branding.icon as string) ?? null,
    background: (branding.background as string) ?? null,
    textColor: (branding.textColor as string) ?? null,
    theme: (branding.theme as Prisma.JsonValue) ?? null,
    mode: assistant.mode,
    brandTone: assistant.brandTone,
    language: assistant.language,
    llmModel: assistant.modelName,
    llmTemperature: assistant.temperature,
    modePrompts: (behavior.modePrompts as Prisma.JsonValue) ?? null,
    helpdesk: false,
  }
}

/* ── Workspaces ─────────────────────────────────────────────────────────── */

/**
 * Creates a client workspace, its primary website and a draft assistant.
 *
 * Kept under the old name because the onboarding CTA still calls it, but the
 * unit created is a ClientWorkspace, not a Domain.
 */
export const onIntegrateDomain = async (domain: string, icon: string) => {
  try {
    const ctx = await requireOrganizationPermission('createClientWorkspace')

    const url = domain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    if (!url) return { status: 400, message: 'A website address is required' }

    const canonicalDomain = url.split('/')[0].toLowerCase()
    const slug = canonicalDomain.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    const duplicate = await client.clientWorkspace.findFirst({
      where: { organizationId: ctx.organizationId, slug, deletedAt: null },
      select: { id: true },
    })
    if (duplicate) return { status: 400, message: 'That client already exists' }

    await assertEntitlement(ctx.organizationId, 'maximum_client_workspaces')
    await assertEntitlement(ctx.organizationId, 'maximum_assistants')

    const created = await client.$transaction(async (tx) => {
      const workspace = await tx.clientWorkspace.create({
        data: {
          organizationId: ctx.organizationId,
          name: canonicalDomain,
          slug,
          businessName: canonicalDomain,
          websiteUrl: `https://${canonicalDomain}`,
          logoUrl: icon || null,
          workspaceType: 'active_client',
          createdByUserId: ctx.userId,
        },
      })

      await tx.website.create({
        data: {
          clientWorkspaceId: workspace.id,
          name: 'Primary website',
          url: `https://${canonicalDomain}`,
          canonicalDomain,
          isPrimary: true,
          allowedWidgetDomains: [canonicalDomain, `www.${canonicalDomain}`],
        },
      })

      await tx.assistant.create({
        data: {
          clientWorkspaceId: workspace.id,
          name: `${canonicalDomain} receptionist`,
          slug: 'receptionist',
          welcomeMessage: `Hi, how can I help you with ${canonicalDomain}?`,
          fallbackMessage:
            "I can't confirm that from what I have on file. Leave your name and number and someone will follow up.",
          createdByUserId: ctx.userId,
        },
      })

      await tx.organization.update({
        where: { id: ctx.organizationId },
        data: { onboardingStatus: 'first_client_created' },
      })

      return workspace
    })

    return { status: 200, message: 'Client added', id: created.id, name: created.name }
  } catch (error) {
    if (error instanceof EntitlementError) return { status: 402, message: error.message }
    if (error instanceof AuthorizationError) return { status: 403, message: error.message }
    console.error('[Settings] onIntegrateDomain failed:', error)
    return { status: 400, message: 'Could not add the client' }
  }
}

/** Every workspace the caller may see, projected into the legacy shape. */
export const onGetAllAccountDomains = async () => {
  try {
    const ctx = await requireTenantContext()
    const ids = await accessibleWorkspaceIds(ctx)
    if (ids.length === 0) return { id: ctx.userId, domains: [] }

    const workspaces = await client.clientWorkspace.findMany({
      where: { id: { in: ids }, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
        assistants: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: assistantSelect,
        },
        leads: {
          select: {
            id: true,
            email: true,
            conversations: { select: { id: true, handoffStatus: true } },
          },
        },
        knowledgeSources: { select: { syncStatus: true } },
        _count: { select: { knowledgeChunks: true } },
      },
    })

    return {
      id: ctx.userId,
      domains: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        icon: w.logoUrl,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        chatBot: {
          ...toLegacyChatBot(w.assistants[0]),
          knowledgeBaseStatus: w.knowledgeSources[0]?.syncStatus ?? 'never_synced',
          hasEmbeddings: w._count.knowledgeChunks > 0,
        },
        customer: w.leads.map((lead) => ({
          id: lead.id,
          email: lead.email,
          chatRoom: lead.conversations.map((c) => ({
            id: c.id,
            live: c.handoffStatus === 'active',
          })),
        })),
      })),
    }
  } catch (error) {
    console.error('[Settings] onGetAllAccountDomains failed:', error)
    return undefined
  }
}

/**
 * One workspace by id or name. Accepts either because routes are still keyed on
 * the old `[domain]` segment.
 */
export const onGetCurrentDomainInfo = async (domain: string) => {
  try {
    const ctx = await requireTenantContext()
    const ids = await accessibleWorkspaceIds(ctx)
    if (ids.length === 0) return undefined

    const workspace = await client.clientWorkspace.findFirst({
      where: {
        id: { in: ids },
        deletedAt: null,
        OR: [
          ...(isUuid(domain) ? [{ id: domain }] : []),
          { slug: domain },
          { name: { contains: domain, mode: 'insensitive' as const } },
        ],
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        organizationId: true,
        assistants: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: assistantSelect,
        },
        serviceItems: true,
        knowledgeSources: {
          where: { deletedAt: null },
          select: { id: true, syncStatus: true, lastSyncedAt: true, name: true },
        },
      },
    })
    if (!workspace) return undefined

    // Derived, not stored. The old schema kept `knowledgeBaseSizeMB` and
    // `trainingSourcesUsed` as denormalised counters on Domain, which drifted
    // from reality whenever an ingest failed midway. Counting the live rows
    // costs one query and cannot be wrong.
    const storageBytes = await client.knowledgeChunk.aggregate({
      where: { clientWorkspaceId: workspace.id },
      _sum: { tokenCount: true },
    })

    const subscription = await client.subscription.findUnique({
      where: { organizationId: ctx.organizationId },
      select: { plan: { select: { code: true } } },
    })

    return {
      subscription: { plan: subscription?.plan?.code ?? 'FREE' },
      domains: [
        {
          id: workspace.id,
          name: workspace.name,
          icon: workspace.logoUrl,
          userId: ctx.userId,
          products: workspace.serviceItems,
          trainingSourcesUsed: workspace.knowledgeSources.length,
          // ~4 bytes per token is the usual rough conversion; good enough for a
          // usage read-out, and honest about being an estimate.
          knowledgeBaseSizeMB:
            Math.round((((storageBytes._sum.tokenCount ?? 0) * 4) / (1024 * 1024)) * 100) / 100,
          chatBot: {
            ...toLegacyChatBot(workspace.assistants[0]),
            knowledgeBase: null,
            knowledgeBaseStatus: workspace.knowledgeSources[0]?.syncStatus ?? 'never_synced',
            knowledgeBaseUpdatedAt: workspace.knowledgeSources[0]?.lastSyncedAt ?? null,
          },
        },
      ],
    }
  } catch (error) {
    console.error('[Settings] onGetCurrentDomainInfo failed:', error)
    return undefined
  }
}

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

export const onUpdateDomain = async (id: string, name: string) => {
  try {
    await requireWorkspace(id, 'manageClientWorkspace')
    await client.clientWorkspace.update({ where: { id }, data: { name } })
    return { status: 200, message: 'Client updated' }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403, message: error.message }
    console.error('[Settings] onUpdateDomain failed:', error)
    return { status: 400, message: 'Could not update the client' }
  }
}

/** Soft archive. Client data is preserved; only access to it stops. */
export const onDeleteUserDomain = async (id: string) => {
  try {
    await requireWorkspace(id, 'archiveClientWorkspace')
    await client.clientWorkspace.update({
      where: { id },
      data: { status: 'archived', archivedAt: new Date() },
    })
    return { status: 200, message: 'Client archived' }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403, message: error.message }
    console.error('[Settings] onDeleteUserDomain failed:', error)
    return { status: 400, message: 'Could not archive the client' }
  }
}

/* ── Assistant configuration ────────────────────────────────────────────── */

/** Resolves the workspace's primary assistant after checking access. */
async function assistantFor(workspaceId: string, permission: 'editAssistant' | 'manageKnowledge') {
  await requireWorkspace(workspaceId, permission)
  const assistant = await client.assistant.findFirst({
    where: { clientWorkspaceId: workspaceId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, brandingSettings: true, behaviorSettings: true },
  })
  if (!assistant) throw new Error('No assistant for this client')
  return assistant
}

/** Merges into brandingSettings rather than replacing it. */
async function patchBranding(workspaceId: string, patch: Record<string, unknown>) {
  const assistant = await assistantFor(workspaceId, 'editAssistant')
  const current = (assistant.brandingSettings ?? {}) as Record<string, unknown>
  await client.assistant.update({
    where: { id: assistant.id },
    data: { brandingSettings: { ...current, ...patch } as Prisma.InputJsonValue },
  })
}

export const onChatBotImageUpdate = async (id: string, icon: string) => {
  try {
    await patchBranding(id, { icon })
    return { status: 200, message: 'Assistant icon updated' }
  } catch (error) {
    console.error('[Settings] onChatBotImageUpdate failed:', error)
    return { status: 400, message: 'Could not update the icon' }
  }
}

export const onUpdateTheme = async (id: string, theme: Prisma.InputJsonValue) => {
  try {
    await patchBranding(id, { theme })
    return { status: 200, message: 'Appearance updated' }
  } catch (error) {
    console.error('[Settings] onUpdateTheme failed:', error)
    return { status: 400, message: 'Could not update appearance' }
  }
}

export const onUpdateWelcomeMessage = async (message: string, workspaceId: string) => {
  try {
    const assistant = await assistantFor(workspaceId, 'editAssistant')
    await client.assistant.update({
      where: { id: assistant.id },
      data: { welcomeMessage: message },
    })
    return { status: 200, message: 'Welcome message updated' }
  } catch (error) {
    console.error('[Settings] onUpdateWelcomeMessage failed:', error)
    return { status: 400, message: 'Could not update the welcome message' }
  }
}

export const onUpdateBotMode = async (workspaceId: string, mode: string) => {
  try {
    const assistant = await assistantFor(workspaceId, 'editAssistant')
    const normalised = ['sales', 'support', 'faq'].includes(mode.toLowerCase())
      ? (mode.toLowerCase() as 'sales' | 'support' | 'faq')
      : 'sales'
    await client.assistant.update({ where: { id: assistant.id }, data: { mode: normalised } })
    return { status: 200, message: 'Mode updated' }
  } catch (error) {
    console.error('[Settings] onUpdateBotMode failed:', error)
    return { status: 400, message: 'Could not update the mode' }
  }
}

export const onUpdateBrandVoice = async (
  workspaceId: string,
  brandTone: string,
  language: string
) => {
  try {
    const assistant = await assistantFor(workspaceId, 'editAssistant')
    await client.assistant.update({
      where: { id: assistant.id },
      data: { brandTone, language },
    })
    return { status: 200, message: 'Brand voice updated' }
  } catch (error) {
    console.error('[Settings] onUpdateBrandVoice failed:', error)
    return { status: 400, message: 'Could not update the brand voice' }
  }
}

export const onUpdateLlmConfig = async (
  workspaceId: string,
  llmModel: string,
  llmTemperature: number
) => {
  try {
    const assistant = await assistantFor(workspaceId, 'editAssistant')
    await client.assistant.update({
      where: { id: assistant.id },
      data: { modelName: llmModel, temperature: llmTemperature },
    })
    return { status: 200, message: 'Model settings updated' }
  } catch (error) {
    console.error('[Settings] onUpdateLlmConfig failed:', error)
    return { status: 400, message: 'Could not update model settings' }
  }
}

export const onUpdateModePrompts = async (
  workspaceId: string,
  modePrompts: Prisma.InputJsonValue
) => {
  try {
    const assistant = await assistantFor(workspaceId, 'editAssistant')
    const current = (assistant.behaviorSettings ?? {}) as Record<string, unknown>
    await client.assistant.update({
      where: { id: assistant.id },
      data: { behaviorSettings: { ...current, modePrompts } as Prisma.InputJsonValue },
    })
    return { status: 200, message: 'Prompts updated' }
  } catch (error) {
    console.error('[Settings] onUpdateModePrompts failed:', error)
    return { status: 400, message: 'Could not update prompts' }
  }
}

/* ── Lead qualification ─────────────────────────────────────────────────── */

/**
 * Replaces the old `FilterQuestions`, whose `answered` column stored one
 * visitor's answer on the shared question — so the next visitor overwrote it.
 * Questions are definitions now; answers live on the lead.
 */
export const onCreateFilterQuestions = async (workspaceId: string, question: string) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'editAssistant')
    const assistant = await client.assistant.findFirst({
      where: { clientWorkspaceId: workspaceId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })

    const key = question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50)

    const count = await client.leadFieldDefinition.count({
      where: { clientWorkspaceId: access.clientWorkspaceId },
    })

    await client.leadFieldDefinition.create({
      data: {
        clientWorkspaceId: access.clientWorkspaceId,
        assistantId: assistant?.id ?? null,
        key: key || `question_${count + 1}`,
        label: question,
        fieldType: 'text',
        displayOrder: count,
      },
    })

    return { status: 200, message: 'Question added' }
  } catch (error) {
    console.error('[Settings] onCreateFilterQuestions failed:', error)
    return { status: 400, message: 'Could not add the question' }
  }
}

export const onGetAllFilterQuestions = async (workspaceId: string) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'viewClientWorkspace')
    const questions = await client.leadFieldDefinition.findMany({
      where: { clientWorkspaceId: access.clientWorkspaceId, enabled: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, label: true, key: true, fieldType: true, required: true },
    })
    return { status: 200, questions: questions.map((q) => ({ ...q, question: q.label })) }
  } catch (error) {
    console.error('[Settings] onGetAllFilterQuestions failed:', error)
    return { status: 400, questions: [] }
  }
}

/* ── FAQ / help desk ────────────────────────────────────────────────────── */

/**
 * Curated question/answer pairs.
 *
 * The old `HelpDesk` table sat outside the knowledge system, so a hand-written
 * answer was invisible to retrieval. These are now a KnowledgeSource of type
 * `faq` with one document per pair, which means a curated answer is retrievable
 * and citable like any other source — and it counts toward the training-source
 * entitlement, as it should.
 */
async function faqSourceFor(clientWorkspaceId: string, userId: string) {
  const existing = await client.knowledgeSource.findFirst({
    where: { clientWorkspaceId, sourceType: 'faq', deletedAt: null },
    select: { id: true },
  })
  if (existing) return existing

  return client.knowledgeSource.create({
    data: {
      clientWorkspaceId,
      sourceType: 'faq',
      name: 'Curated answers',
      status: 'active',
      syncStatus: 'synced',
      createdByUserId: userId,
      lastSyncedAt: new Date(),
    },
    select: { id: true },
  })
}

export const onCreateHelpDeskQuestion = async (
  workspaceId: string,
  question: string,
  answer: string
) => {
  try {
    const { ctx, access } = await requireWorkspace(workspaceId, 'manageKnowledge')
    const source = await faqSourceFor(access.clientWorkspaceId, ctx.userId)

    await client.knowledgeDocument.create({
      data: {
        knowledgeSourceId: source.id,
        clientWorkspaceId: access.clientWorkspaceId,
        title: question,
        extractedText: `Question: ${question}\nAnswer: ${answer}`,
        status: 'active',
        language: 'en',
        metadata: { kind: 'faq', question, answer },
        lastCrawledAt: new Date(),
      },
    })

    const questions = await listFaqDocuments(access.clientWorkspaceId)
    return { status: 200, message: 'Answer added', questions }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403, message: error.message }
    console.error('[Settings] onCreateHelpDeskQuestion failed:', error)
    return { status: 400, message: 'Could not add the answer' }
  }
}

async function listFaqDocuments(clientWorkspaceId: string) {
  const documents = await client.knowledgeDocument.findMany({
    where: {
      clientWorkspaceId,
      deletedAt: null,
      knowledgeSource: { sourceType: 'faq', deletedAt: null },
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true, metadata: true },
  })

  return documents.map((d) => {
    const meta = (d.metadata ?? {}) as Record<string, unknown>
    return {
      id: d.id,
      question: (meta.question as string) ?? d.title ?? '',
      answer: (meta.answer as string) ?? '',
    }
  })
}

export const onGetAllHelpDeskQuestions = async (workspaceId: string) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'viewClientWorkspace')
    return { status: 200, questions: await listFaqDocuments(access.clientWorkspaceId) }
  } catch (error) {
    console.error('[Settings] onGetAllHelpDeskQuestions failed:', error)
    return { status: 400, questions: [] }
  }
}

/* ── Service catalogue ──────────────────────────────────────────────────── */

export const onCreateNewDomainProduct = async (
  workspaceId: string,
  name: string,
  image: string,
  price: string
) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'manageClientWorkspace')
    const amount = Math.round(parseFloat(price) * 100)

    await client.serviceItem.create({
      data: {
        clientWorkspaceId: access.clientWorkspaceId,
        name,
        imageUrl: image || null,
        // Minor units + explicit currency — never a bare float.
        priceAmountMinor: Number.isFinite(amount) ? amount : null,
        currency: Number.isFinite(amount) ? 'USD' : null,
        pricingType: Number.isFinite(amount) ? 'fixed' : 'quote_required',
      },
    })
    return { status: 200, message: 'Service added' }
  } catch (error) {
    console.error('[Settings] onCreateNewDomainProduct failed:', error)
    return { status: 400, message: 'Could not add the service' }
  }
}

/* ── Organization ───────────────────────────────────────────────────────── */

export const onGetSubscriptionPlan = async () => {
  try {
    const ctx = await requireTenantContext()
    const subscription = await client.subscription.findUnique({
      where: { organizationId: ctx.organizationId },
      select: { plan: { select: { code: true } } },
    })
    return subscription?.plan?.code ?? 'FREE'
  } catch (error) {
    console.error('[Settings] onGetSubscriptionPlan failed:', error)
    return 'FREE'
  }
}

/**
 * Agency white-labelling. Lives on Organization now — the fields were on User
 * before, and had never actually been applied to the production database.
 */
export const onUpdateWhiteLabelSettings = async (values: {
  agencyName?: string
  agencyLogo?: string
  agencyColor?: string
  hideBranding?: boolean
}) => {
  try {
    const ctx = await requireOrganizationPermission('manageOrganization')

    if (values.hideBranding) {
      const allowed = await hasFeature(ctx.organizationId, 'hide_branding')
      if (!allowed) {
        return { status: 402, message: 'Removing ChatDock branding requires the Pro or Business plan' }
      }
    }

    await client.organization.update({
      where: { id: ctx.organizationId },
      data: {
        ...(values.agencyName !== undefined ? { name: values.agencyName } : {}),
        ...(values.agencyLogo !== undefined ? { logoUrl: values.agencyLogo } : {}),
        ...(values.agencyColor !== undefined ? { primaryColor: values.agencyColor } : {}),
        ...(values.hideBranding !== undefined ? { hideChatDockBranding: values.hideBranding } : {}),
      },
    })
    return { status: 200, message: 'Branding updated' }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403, message: error.message }
    console.error('[Settings] onUpdateWhiteLabelSettings failed:', error)
    return { status: 400, message: 'Could not update branding' }
  }
}

export const onGetWhiteLabelSettings = async () => {
  try {
    const ctx = await requireTenantContext()
    const [organization, canHideBranding] = await Promise.all([
      client.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { name: true, logoUrl: true, primaryColor: true, hideChatDockBranding: true },
      }),
      hasFeature(ctx.organizationId, 'hide_branding'),
    ])

    return {
      status: 200,
      settings: {
        agencyName: organization?.name ?? 'ChatDock',
        agencyLogo: organization?.logoUrl ?? null,
        agencyColor: organization?.primaryColor ?? '#0f172a',
        hideBranding: organization?.hideChatDockBranding ?? false,
        canHideBranding,
      },
    }
  } catch (error) {
    console.error('[Settings] onGetWhiteLabelSettings failed:', error)
    return { status: 400, settings: null }
  }
}

export const onUpdatePassword = async (password: string) => {
  try {
    const user = await currentUser()
    if (!user) return null
    const clerk = await clerkClient()
    await clerk.users.updateUser(user.id, { password })
    return { status: 200, message: 'Password updated' }
  } catch (error) {
    console.error('[Settings] onUpdatePassword failed:', error)
    return { status: 400, message: 'Could not update the password' }
  }
}

/** Payment integration status. No provider is connected yet. */
export const onGetPaymentConnected = async () => {
  try {
    const ctx = await requireTenantContext()
    const integration = await client.integration.findFirst({
      where: { organizationId: ctx.organizationId, integrationType: 'crm', status: 'connected' },
      select: { id: true },
    })
    return integration?.id
  } catch {
    return undefined
  }
}
