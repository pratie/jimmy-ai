import { onLoginUser } from '@/actions/auth'
import { onGetWorkspaceSwitcherOptions } from '@/actions/clients'
import SideBar from '@/components/sidebar'
import { ChatProvider } from '@/context/user-chat-context'
import { redirect } from 'next/navigation'
import React from 'react'
import DashboardThemeEnforcer from '@/components/dashboard/theme-enforcer'

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

    // Switcher options are read separately so the sidebar shows every workspace
    // the member may reach, which is not necessarily every workspace the
    // organization owns.
    const switcher = await onGetWorkspaceSwitcherOptions()

    return (
      <ChatProvider>
        <div className="flex h-screen min-h-screen w-full bg-[#f5f6fa] text-foreground">
          <DashboardThemeEnforcer />
          <SideBar
            workspaces={switcher.workspaces}
            organization={switcher.organization}
            user={{ ...authenticated.user, fullname: authenticated.user?.fullName ?? '' }}
            canCreateClient={['owner', 'admin', 'manager'].includes(authenticated.role ?? '')}
            canManageBilling={['owner', 'admin', 'billing'].includes(authenticated.role ?? '')}
          />
          {/* The sidebar is an overlay drawer below md, so it claims no
              horizontal space there. The top padding clears its floating
              trigger instead. */}
          <main className="flex h-screen min-w-0 flex-1 flex-col overflow-x-hidden pt-14 md:pt-0">
            {children}
          </main>
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
