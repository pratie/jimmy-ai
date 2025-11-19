'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useSignUp } from '@clerk/nextjs'
import { useState } from 'react'
import { useAuthContextHook } from '@/context/use-auth-context'

const GoogleAuthButton = () => {
  const { signUp, isLoaded } = useSignUp()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const oauthCallbackUrl =
    process.env.NEXT_PUBLIC_CLERK_OAUTH_CALLBACK_URL || '/auth/sso-callback'
  const baseRedirect =
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/dashboard'
  const { selectedPlan, billingInterval } = useAuthContextHook()

  const signUpWithGoogle = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Google OAuth Sign-Up] Starting authentication process...')
      console.log('[Google OAuth Sign-Up] Clerk loaded status:', isLoaded)
      console.log('[Google OAuth Sign-Up] SignUp object available:', !!signUp)
    }

    if (!isLoaded || !signUp) {
      console.error('[Google OAuth Sign-Up] Clerk is not loaded yet or signUp not available')
      toast({
        title: 'Authentication Error',
        description: 'Authentication service is not ready. Please refresh the page.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Google OAuth Sign-Up] Initiating OAuth with Clerk v5 flow...')
      }

      // Clerk v5 OAuth flow - proper callback pattern
      // Carry selected plan/billing to post-OAuth landing
      const params = new URLSearchParams()
      if (selectedPlan) params.set('plan', selectedPlan)
      if (billingInterval) params.set('billing', billingInterval)
      const redirectUrlComplete = params.toString()
        ? `${baseRedirect}?${params.toString()}`
        : baseRedirect

      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: oauthCallbackUrl,
        redirectUrlComplete,
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('[Google OAuth Sign-Up] OAuth redirect initiated')
      }
    } catch (error: any) {
      console.error('[Google OAuth Sign-Up] Error:', error?.message || error)
      setLoading(false)

      // Show user-friendly error message
      const errorMessage = error?.errors?.[0]?.message || error?.message || 'Failed to start Google authentication'

      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      })

      if (process.env.NODE_ENV === 'development') {
        console.error('[Google OAuth Sign-Up] Error details:', {
          message: error?.message,
          code: error?.code,
          errors: error?.errors,
        })
      }
    }
  }

  return (
    <Button
      className="w-full bg-main text-white hover:bg-mainAccent"
      type="button"
      onClick={signUpWithGoogle}
      disabled={!isLoaded || loading}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {loading ? 'Signing up...' : 'Continue with Google'}
    </Button>
  )
}

export default GoogleAuthButton
