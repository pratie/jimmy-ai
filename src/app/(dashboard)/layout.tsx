import { onLoginUser } from '@/actions/auth'
import SideBar from '@/components/sidebar'
import { ChatProvider } from '@/context/user-chat-context'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const OwnerLayout = async ({ children }: Props) => {
  try {
    const authenticated = await onLoginUser()

    if (!authenticated) {
      console.error('[Dashboard Layout] No authentication response received')
      redirect('/auth/sign-in')
    }

    if (authenticated.status === 401) {
      console.log('[Dashboard Layout] User not authenticated, redirecting to sign-in')
      redirect('/auth/sign-in')
    }

    if (authenticated.status !== 200) {
      console.error('[Dashboard Layout] Authentication failed:', authenticated.message)
      redirect('/auth/sign-in')
    }

    if (!authenticated.user) {
      console.error('[Dashboard Layout] User data missing from authentication response')
      redirect('/auth/sign-in')
    }

    return (
      <ChatProvider>
        <div className="flex h-screen w-full">
          <SideBar domains={authenticated.domain} />
          <div className="w-full h-screen flex flex-col pl-20 md:pl-4">
            {children}
          </div>
        </div>
      </ChatProvider>
    )
  } catch (error) {
    console.error('[Dashboard Layout] Unexpected error:', error)
    redirect('/auth/sign-in')
  }
}

export default OwnerLayout
