
import type { Metadata } from 'next'
import SignInFormProvider from '@/components/forms/sign-in/form-provider'
import LoginForm from '@/components/forms/sign-in/login-form'
import GoogleAuthButton from '@/components/forms/sign-in/google-auth-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const SignInPage = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <SignInFormProvider>
          <div className="flex flex-col gap-4">
            <LoginForm />
            <div className="w-full flex flex-col gap-3 items-center">
              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#111827] text-sm font-semibold hover:bg-[#252d3d]"
              >
                  Sign in
              </Button>
              <div className="w-full relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <GoogleAuthButton />
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/sign-up"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </SignInFormProvider>
      </div>
    </div>
  )
}

export default SignInPage

export const metadata: Metadata = {
  title: 'Sign in — ChatDock',
  alternates: { canonical: '/auth/sign-in' },
  robots: { index: false, follow: false },
}
