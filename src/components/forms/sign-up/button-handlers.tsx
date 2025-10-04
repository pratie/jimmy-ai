'use client'
import { Button } from '@/components/ui/button'
import { useAuthContextHook } from '@/context/use-auth-context'
import { useSignUpForm } from '@/hooks/sign-up/use-sign-up'
import GoogleAuthButton from './google-auth-button'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { useFormContext } from 'react-hook-form'

type Props = {}

const ButtonHandler = (props: Props) => {
  const { setCurrentStep, currentStep } = useAuthContextHook()
  const { formState, getFieldState, getValues } = useFormContext()
  const { onGenerateOTP, loading } = useSignUpForm()

  const { isDirty: isName } = getFieldState('fullname', formState)
  const { isDirty: isEmail } = getFieldState('email', formState)
  const { isDirty: isPassword } = getFieldState('password', formState)

  console.log('[Sign-Up Form] 📊 Current step:', currentStep)
  console.log('[Sign-Up Form] ✅ Form validation status:', {
    isNameDirty: isName,
    isEmailDirty: isEmail,
    isPasswordDirty: isPassword,
  })

  if (currentStep === 3) {
    console.log('[Sign-Up Form] 🔐 Step 3: OTP verification step')

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
          Already have an account?
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

  if (currentStep === 2) {
    console.log('[Sign-Up Form] 📝 Step 2: Account details step')
    const canProceed = isName && isEmail && isPassword
    console.log('[Sign-Up Form] ✅ Can proceed to registration:', canProceed)

    return (
      <div className="w-full flex flex-col gap-3 items-center">
        <Button
          type="button"
          className="w-full"
          disabled={!canProceed || loading}
          onClick={() => {
            if (!canProceed || loading) return
            console.log('[Sign-Up Form] 🚀 Continue button clicked, triggering registration...')
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

  console.log('[Sign-Up Form] 🎯 Step 1: User type selection step')

  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <Button
        type="button"
        className="w-full"
        onClick={() => {
          console.log('[Sign-Up Form] ➡️ Moving to step 2 (Account details)')
          setCurrentStep((prev: number) => prev + 1)
        }}
      >
        Continue
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
