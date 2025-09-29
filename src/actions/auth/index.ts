'use server'

import { client } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { onGetAllAccountDomains } from '../settings'

export const onCompleteUserRegistration = async (
  fullname: string,
  clerkId: string,
  type: string,
  email: string
) => {
  console.log('[Auth Registration] Starting registration for:', { fullname, clerkId, type, email })

  if (!email) {
    console.error('[Auth Registration] Registration attempted without email for Clerk user', clerkId)
    return { status: 400, message: 'Email address is required' }
  }
  try {
    const registered = await client.user.create({
      data: {
        fullname,
        clerkId,
        type,
        email,
        subscription: {
          create: {},
        },
      },
      select: {
        fullname: true,
        id: true,
        type: true,
        email: true,
      },
    })

    if (registered) {
      console.log('[Auth Registration] User registered successfully:', registered.email)
      return { status: 200, user: registered }
    }
  } catch (error: any) {
    console.error('[Auth Registration] Error in onCompleteUserRegistration:', {
      message: error?.message,
      code: error?.code,
      fullError: error
    })
    return { status: 400 }
  }
}

export const onLoginUser = async () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth] onLoginUser called')
  }
  try {
    const { userId } = await auth()

    if (!userId) {
      console.log('[Auth] No authenticated user found')
      return { status: 401, message: 'No user found' }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Current Clerk userId:', userId)
    }

    let authenticated = await client.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        fullname: true,
        id: true,
        type: true,
        email: true,
      },
    })

    if (authenticated) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] User found in database:', authenticated.email)
      }
      const domains = await onGetAllAccountDomains()
      return { status: 200, user: authenticated, domain: domains?.domains }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] User not in database, auto-creating for OAuth sign-in...')
      }

      // Get full user object from Clerk for OAuth auto-creation
      const user = await currentUser()

      if (!user) {
        console.error('[Auth] Could not fetch user details from Clerk')
        return { status: 400, message: 'Unable to retrieve user information' }
      }

      // Validate that user has email addresses
      if (!user.emailAddresses || user.emailAddresses.length === 0) {
        console.error('[Auth] No email addresses found for Clerk user', userId)
        return { status: 400, message: 'No email address associated with this account. Please use a different authentication method.' }
      }

      // Find primary email or fall back to first email
      const primaryEmail =
        user.emailAddresses.find(
          (address) => address.id === user.primaryEmailAddressId
        )?.emailAddress || user.emailAddresses[0]?.emailAddress

      if (!primaryEmail || primaryEmail.trim() === '') {
        console.error('[Auth] Unable to determine primary email for Clerk user', userId)
        console.error('[Auth] Email addresses:', user.emailAddresses)
        return { status: 400, message: 'Unable to retrieve email address. Please try again or contact support.' }
      }

      // Build user's full name with proper fallbacks
      const fullname =
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        primaryEmail.split('@')[0] ||
        'User'

      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Creating new user with email:', primaryEmail)
      }

      try {
        // Use transaction to ensure atomicity
        const result = await client.$transaction(async (tx) => {
          // Check if user exists again within transaction to prevent race condition
          const existingUser = await tx.user.findUnique({
            where: { clerkId: userId },
            select: {
              fullname: true,
              id: true,
              type: true,
              email: true,
            },
          })

          if (existingUser) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Auth] User already exists in transaction check:', existingUser.email)
            }
            return existingUser
          }

          // Create user
          const newUser = await tx.user.create({
            data: {
              fullname,
              clerkId: userId,
              type: 'OWNER',
              email: primaryEmail,
            },
            select: {
              fullname: true,
              id: true,
              type: true,
              email: true,
            },
          })

          // Upsert billing record within the same transaction
          await tx.billings.upsert({
            where: { userId: newUser.id },
            update: {},
            create: {
              userId: newUser.id,
            },
          })

          return newUser
        })

        const newUser = result

        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] User created successfully:', newUser.email)
        }
        const domains = await onGetAllAccountDomains()
        return { status: 200, user: newUser, domain: domains?.domains }
      } catch (userCreationError: any) {
        console.error('[Auth] User creation error:', userCreationError?.message || userCreationError)

        // If user already exists (P2002 is unique constraint violation)
        if (userCreationError.code === 'P2002') {
          // Try to find the existing user
          const existingUser = await client.user.findUnique({
            where: { clerkId: userId },
            select: {
              fullname: true,
              id: true,
              type: true,
              email: true,
            },
          })

          if (existingUser) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Auth] Found existing user after creation conflict:', existingUser.email)
            }
            const domains = await onGetAllAccountDomains()
            return { status: 200, user: existingUser, domain: domains?.domains }
          }
        }

        return { status: 400, message: 'Failed to create or find user' }
      }
    }
  } catch (error) {
    console.error('[Auth] Error in onLoginUser:', error)
    return { status: 400 }
  }
}
