'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const signInFallback = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/dashboard'
const signUpFallback = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/dashboard'

export default function SSOCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('[SSO Callback] OAuth callback page loaded')

    // Set a timeout to detect if authentication is taking too long
    const timeoutId = setTimeout(() => {
      console.error('[SSO Callback] Authentication timeout after 30 seconds')
      setError('Authentication is taking longer than expected. Please try again.')

      // Redirect to sign-in after 3 more seconds
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 3000)
    }, 30000) // 30 second timeout

    return () => clearTimeout(timeoutId)
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="animate-pulse">
          <svg
            className="h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting you back to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing authentication...
          </h2>
          <p className="text-gray-600">Please wait while we sign you in</p>
        </div>
      </div>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={signInFallback}
        signUpFallbackRedirectUrl={signUpFallback}
      />
    </div>
  )
}
