'use client'
import { useToast } from '@/components/ui/use-toast'
import {
  UserRegistrationProps,
  UserRegistrationSchema,
} from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignUp } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { onCompleteUserRegistration } from '@/actions/auth'

/**
 * Sign-up.
 *
 * Two things this deliberately no longer does. It no longer collects an account
 * "type": the value was hard-coded to `owner`, threaded through the schema and
 * the server action, and then discarded — every organization is provisioned as
 * an agency regardless. And it no longer narrates itself to the console with
 * the user's email address and password length on every attempt.
 */
export const useSignUpForm = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    mode: 'onChange',
  })
  const params = useSearchParams()
  const planParam = (params.get('plan') || '').toUpperCase()
  const billingParam = (params.get('billing') || '').toUpperCase()
  const dashboardWithPlan = (() => {
    const qs = new URLSearchParams()
    if (planParam) qs.set('plan', planParam)
    if (billingParam) qs.set('billing', billingParam)
    const s = qs.toString()
    return s ? `/dashboard?${s}` : '/dashboard'
  })()

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!isLoaded) return

    try {
      setLoading(true)

      const { fullname } = methods.getValues()

      const created = await signUp.create({
        emailAddress: email,
        password: password,
      })

      // Status is null rather than 'complete' while email verification is on.
      if (created.status !== 'complete') {
        try {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
          toast({
            title: 'Check your email',
            description: 'We sent you a 6-digit code. Enter it to finish signing up.',
          })
          setLoading(false)
          onNext(2)
          return
        } catch (prepError: any) {
          setLoading(false)
          toast({
            title: 'Could not send the code',
            description:
              prepError?.errors?.[0]?.longMessage ||
              'We could not email your verification code. Try again in a moment.',
            variant: 'destructive',
          })
          return
        }
      }

      // Instant sign-up: no verification step configured.
      if (!created.createdUserId || !created.createdSessionId) {
        setLoading(false)
        toast({
          title: 'Sign-up did not complete',
          description: 'Your account was not fully created. Try signing in, or start again.',
          variant: 'destructive',
        })
        return
      }

      const registered = await onCompleteUserRegistration(
        fullname,
        created.createdUserId,
        email
      )

      if (registered?.status !== 200) {
        setLoading(false)
        toast({
          title: 'Could not finish setting up your workspace',
          description: 'Your account exists — sign in and we will try again.',
          variant: 'destructive',
        })
        return
      }

      await setActive({ session: created.createdSessionId })
      setLoading(false)
      router.push(dashboardWithPlan)
    } catch (error: any) {
      const code = error?.errors?.[0]?.code
      const message = error?.errors?.[0]?.longMessage || error?.message

      if (code === 'form_identifier_exists' || code === 'identifier_already_exists') {
        toast({
          title: 'Account already exists',
          description: 'Sign in with this email instead.',
        })
        setLoading(false)
        try {
          const params = new URLSearchParams({ email })
          router.push(`/auth/sign-in?${params.toString()}`)
        } catch {
          router.push('/auth/sign-in')
        }
        return
      }

      toast({
        title: 'Sign-up failed',
        description: message || 'Something went wrong. Try again.',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      if (!isLoaded) return

      try {
        setLoading(true)

        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: values.otp,
        })

        if (completeSignUp.status !== 'complete' || !signUp.createdUserId) {
          setLoading(false)
          toast({
            title: 'That code did not work',
            description: 'Check the six digits and try again, or send yourself a new code.',
            variant: 'destructive',
          })
          return
        }

        const registered = await onCompleteUserRegistration(
          values.fullname,
          signUp.createdUserId,
          values.email
        )

        // A duplicate is a success: the record already exists, which is the
        // state we were trying to reach.
        const isDuplicate =
          registered?.status === 400 &&
          typeof registered?.message === 'string' &&
          registered.message.toLowerCase().includes('already exists')

        if ((registered?.status === 200 && registered.user) || isDuplicate) {
          await setActive({ session: completeSignUp.createdSessionId })
          setLoading(false)
          router.push(dashboardWithPlan)
          return
        }

        toast({
          title: 'Could not finish setting up your workspace',
          description: 'Your account exists — sign in and we will try again.',
          variant: 'destructive',
        })
        setLoading(false)
      } catch (error: any) {
        toast({
          title: 'Verification failed',
          description:
            error?.errors?.[0]?.longMessage ||
            error?.message ||
            'Check the six digits and try again.',
          variant: 'destructive',
        })
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
