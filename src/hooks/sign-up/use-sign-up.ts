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

export const useSignUpForm = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      type: 'owner',
    },
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
    console.log('[Sign-Up] 🚀 Starting registration process...')
    console.log('[Sign-Up] 📧 Email:', email)
    console.log('[Sign-Up] 🔒 Password length:', password?.length || 0)
    console.log('[Sign-Up] ✅ Clerk loaded:', isLoaded)

    if (!isLoaded) {
      console.log('[Sign-Up] ⚠️ Clerk not loaded yet, aborting...')
      return
    }

    try {
      setLoading(true)
      console.log('[Sign-Up] 🔄 Setting loading state to true')

      // Get user details from form
      const { fullname, type } = methods.getValues()
      console.log('[Sign-Up] 👤 User details:', { fullname, type, email })

      // Create the Clerk user
      console.log('[Sign-Up] 📝 Creating Clerk user...')
      const created = await signUp.create({
        emailAddress: email,
        password: password,
      })
      console.log('[Sign-Up] ✅ Clerk user created')
      console.log('[Sign-Up] 📊 Created status:', created.status)
      console.log('[Sign-Up] 🆔 Created user ID:', created.createdUserId)
      console.log('[Sign-Up] 🎫 Created session ID:', created.createdSessionId)

      // If verification is required (status will be null when email verification is enabled)
      if (created.status !== 'complete') {
        console.log('[Sign-Up] ✉️ Email verification required, preparing email code...')
        try {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
          console.log('[Sign-Up] ✅ Verification email sent')
          toast({
            title: 'Check your email',
            description: 'We sent you a 6-digit code. Enter it to complete sign-up.',
          })
          setLoading(false)
          console.log('[Sign-Up] ➡️ Moving to OTP step (step 2)')
          onNext(2)
          return
        } catch (prepError: any) {
          console.error('[Sign-Up] ❌ Failed to prepare email verification:', prepError)
          setLoading(false)
          toast({
            title: 'Error',
            description: prepError?.errors?.[0]?.longMessage || 'Failed to send verification email'
          })
          return
        }
      }

      // If status is 'complete', no verification required (instant sign-up)
      console.log('[Sign-Up] ✅ Sign-up complete without verification')

      if (!created.createdUserId) {
        console.error('[Sign-Up] ❌ No user ID found after creation')
        setLoading(false)
        toast({ title: 'Error', description: 'User ID not found. Please try again.' })
        return
      }

      if (!created.createdSessionId) {
        console.error('[Sign-Up] ❌ No session ID found after creation')
        setLoading(false)
        toast({ title: 'Error', description: 'Session not created. Please try signing in.' })
        return
      }

      // Create DB record
      console.log('[Sign-Up] 💾 Creating database user record...')
      const registered = await onCompleteUserRegistration(
        fullname,
        created.createdUserId,
        type,
        email
      )
      console.log('[Sign-Up] 📊 Database registration response:', registered)

      if (registered?.status !== 200) {
        console.error('[Sign-Up] ❌ Database user creation failed:', registered)
        setLoading(false)
        toast({ title: 'Error', description: 'Failed to create user record' })
        return
      }

      console.log('[Sign-Up] ✅ Database user created successfully')
      console.log('[Sign-Up] 🎫 Activating Clerk session...')
      await setActive({ session: created.createdSessionId })
      console.log('[Sign-Up] ✅ Session activated successfully')

      setLoading(false)
      console.log('[Sign-Up] 🚀 Redirecting to dashboard...')
      router.push(dashboardWithPlan)
    } catch (error: any) {
      console.error('[Sign-Up] ❌ Error during sign-up process:', error)
      const code = error?.errors?.[0]?.code
      const message = error?.errors?.[0]?.longMessage || error?.message

      if (code === 'form_identifier_exists' || code === 'identifier_already_exists') {
        console.log('[Sign-Up] 🔄 Duplicate email detected, redirecting to sign-in...')
        toast({
          title: 'Account already exists',
          description: 'An account with this email already exists. Please sign in instead.',
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

      const description = message || 'Sign up failed'
      toast({ title: 'Error', description })
      setLoading(false)
    }
  }

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      console.log('[Sign-Up OTP] 🔐 OTP verification flow started')
      console.log('[Sign-Up OTP] 📊 Form values:', { ...values, password: '[REDACTED]', confirmPassword: '[REDACTED]' })

      if (!isLoaded) {
        console.log('[Sign-Up OTP] ⚠️ Clerk not loaded, aborting...')
        return
      }

      try {
        setLoading(true)
        console.log('[Sign-Up OTP] 📝 Attempting email verification with OTP:', values.otp)

        // If OTP step is shown, verify the code; otherwise this path likely won't be used.
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: values.otp,
        })
        console.log('[Sign-Up OTP] ✅ Email verification completed')
        console.log('[Sign-Up OTP] 📊 Verification status:', completeSignUp.status)

        if (completeSignUp.status !== 'complete') {
          console.error('[Sign-Up OTP] ❌ Verification status not complete:', completeSignUp.status)
          setLoading(false)
          toast({ title: 'Error', description: 'Verification failed. Please try again.' })
          return
        }

        if (!signUp.createdUserId) {
          console.error('[Sign-Up OTP] ❌ No created user ID found')
          setLoading(false)
          toast({ title: 'Error', description: 'User not created. Please try again.' })
          return
        }

        console.log('[Sign-Up OTP] 🆔 Created user ID:', signUp.createdUserId)
        console.log('[Sign-Up OTP] 💾 Creating database user record...')

        const registered = await onCompleteUserRegistration(
          values.fullname,
          signUp.createdUserId,
          values.type,
          values.email
        )
        console.log('[Sign-Up OTP] 📊 Database registration response:', registered)

        // Treat duplicate-user response as success (idempotent)
        const isDuplicate =
          registered?.status === 400 &&
          typeof registered?.message === 'string' &&
          registered.message.toLowerCase().includes('already exists')

        if ((registered?.status === 200 && registered.user) || isDuplicate) {
          if (isDuplicate) {
            console.log('[Sign-Up OTP] ℹ️ User already exists in DB; proceeding to activate session')
          } else {
            console.log('[Sign-Up OTP] ✅ Database user created successfully')
          }

          console.log('[Sign-Up OTP] 🎫 Activating session...')
          await setActive({ session: completeSignUp.createdSessionId })
          console.log('[Sign-Up OTP] ✅ Session activated')
          setLoading(false)
          console.log('[Sign-Up OTP] 🚀 Redirecting to dashboard...')
          router.push(dashboardWithPlan)
          return
        }

        console.error('[Sign-Up OTP] ❌ Database registration failed or user not returned')
        toast({ title: 'Error', description: 'Unable to complete registration' })
        setLoading(false)
      } catch (error: any) {
        console.error('[Sign-Up OTP] ❌ Error during OTP verification:', error)
        console.error('[Sign-Up OTP] 📊 Error details:', {
          message: error?.message,
          code: error?.errors?.[0]?.code,
          longMessage: error?.errors?.[0]?.longMessage,
          errors: error?.errors,
        })
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
