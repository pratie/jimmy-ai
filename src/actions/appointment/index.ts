'use server'

import { client } from '@/lib/prisma'
import { accessibleWorkspaceIds, requireTenantContext, requireWorkspace } from '@/lib/tenant'
import { AuthorizationError } from '@/lib/permissions'

/**
 * Booking requests.
 *
 * Named "request" throughout on purpose: without a calendar integration
 * ChatDock only ever collects a *preferred* time. Nothing here may create a row
 * in `confirmed` state, because nobody has checked a calendar — showing a client
 * a confirmed appointment we never confirmed is the kind of claim that loses the
 * account.
 */

/** Lead + its qualifying answers, for the booking screen. */
export const onDomainCustomerResponses = async (leadId: string) => {
  try {
    const ctx = await requireTenantContext()
    const workspaceIds = await accessibleWorkspaceIds(ctx)

    const lead = await client.lead.findFirst({
      where: { id: leadId, clientWorkspaceId: { in: workspaceIds } },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        fieldValues: {
          select: {
            valueText: true,
            valueNumber: true,
            valueBoolean: true,
            valueDate: true,
            fieldDefinition: { select: { label: true, key: true, fieldType: true } },
          },
        },
      },
    })
    if (!lead) return undefined

    return {
      email: lead.email,
      name: lead.name,
      phone: lead.phone,
      questions: lead.fieldValues.map((value) => ({
        question: value.fieldDefinition.label,
        answered:
          value.valueText ??
          value.valueNumber?.toString() ??
          (value.valueBoolean === null ? null : value.valueBoolean ? 'Yes' : 'No') ??
          value.valueDate?.toISOString() ??
          null,
      })),
    }
  } catch (error) {
    console.error('[Appointment] onDomainCustomerResponses failed:', error)
    return undefined
  }
}

export const onGetAllDomainBookings = async (workspaceId: string) => {
  try {
    const { access } = await requireWorkspace(workspaceId, 'viewBookings')

    const bookings = await client.bookingRequest.findMany({
      where: { clientWorkspaceId: access.clientWorkspaceId },
      orderBy: { requestedStartAt: 'asc' },
      select: {
        id: true,
        status: true,
        requestedStartAt: true,
        confirmedStartAt: true,
        timezone: true,
        email: true,
        phone: true,
        notes: true,
        lead: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    return bookings.map((b) => ({
      ...b,
      // Legacy field names the current UI reads.
      date: b.confirmedStartAt ?? b.requestedStartAt,
      slot: b.requestedStartAt?.toISOString() ?? '',
    }))
  } catch (error) {
    if (error instanceof AuthorizationError) return []
    console.error('[Appointment] onGetAllDomainBookings failed:', error)
    return []
  }
}

/**
 * Records a visitor's requested time.
 *
 * Public path — called from the widget, so there is no signed-in actor. The
 * tenant is derived from the lead, never from a caller-supplied workspace id.
 */
export const onBookNewAppointment = async (
  _workspaceId: string,
  leadId: string,
  slot: string,
  date: string,
  email: string
) => {
  try {
    const lead = await client.lead.findUnique({
      where: { id: leadId },
      select: { id: true, clientWorkspaceId: true, assistantId: true, phone: true },
    })
    if (!lead) return { status: 404, message: 'Lead not found' }

    const requestedStartAt = parseSlot(date, slot)

    await client.bookingRequest.create({
      data: {
        // Derived from the lead — a workspace id from the request is untrusted.
        clientWorkspaceId: lead.clientWorkspaceId,
        assistantId: lead.assistantId,
        leadId: lead.id,
        status: 'requested',
        requestedStartAt,
        email: email || null,
        phone: lead.phone,
        notes: requestedStartAt ? null : `Unparsed preference: ${date} ${slot}`,
      },
    })

    return { status: 200, message: 'Booking requested' }
  } catch (error) {
    console.error('[Appointment] onBookNewAppointment failed:', error)
    return { status: 400, message: 'Could not record the booking request' }
  }
}

/**
 * Best-effort date parse. An unparseable preference is preserved verbatim in
 * `notes` rather than silently dropped or coerced to a wrong time.
 */
function parseSlot(date: string, slot: string): Date | null {
  const candidates = [`${date} ${slot}`, date, slot]
  for (const candidate of candidates) {
    const parsed = new Date(candidate)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return null
}

/** Stores a visitor's answers to the qualifying questions. */
export const saveAnswers = async (answers: Record<string, string>, leadId: string) => {
  try {
    const lead = await client.lead.findUnique({
      where: { id: leadId },
      select: { id: true, clientWorkspaceId: true },
    })
    if (!lead) return { status: 404, message: 'Lead not found' }

    for (const [key, value] of Object.entries(answers)) {
      const definition = await client.leadFieldDefinition.findFirst({
        where: { clientWorkspaceId: lead.clientWorkspaceId, key },
        select: { id: true },
      })
      if (!definition) continue

      // Upsert per (lead, field): answers belong to the lead, not to the shared
      // question. The old model wrote onto the question itself, so each new
      // visitor overwrote the previous one's answer.
      await client.leadFieldValue.upsert({
        where: { leadId_fieldDefinitionId: { leadId: lead.id, fieldDefinitionId: definition.id } },
        create: { leadId: lead.id, fieldDefinitionId: definition.id, valueText: value },
        update: { valueText: value },
      })
    }

    return { status: 200, message: 'Responses saved' }
  } catch (error) {
    console.error('[Appointment] saveAnswers failed:', error)
    return { status: 400, message: 'Could not save responses' }
  }
}

/** All booking requests across the caller's accessible clients. */
export const onGetAllBookingsForCurrentUser = async (_clerkId?: string) => {
  try {
    const ctx = await requireTenantContext()
    const workspaceIds = await accessibleWorkspaceIds(ctx)
    if (workspaceIds.length === 0) return { bookings: [] }

    const bookings = await client.bookingRequest.findMany({
      where: { clientWorkspaceId: { in: workspaceIds } },
      orderBy: { requestedStartAt: 'asc' },
      select: {
        id: true,
        status: true,
        requestedStartAt: true,
        confirmedStartAt: true,
        email: true,
        phone: true,
        timezone: true,
        clientWorkspace: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true, email: true } },
      },
    })

    return {
      bookings: bookings.map((b) => ({
        ...b,
        date: b.confirmedStartAt ?? b.requestedStartAt,
        slot: b.requestedStartAt?.toISOString() ?? '',
        Customer: b.lead,
        Domain: b.clientWorkspace,
      })),
    }
  } catch (error) {
    console.error('[Appointment] onGetAllBookingsForCurrentUser failed:', error)
    return { bookings: [] }
  }
}

export const getUserAppointments = async () => {
  try {
    const ctx = await requireTenantContext()
    const workspaceIds = await accessibleWorkspaceIds(ctx)
    if (workspaceIds.length === 0) return 0
    return await client.bookingRequest.count({
      where: { clientWorkspaceId: { in: workspaceIds } },
    })
  } catch (error) {
    console.error('[Appointment] getUserAppointments failed:', error)
    return 0
  }
}
