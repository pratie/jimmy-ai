import { onLoginUser } from '@/actions/auth'
import SideBar from '@/components/sidebar'
import { ChatProvider } from '@/context/user-chat-context'
import { redirect } from 'next/navigation'
import React from 'react'

// Mark the entire (dashboard) segment as dynamic to avoid
// static generation warnings for auth/headers usage
export const dynamic = 'force-dynamic'

type Props = {
  children: React.ReactNode
}

const OwnerLayout = async ({ children }: Props) => {
  try {
    const authenticated = await onLoginUser()

    if (!authenticated) {
      console.log('[Dashboard Layout] No authentication response received')
      redirect('/auth/sign-in')
    }

    if (authenticated.status === 401) {
      console.log('[Dashboard Layout] User not authenticated, redirecting to sign-in')
      redirect('/auth/sign-in')
    }

    if (authenticated.status !== 200) {
      console.log('[Dashboard Layout] Authentication failed:', authenticated.message)
      redirect('/auth/sign-in')
    }

    if (!authenticated.user) {
      console.log('[Dashboard Layout] User data missing from authentication response')
      redirect('/auth/sign-in')
    }

    return (
      <ChatProvider>
        <div className="min-h-screen bg-background flex h-screen w-full">
          <SideBar
            domains={authenticated.domain}
            user={authenticated.user}
          />
          <div className="w-full h-screen flex flex-col pl-[60px] md:pl-0 overflow-x-hidden">
            {children}
          </div>
        </div>
      </ChatProvider>
    )
  } catch (error) {
    // Next.js 15: redirect() throws NEXT_REDIRECT error (expected behavior)
    // Check if this is a Next.js redirect (not a real error)
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as any).digest
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        // This is an expected redirect, re-throw it so Next.js can handle it
        throw error
      }
    }

    // Only log and handle actual unexpected errors
    console.error('[Dashboard Layout] Unexpected error:', error)
    redirect('/auth/sign-in')
  }
}

export default OwnerLayout
