'use server'

import { client } from '@/lib/prisma'
import { currentUser, redirectToSignIn } from '@clerk/nextjs'
import { onGetAllAccountDomains } from '../settings'

export const onCompleteUserRegistration = async (
  fullname: string,
  clerkId: string,
  type: string
) => {
  try {
    const registered = await client.user.create({
      data: {
        fullname,
        clerkId,
        type,
        subscription: {
          create: {},
        },
      },
      select: {
        fullname: true,
        id: true,
        type: true,
      },
    })

    if (registered) {
      return { status: 200, user: registered }
    }
  } catch (error) {
    console.error('Error in onCompleteUserRegistration:', error)
    return { status: 400 }
  }
}

export const onLoginUser = async () => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 401, message: 'No user found' }
    }

    let authenticated = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        fullname: true,
        id: true,
        type: true,
      },
    })

    if (authenticated) {
      const domains = await onGetAllAccountDomains()
      return { status: 200, user: authenticated, domain: domains?.domains }
    } else {
      // Auto-create user for OAuth sign-ins
      const fullname = `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                      user.emailAddresses[0]?.emailAddress.split('@')[0] ||
                      'User'

      try {
        const newUser = await client.user.create({
          data: {
            fullname,
            clerkId: user.id,
            type: 'OWNER',
          },
          select: {
            fullname: true,
            id: true,
            type: true,
          },
        })

        // Create billing record separately to avoid unique constraint issues
        try {
          await client.billings.create({
            data: {
              userId: newUser.id,
            },
          })
        } catch (billingError) {
          console.log('Billing record might already exist:', billingError)
        }

        const domains = await onGetAllAccountDomains()
        return { status: 200, user: newUser, domain: domains?.domains }
      } catch (userCreationError: any) {
        console.error('User creation error:', userCreationError)

        // If user already exists (P2002 is unique constraint violation)
        if (userCreationError.code === 'P2002') {
          // Try to find the existing user
          const existingUser = await client.user.findUnique({
            where: { clerkId: user.id },
            select: {
              fullname: true,
              id: true,
              type: true,
            },
          })

          if (existingUser) {
            const domains = await onGetAllAccountDomains()
            return { status: 200, user: existingUser, domain: domains?.domains }
          }
        }

        return { status: 400, message: 'Failed to create or find user' }
      }
    }
  } catch (error) {
    console.error('Error in onLoginUser:', error)
    return { status: 400 }
  }
}
