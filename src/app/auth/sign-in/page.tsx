
import SignInFormProvider from '@/components/forms/sign-in/form-provider'
import LoginForm from '@/components/forms/sign-in/login-form'
import GoogleAuthButton from '@/components/forms/sign-in/google-auth-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const SignInPage = () => {
  return (
    <div className="flex-1 py-36 md:px-16 w-full">
      <div className="flex flex-col h-full gap-3">
        <SignInFormProvider>
          <div className="flex flex-col gap-3">
            <LoginForm />
            <div className="w-full flex flex-col gap-3 items-center">
              <Button
                type="submit"
                className="w-full"
              >
                Submit
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
              <p>
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/sign-up"
                  className="font-bold"
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
