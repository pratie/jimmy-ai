'use server'

import { client } from '@/lib/prisma'
import { extractEmailsFromString, extractURLfromString, devLog, devError } from '@/lib/utils'
import { truncateMarkdown } from '@/lib/firecrawl'
import { buildSystemPrompt } from '@/lib/promptBuilder'
import { onRealTimeChat } from '../conversation'
import { clerkClient } from '@clerk/nextjs/server'
import { onMailer } from '../mailer'
import OpenAi from 'openai'
import { searchKnowledgeBaseWithFallback, formatResultsForPrompt, hasTrainedEmbeddings } from '@/lib/vector-search'

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout to prevent long waits
  maxRetries: 2, // Retry failed requests twice
})

export const onStoreConversations = async (
  id: string,
  message: string,
  role: 'assistant' | 'user'
) => {
  await client.chatRoom.update({
    where: {
      id,
    },
    data: {
      message: {
        create: {
          message,
          role,
        },
      },
    },
  })
}

export const onGetCurrentChatBot = async (id: string) => {
  try {
    const chatbot = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        helpdesk: true,
        name: true,
        icon: true,
        chatBot: {
          select: {
            id: true,
            welcomeMessage: true,
            icon: true,
            textColor: true,
            background: true,
            helpdesk: true,
          },
        },
      },
    })

    if (chatbot) {
      return chatbot
    }
  } catch (error) {
    devError('[Bot] Error fetching chatbot:', error)
  }
}

export const onAiChatBotAssistant = async (
  id: string,
  chat: { role: 'assistant' | 'user'; content: string }[],
  author: 'user',
  message: string,
  anonymousId?: string // UUID from browser localStorage
) => {
  try {
    // Extract email from message (local variable, not module-level)
    let customerEmail: string | undefined
    const extractedEmail = extractEmailsFromString(message)
    if (extractedEmail) {
      customerEmail = extractedEmail[0]
    }

    const chatBotDomain = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        filterQuestions: {
          where: {
            answered: null,
          },
          select: {
            question: true,
          },
        },
        chatBot: {
          select: {
            knowledgeBase: true,
            mode: true,
            brandTone: true,
            language: true,
          },
        },
      },
    })
    if (chatBotDomain) {
      // RAG: Check if embeddings are trained, use vector search if available
      let knowledgeBase: string
      const hasTrained = await hasTrainedEmbeddings(id)

      if (hasTrained) {
        devLog('[Bot] Using RAG vector search for knowledge retrieval')
        const searchResults = await searchKnowledgeBaseWithFallback(message, id, 5)
        knowledgeBase = formatResultsForPrompt(searchResults)
      } else {
        devLog('[Bot] Using fallback: truncated knowledge base')
        knowledgeBase = chatBotDomain.chatBot?.knowledgeBase
          ? truncateMarkdown(chatBotDomain.chatBot.knowledgeBase, 12000)
          : 'No knowledge base available yet. Please ask the customer to provide more details about their inquiry.'
      }

      // Handle anonymous conversations (no email yet)
      if (!customerEmail && anonymousId) {
        // Declare outside try-catch so it's accessible throughout the block
        let anonymousChatRoom

        try {
          // Check if anonymous chat room exists
          anonymousChatRoom = await client.chatRoom.findFirst({
            where: {
              anonymousId: anonymousId,
              domainId: id,
              customerId: null, // Ensure it's still anonymous
            },
            select: {
              id: true,
              live: true,
              mailed: true,
            },
          })

          // Create anonymous chat room if doesn't exist
          if (!anonymousChatRoom) {
            const newChatRoom = await client.chatRoom.create({
              data: {
                anonymousId: anonymousId,
                domainId: id,
              },
              select: {
                id: true,
                live: true,
                mailed: true,
              },
            })
            anonymousChatRoom = newChatRoom
          }

          // Store the message
          await onStoreConversations(
            anonymousChatRoom.id,
            message,
            author
          )
        } catch (error) {
          devError('[Bot] Anonymous chat error:', error)
          return {
            response: {
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please try again in a moment.',
            },
          }
        }

        // Check if live mode is active
        if (anonymousChatRoom.live) {
          onRealTimeChat(
            anonymousChatRoom.id,
            message,
            'user',
            author
          )

          // Send email notification to owner (first time only)
          if (!anonymousChatRoom.mailed) {
            const domainOwner = await client.domain.findUnique({
              where: { id },
              select: {
                User: {
                  select: {
                    clerkId: true,
                  },
                },
              },
            })

            if (domainOwner?.User?.clerkId) {
              const clerk = await clerkClient()
              const user = await clerk.users.getUser(
                domainOwner.User.clerkId
              )
              onMailer(user.emailAddresses[0].emailAddress)

              await client.chatRoom.update({
                where: { id: anonymousChatRoom.id },
                data: { mailed: true },
              })
            }
          }

          return {
            live: true,
            chatRoom: anonymousChatRoom.id,
          }
        }

        // Generate AI response for anonymous user
        const systemPromptNoEmail = buildSystemPrompt({
          businessName: chatBotDomain.name,
          domain: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${id}`,
          knowledgeBase,
          mode: 'QUALIFIER',
          brandTone: chatBotDomain.chatBot?.brandTone || 'friendly, warm, conversational',
          language: chatBotDomain.chatBot?.language || 'en',
          qualificationQuestions: ['What is your email address so I can assist you better?'],
          appointmentUrl: '',
          paymentUrl: '',
          portalBaseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${id}`,
          customerId: '',
        })

        const chatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: systemPromptNoEmail,
            },
            ...chat,
            {
              role: 'user',
              content: message,
            },
          ],
          model: 'gpt-4o-mini',
          max_tokens: 800, // Limit response length to control costs and latency
        })

        if (chatCompletion) {
          const response = {
            role: 'assistant',
            content: chatCompletion.choices[0].message.content,
          }

          // Store AI response
          await onStoreConversations(
            anonymousChatRoom.id,
            `${response.content}`,
            'assistant'
          )

          return { response }
        }
      }

      if (customerEmail) {
        const checkCustomer = await client.domain.findUnique({
          where: {
            id,
          },
          select: {
            User: {
              select: {
                clerkId: true,
              },
            },
            name: true,
            customer: {
              where: {
                email: {
                  startsWith: customerEmail,
                },
              },
              select: {
                id: true,
                email: true,
                questions: true,
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                    mailed: true,
                  },
                },
              },
            },
          },
        })
        if (checkCustomer && !checkCustomer.customer.length) {
          // Check if this user was previously anonymous
          let anonymousChatRoomId: string | undefined
          if (anonymousId) {
            const existingAnonymousChatRoom = await client.chatRoom.findFirst({
              where: {
                anonymousId: anonymousId,
                domainId: id,
                customerId: null,
              },
              select: {
                id: true,
              },
            })
            if (existingAnonymousChatRoom) {
              anonymousChatRoomId = existingAnonymousChatRoom.id
            }
          }

          // Create new customer and link anonymous chat history
          const newCustomer = await client.domain.update({
            where: {
              id,
            },
            data: {
              customer: {
                create: {
                  email: customerEmail,
                  questions: {
                    create: chatBotDomain.filterQuestions,
                  },
                  chatRoom: anonymousChatRoomId
                    ? {
                        // Link existing anonymous chat room to customer
                        connect: { id: anonymousChatRoomId },
                      }
                    : {
                        // Create new chat room if no anonymous history
                        create: {
                          domainId: id,
                        },
                      },
                },
              },
            },
          })

          // Update the anonymous chat room to link it to customer
          if (anonymousChatRoomId) {
            await client.chatRoom.update({
              where: { id: anonymousChatRoomId },
              data: {
                anonymousId: null, // Clear anonymous ID since now linked to customer
              },
            })
          }

          if (newCustomer) {
            devLog('[Bot] New customer created, linked anonymous history')
            const response = {
              role: 'assistant',
              content: `Welcome aboard ${
                customerEmail.split('@')[0]
              }! I'm glad to connect with you. Is there anything you need help with?`,
            }
            return { response }
          }
        }
        if (checkCustomer && checkCustomer.customer[0].chatRoom[0].live) {
          await onStoreConversations(
            checkCustomer?.customer[0].chatRoom[0].id!,
            message,
            author
          )
          
          onRealTimeChat(
            checkCustomer.customer[0].chatRoom[0].id,
            message,
            'user',
            author
          )

          if (!checkCustomer.customer[0].chatRoom[0].mailed) {
            const clerk = await clerkClient()
            const user = await clerk.users.getUser(
              checkCustomer.User?.clerkId!
            )

            onMailer(user.emailAddresses[0].emailAddress)

            //update mail status to prevent spamming
            const mailed = await client.chatRoom.update({
              where: {
                id: checkCustomer.customer[0].chatRoom[0].id,
              },
              data: {
                mailed: true,
              },
            })

            if (mailed) {
              return {
                live: true,
                chatRoom: checkCustomer.customer[0].chatRoom[0].id,
              }
            }
          }
          return {
            live: true,
            chatRoom: checkCustomer.customer[0].chatRoom[0].id,
          }
        }

        await onStoreConversations(
          checkCustomer?.customer[0].chatRoom[0].id!,
          message,
          author
        )

        const systemPrompt = buildSystemPrompt({
          businessName: chatBotDomain.name,
          domain: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${id}`,
          knowledgeBase,
          mode: (chatBotDomain.chatBot?.mode as 'SALES' | 'SUPPORT' | 'QUALIFIER' | 'FAQ_STRICT') || 'SALES',
          brandTone: chatBotDomain.chatBot?.brandTone || 'friendly, concise',
          language: chatBotDomain.chatBot?.language || 'en',
          qualificationQuestions: chatBotDomain.filterQuestions.map((q) => q.question),
          appointmentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${id}/appointment/${checkCustomer?.customer[0].id}`,
          paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${id}/payment/${checkCustomer?.customer[0].id}`,
          portalBaseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${id}`,
          customerId: checkCustomer?.customer[0].id || '',
        })

        const chatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...chat,
            {
              role: 'user',
              content: message,
            },
          ],
          model: 'gpt-4o-mini',
          max_tokens: 800, // Limit response length to control costs and latency
        })

        if (chatCompletion.choices[0].message.content?.includes('(realtime)')) {
          const realtime = await client.chatRoom.update({
            where: {
              id: checkCustomer?.customer[0].chatRoom[0].id,
            },
            data: {
              live: true,
            },
          })

          if (realtime) {
            const response = {
              role: 'assistant',
              content: chatCompletion.choices[0].message.content.replace(
                '(realtime)',
                ''
              ),
            }

            await onStoreConversations(
              checkCustomer?.customer[0].chatRoom[0].id!,
              response.content,
              'assistant'
            )

            return { response }
          }
        }
        if (chat[chat.length - 1].content.includes('(complete)')) {
          const firstUnansweredQuestion =
            await client.customerResponses.findFirst({
              where: {
                customerId: checkCustomer?.customer[0].id,
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
              where: {
                id: firstUnansweredQuestion.id,
              },
              data: {
                answered: message,
              },
            })
          }
        }

        if (chatCompletion) {
          const generatedLink = extractURLfromString(
            chatCompletion.choices[0].message.content as string
          )

          if (generatedLink) {
            const link = generatedLink[0]
            const response = {
              role: 'assistant',
              content: `Great! you can follow the link to proceed`,
              link: link.slice(0, -1),
            }

            await onStoreConversations(
              checkCustomer?.customer[0].chatRoom[0].id!,
              `${response.content} ${response.link}`,
              'assistant'
            )

            return { response }
          }

          const response = {
            role: 'assistant',
            content: chatCompletion.choices[0].message.content,
          }

          await onStoreConversations(
            checkCustomer?.customer[0].chatRoom[0].id!,
            `${response.content}`,
            'assistant'
          )

          return { response }
        }
      }
      devLog('[Bot] No customer email provided')

      const systemPromptNoEmail = buildSystemPrompt({
        businessName: chatBotDomain.name,
        domain: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${id}`,
        knowledgeBase,
        mode: 'QUALIFIER',
        brandTone: chatBotDomain.chatBot?.brandTone || 'friendly, warm, conversational',
        language: chatBotDomain.chatBot?.language || 'en',
        qualificationQuestions: ['What is your email address so I can assist you better?'],
        appointmentUrl: '',
        paymentUrl: '',
        portalBaseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${id}`,
        customerId: '',
      })

      const chatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPromptNoEmail,
          },
          ...chat,
          {
            role: 'user',
            content: message,
          },
        ],
        model: 'gpt-4o-mini',
        max_tokens: 800, // Limit response length to control costs and latency
      })

      if (chatCompletion) {
        const response = {
          role: 'assistant',
          content: chatCompletion.choices[0].message.content,
        }

        return { response }
      }
    }
  } catch (error) {
    devError('[Bot] Error in chatbot assistant:', error)
  }
}
