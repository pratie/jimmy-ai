'use server'

import nodemailer from 'nodemailer'

import { client } from '@/lib/prisma'
import { accessibleWorkspaceIds, requireTenantContext, requireWorkspace } from '@/lib/tenant'
import { AuthorizationError } from '@/lib/permissions'

/**
 * Leads surface.
 *
 * The sidebar labels this route "Leads", and that is what it actually is — the
 * `Campaign` bulk-email model behind the old version was template scaffolding
 * that never served the agency use case, and it is not part of the rebuilt data
 * model.
 *
 * What survives is the useful half: reading captured leads and their
 * qualification answers across the clients the caller may see, plus a one-to-one
 * follow-up email. Bulk campaign sending is removed rather than stubbed — a
 * function that silently does nothing is worse than one that does not exist.
 */

/** Every lead across the caller's accessible clients. */
export const onGetAllCustomers = async () => {
  try {
    const ctx = await requireTenantContext()
    const workspaceIds = await accessibleWorkspaceIds(ctx)
    if (workspaceIds.length === 0) return { customer: [] }

    const leads = await client.lead.findMany({
      where: { clientWorkspaceId: { in: workspaceIds }, archivedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        qualificationStatus: true,
        createdAt: true,
        clientWorkspace: { select: { id: true, name: true, businessName: true } },
      },
    })

    return {
      // Shape retained for the existing UI.
      customer: leads.map((lead) => ({
        id: lead.id,
        email: lead.email,
        name: lead.name,
        phone: lead.phone,
        status: lead.status,
        createdAt: lead.createdAt,
        Domain: lead.clientWorkspace,
      })),
    }
  } catch (error) {
    console.error('[Leads] onGetAllCustomers failed:', error)
    return { customer: [] }
  }
}

/** A lead's answers to the qualifying questions. */
export const onGetAllCustomerResponses = async (leadId: string) => {
  try {
    const ctx = await requireTenantContext()
    const workspaceIds = await accessibleWorkspaceIds(ctx)

    const lead = await client.lead.findFirst({
      where: { id: leadId, clientWorkspaceId: { in: workspaceIds } },
      select: {
        id: true,
        fieldValues: {
          orderBy: { fieldDefinition: { displayOrder: 'asc' } },
          select: {
            valueText: true,
            valueNumber: true,
            valueBoolean: true,
            valueDate: true,
            fieldDefinition: { select: { label: true } },
          },
        },
      },
    })
    if (!lead) return undefined

    return lead.fieldValues.map((value) => ({
      question: value.fieldDefinition.label,
      answered:
        value.valueText ??
        value.valueNumber?.toString() ??
        (value.valueBoolean === null || value.valueBoolean === undefined
          ? null
          : value.valueBoolean
            ? 'Yes'
            : 'No') ??
        value.valueDate?.toISOString() ??
        null,
    }))
  } catch (error) {
    console.error('[Leads] onGetAllCustomerResponses failed:', error)
    return undefined
  }
}

/** Leads for one client workspace. */
export const onGetWorkspaceLeads = async (workspaceId: string) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'viewLeads')

    return await client.lead.findMany({
      where: { clientWorkspaceId: access.clientWorkspaceId, archivedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        qualificationStatus: true,
        source: true,
        createdAt: true,
        assignedToUserId: true,
      },
    })
  } catch (error) {
    if (error instanceof AuthorizationError) return []
    console.error('[Leads] onGetWorkspaceLeads failed:', error)
    return []
  }
}

export const onUpdateLeadStatus = async (
  leadId: string,
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'closed' | 'spam'
) => {
  try {
    const ctx = await requireTenantContext()
    const workspaceIds = await accessibleWorkspaceIds(ctx)

    const lead = await client.lead.findFirst({
      where: { id: leadId, clientWorkspaceId: { in: workspaceIds } },
      select: { id: true, clientWorkspaceId: true },
    })
    if (!lead) return { status: 404, message: 'Lead not found' }

    await requireWorkspace(lead.clientWorkspaceId, 'manageLeads')
    await client.lead.update({ where: { id: lead.id }, data: { status } })

    return { status: 200, message: 'Lead updated' }
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: 403, message: error.message }
    console.error('[Leads] onUpdateLeadStatus failed:', error)
    return { status: 400, message: 'Could not update the lead' }
  }
}

/**
 * One-to-one follow-up email to a captured lead.
 *
 * Deliberately not a bulk sender. These addresses belong to a client's end
 * customers who spoke to an assistant — they did not opt into marketing from
 * the agency, let alone from ChatDock. Sending in bulk here would be a consent
 * problem, not a feature. Consent status is checked before every send.
 */
export const onSendLeadFollowUp = async (leadId: string, subject: string, body: string) => {
  try {
    const ctx = await requireTenantContext()
    const workspaceIds = await accessibleWorkspaceIds(ctx)

    const lead = await client.lead.findFirst({
      where: { id: leadId, clientWorkspaceId: { in: workspaceIds } },
      select: { id: true, email: true, clientWorkspaceId: true, consentStatus: true },
    })
    if (!lead?.email) return { status: 400, message: 'This lead has no email address' }
    if (lead.consentStatus === 'denied' || lead.consentStatus === 'withdrawn') {
      return { status: 403, message: 'This lead has not consented to being contacted' }
    }

    await requireWorkspace(lead.clientWorkspaceId, 'manageLeads')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: process.env.NODE_MAILER_EMAIL,
      to: lead.email,
      subject,
      text: body,
    })

    await client.lead.update({ where: { id: lead.id }, data: { status: 'contacted' } })
    return { status: 200, message: 'Email sent' }
  } catch (error) {
    console.error('[Leads] onSendLeadFollowUp failed:', error)
    return { status: 400, message: 'Could not send the email' }
  }
}
