'use client'
import { Button } from '@/components/ui/button'
import { useAuthContextHook } from '@/context/use-auth-context'
import { useFormContext } from 'react-hook-form'
import GoogleAuthButton from './google-auth-button'
import Link from 'next/link'
import React from 'react'
import { Loader2 } from 'lucide-react'
import { useSignUpFormContext } from './form-provider'

type Props = {}

const ButtonHandler = (props: Props) => {
  const { currentStep, setCurrentStep } = useAuthContextHook()
  const {
    formState,
    getFieldState,
    getValues,
  } = useFormContext()
  const {
    onGenerateOTP,
    loading,
    showAccountForm,
    setShowAccountForm,
  } = useSignUpFormContext()

  const { isDirty: isEmail } = getFieldState('email', formState)
  const { isDirty: isPassword } = getFieldState('password', formState)
  const canProceed = isEmail && isPassword

  if (currentStep === 2) {
    return (
      <div className="w-full flex flex-col gap-3 items-center">
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            'Create an account'
          )}
        </Button>
        <p>
          Already have an account?{' '}
          <Link
            href="/auth/sign-in"
            className="font-bold"
          >
            Sign In
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <GoogleAuthButton />
      <div className="w-full relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or sign up with email
          </span>
        </div>
      </div>
      {!showAccountForm && (
        <Button
          type="button"
          className="w-full border border-border bg-white text-brand-primary hover:bg-white/80"
          variant="outline"
          onClick={() => setShowAccountForm(true)}
        >
          Sign up with Email
        </Button>
      )}
      {showAccountForm && (
        <Button
          variant="outline"
          type="button"
          className="w-full border border-border bg-white text-brand-primary hover:bg-white/80"
          disabled={!canProceed || loading}
          onClick={() => {
            if (!canProceed || loading) return
            onGenerateOTP(
              getValues('email'),
              getValues('password'),
              setCurrentStep
            )
          }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending code...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      )}
      <p>
        Already have an account?{' '}
        <Link
          href="/auth/sign-in"
          className="font-bold"
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}

export default ButtonHandler
