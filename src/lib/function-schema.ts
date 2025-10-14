// OpenAI function calling schema for chatbot actions
// Replaces text-based markers like (realtime) and (complete)

export const CONVERSATION_FUNCTION = {
  name: 'handle_conversation',
  description: 'Process conversation with structured actions to handle user interactions',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The clean message to display to the user (no markers or system text)',
      },
      actions: {
        type: 'array',
        description: 'Actions to perform based on conversation context',
        items: {
          type: 'string',
          enum: [
            'escalate_to_human',
            'mark_question_answered',
            'send_booking_link',
            'send_payment_link',
          ],
        },
      },
    },
    required: ['message', 'actions'],
  },
} as const

export const ACTION_DESCRIPTIONS = {
  escalate_to_human: `Transfer to human agent. Use when:
    - Answer not found in knowledge base
    - User requests human support
    - Needs account/billing access
    - Abusive or unsafe content
    - Legal/policy questions beyond KB
    - Technical issues not documented`,

  mark_question_answered: `Mark that you just asked a qualification question. Use when:
    - You asked ANY qualification question from the list
    - Next user message should be saved as the answer
    - Used for lead qualification tracking`,

  send_booking_link: `Include appointment booking link. Use when:
    - User agrees to schedule/book a call
    - User shows interest in meeting
    - You propose booking as next step`,

  send_payment_link: `Include payment/checkout link. Use when:
    - User wants to buy/purchase
    - User agrees to checkout
    - You propose payment as next step`,
}

// Type for parsed function call response
export interface ConversationAction {
  message: string
  actions: Array<
    | 'escalate_to_human'
    | 'mark_question_answered'
    | 'send_booking_link'
    | 'send_payment_link'
  >
}
