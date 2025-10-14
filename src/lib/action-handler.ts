// Action handler for structured chatbot function calls
import { client } from './prisma'
import { devLog, devError } from './utils'

export interface ActionContext {
  chatRoomId: string
  domainId: string
  customerId?: string
  userMessage: string
  appointmentUrl?: string
  paymentUrl?: string
}

export interface ActionResult {
  activatedLiveMode?: boolean
  markedQuestionAnswered?: boolean
  appendedBookingLink?: boolean
  appendedPaymentLink?: boolean
  finalMessage: string
}

/**
 * Handle structured actions from OpenAI function calling
 * Replaces old marker-based detection: (realtime) and (complete)
 */
export async function handleConversationActions(
  actions: string[],
  baseMessage: string,
  context: ActionContext
): Promise<ActionResult> {
  const result: ActionResult = {
    finalMessage: baseMessage,
  }

  for (const action of actions) {
    try {
      switch (action) {
        case 'escalate_to_human':
          await activateLiveMode(context.chatRoomId)
          result.activatedLiveMode = true
          devLog('[Actions] ✅ Activated live mode for human escalation')
          break

        case 'mark_question_answered':
          if (context.customerId) {
            await markQuestionAnswered(context.customerId, context.userMessage)
            result.markedQuestionAnswered = true
            devLog('[Actions] ✅ Marked qualification question as answered')
          } else {
            devLog('[Actions] ⚠️  Skipped mark_question_answered (no customerId)')
          }
          break

        case 'send_booking_link':
          if (context.appointmentUrl) {
            result.finalMessage = appendLink(
              result.finalMessage,
              context.appointmentUrl,
              'Book your appointment'
            )
            result.appendedBookingLink = true
            devLog('[Actions] ✅ Appended booking link')
          }
          break

        case 'send_payment_link':
          if (context.paymentUrl) {
            result.finalMessage = appendLink(
              result.finalMessage,
              context.paymentUrl,
              'Complete payment'
            )
            result.appendedPaymentLink = true
            devLog('[Actions] ✅ Appended payment link')
          }
          break

        default:
          devLog(`[Actions] ⚠️  Unknown action: ${action}`)
      }
    } catch (error) {
      devError(`[Actions] Error handling action ${action}:`, error)
    }
  }

  return result
}

/**
 * Activate live chat mode for human agent handoff
 */
async function activateLiveMode(chatRoomId: string): Promise<void> {
  await client.chatRoom.update({
    where: { id: chatRoomId },
    data: { live: true },
  })
}

/**
 * Mark the next unanswered qualification question as answered
 * Finds first unanswered question and saves user's message as answer
 */
async function markQuestionAnswered(
  customerId: string,
  answer: string
): Promise<void> {
  const firstUnansweredQuestion = await client.customerResponses.findFirst({
    where: {
      customerId,
      answered: null,
    },
    select: {
      id: true,
    },
    orderBy: {
      question: 'asc',
    },
  })

  if (firstUnansweredQuestion) {
    await client.customerResponses.update({
      where: { id: firstUnansweredQuestion.id },
      data: { answered: answer },
    })
  }
}

/**
 * Append a link to the message in a user-friendly way
 */
function appendLink(message: string, url: string, text: string): string {
  return `${message}\n\n👉 [${text}](${url})`
}
