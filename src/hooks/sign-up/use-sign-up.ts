'use client'
import { useToast } from '@/components/ui/use-toast'
import {
  UserRegistrationProps,
  UserRegistrationSchema,
} from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignUp, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { onCompleteUserRegistration } from '@/actions/auth'

export const useSignUpForm = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const { signUp, isLoaded, setActive } = useSignUp()
  const { signIn, isLoaded: isSignInLoaded } = useSignIn()
  const router = useRouter()
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      type: 'owner',
    },
    mode: 'onChange',
  })

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!isLoaded) return

    try {
      setLoading(true)
      // 1) Create Clerk user with email + password
      const created = await signUp.create({
        emailAddress: email,
        password: password,
      })

      // 2) Try to prepare email verification. If OTP is disabled, this may throw.
      try {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        // OTP flow enabled → move to OTP step
        onNext((prev) => prev + 1)
        setLoading(false)
        return
      } catch (prepErr: any) {
        // If OTP strategy is disabled/unavailable, finish sign-up immediately
        const prepCode = prepErr?.errors?.[0]?.code
        const otpDisabledCodes = new Set([
          'strategy_unavailable',
          'strategy_forbidden',
          'strategy_not_supported',
          'verification_strategy_unsupported',
          'not_allowed',
        ])

        if (!otpDisabledCodes.has(prepCode)) {
          throw prepErr
        }

        // No OTP required → complete app registration and sign in
        const { fullname, type } = methods.getValues()

        if (!created?.createdUserId) throw prepErr

        // 3) Create app user record
        await onCompleteUserRegistration(
          fullname,
          created.createdUserId,
          type,
          email
        )

        // 4) Activate session - check if signUp already created one
        if (created.status === 'complete' && created.createdSessionId) {
          await setActive({ session: created.createdSessionId })
          setLoading(false)
          router.push('/dashboard')
          return
        }

        // Fallback: if no session from signUp, try signing in
        if (!isSignInLoaded || !signIn) {
          setLoading(false)
          throw new Error('Auth not ready, please try signing in manually')
        }

        const authenticated = await signIn.create({
          identifier: email,
          password,
        })

        if (authenticated.status === 'complete') {
          await setActive({ session: authenticated.createdSessionId })
          setLoading(false)
          router.push('/dashboard')
          return
        }

        setLoading(false)
        throw new Error('Sign-in did not complete. Please try logging in manually.')
      }
    } catch (error: any) {
      const code = error?.errors?.[0]?.code
      const message = error?.errors?.[0]?.longMessage || error?.message

      if (code === 'form_identifier_exists' || code === 'identifier_already_exists') {
        toast({
          title: 'Account already exists',
          description: 'An account with this email already exists. Please sign in instead.',
        })
        setLoading(false)
        // Redirect to sign-in with prefilled email for convenience
        try {
          const params = new URLSearchParams({ email })
          router.push(`/auth/sign-in?${params.toString()}`)
        } catch {
          router.push('/auth/sign-in')
        }
        return
      }

      const description = message || 'Sign up failed'
      toast({ title: 'Error', description })
      setLoading(false)
    }
  }

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      if (!isLoaded) return

      try {
        setLoading(true)
        // If OTP step is shown, verify the code; otherwise this path likely won't be used.
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: values.otp,
        })

        if (completeSignUp.status !== 'complete') {
          setLoading(false)
          toast({ title: 'Error', description: 'Verification failed. Please try again.' })
          return
        }

        if (!signUp.createdUserId) {
          setLoading(false)
          toast({ title: 'Error', description: 'User not created. Please try again.' })
          return
        }

        const registered = await onCompleteUserRegistration(
          values.fullname,
          signUp.createdUserId,
          values.type,
          values.email
        )

        if (registered?.status == 200 && registered.user) {
          await setActive({ session: completeSignUp.createdSessionId })
          setLoading(false)
          router.push('/dashboard')
          return
        }

        toast({ title: 'Error', description: 'Unable to complete registration' })
        setLoading(false)
      } catch (error: any) {
        const description = error?.errors?.[0]?.longMessage || error?.message || 'Sign up failed'
        toast({ title: 'Error', description })
        setLoading(false)
      }
    }
  )
  return {
    methods,
    onHandleSubmit,
    onGenerateOTP,
    loading,
  }
}
