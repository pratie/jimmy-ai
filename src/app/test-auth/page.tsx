'use client'

import { useAuth, useUser, SignInButton, SignOutButton } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function TestAuthPage() {
  const { isLoaded, userId, sessionId, getToken } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    console.log('[Test Auth] Clerk Status:', {
      isLoaded,
      userId,
      sessionId,
      user: user?.emailAddresses?.[0]?.emailAddress
    })
  }, [isLoaded, userId, sessionId, user])

  if (!isLoaded) {
    return <div>Loading Clerk...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Clerk Auth Test</h1>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Auth State:</h2>
          <p>Loaded: {isLoaded ? 'Yes' : 'No'}</p>
          <p>User ID: {userId || 'None'}</p>
          <p>Session ID: {sessionId || 'None'}</p>
          <p>Email: {user?.emailAddresses?.[0]?.emailAddress || 'None'}</p>
        </div>

        <div className="flex gap-4">
          {!userId ? (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Sign In (Clerk Modal)
              </button>
            </SignInButton>
          ) : (
            <SignOutButton>
              <button className="px-4 py-2 bg-red-500 text-white rounded">
                Sign Out
              </button>
            </SignOutButton>
          )}
        </div>

        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-bold">Debug Info:</h2>
          <p className="text-xs">Check browser console for detailed logs</p>
          <p className="text-xs mt-2">
            If Google OAuth fails, check:
            1. Clerk Dashboard → Social Connections → Google is enabled
            2. OAuth redirect URIs include localhost:3000
          </p>
        </div>
      </div>
    </div>
  )
}
