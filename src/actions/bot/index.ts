'use server'

import { client } from '@/lib/prisma'
import { extractEmailsFromString, extractURLfromString } from '@/lib/utils'
import { truncateMarkdown } from '@/lib/firecrawl'
import { buildSystemPrompt } from '@/lib/promptBuilder'
import { onRealTimeChat } from '../conversation'
import { clerkClient } from '@clerk/nextjs/server'
import { onMailer } from '../mailer'
import OpenAi from 'openai'

const openai = new OpenAi({
  apiKey: process.env.OPEN_AI_KEY,
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
    console.log(error)
  }
}

let customerEmail: string | undefined

export const onAiChatBotAssistant = async (
  id: string,
  chat: { role: 'assistant' | 'user'; content: string }[],
  author: 'user',
  message: string
) => {
  try {
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
      const extractedEmail = extractEmailsFromString(message)
      if (extractedEmail) {
        customerEmail = extractedEmail[0]
      }

      const knowledgeBase = chatBotDomain.chatBot?.knowledgeBase
        ? truncateMarkdown(chatBotDomain.chatBot.knowledgeBase, 12000)
        : 'No knowledge base available yet. Please ask the customer to provide more details about their inquiry.'

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
                  chatRoom: {
                    create: {},
                  },
                },
              },
            },
          })
          if (newCustomer) {
            console.log('new customer made')
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
            const user = await clerkClient.users.getUser(
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
      console.log('No customer')

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
    console.log(error)
  }
}
