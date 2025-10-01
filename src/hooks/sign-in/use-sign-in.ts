import { useToast } from '@/components/ui/use-toast'
import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn()
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: 'onChange',
  })
  const onHandleSubmit = methods.handleSubmit(
    async (values: UserLoginProps) => {
      console.log('[Sign-In] 🚀 Starting sign-in process...')
      console.log('[Sign-In] 📧 Email:', values.email)
      console.log('[Sign-In] 🔒 Password length:', values.password?.length || 0)
      console.log('[Sign-In] ✅ Clerk loaded:', isLoaded)

      if (!isLoaded) {
        console.log('[Sign-In] ⚠️ Clerk not loaded yet, aborting...')
        return
      }

      try {
        setLoading(true)
        console.log('[Sign-In] 🔄 Setting loading state to true')

        console.log('[Sign-In] 📝 Attempting Clerk authentication...')
        const authenticated = await signIn.create({
          identifier: values.email,
          password: values.password,
        })
        console.log('[Sign-In] ✅ Clerk authentication response received')
        console.log('[Sign-In] 📊 Authentication status:', authenticated.status)
        console.log('[Sign-In] 🎫 Session ID:', authenticated.createdSessionId)

        if (authenticated.status === 'complete') {
          console.log('[Sign-In] ✅ Authentication complete, activating session...')
          await setActive({ session: authenticated.createdSessionId })
          console.log('[Sign-In] ✅ Session activated successfully')

          toast({
            title: 'Success',
            description: 'Welcome back!',
          })

          console.log('[Sign-In] 🚀 Redirecting to dashboard...')
          router.push('/dashboard')
        } else {
          console.error('[Sign-In] ⚠️ Authentication status not complete:', authenticated.status)
          setLoading(false)
        }
      } catch (error: any) {
        console.error('[Sign-In] ❌ Error during sign-in:', error)
        console.error('[Sign-In] 📊 Error details:', {
          message: error?.message,
          code: error?.errors?.[0]?.code,
          longMessage: error?.errors?.[0]?.longMessage,
          errors: error?.errors,
        })

        setLoading(false)

        const code = error?.errors?.[0]?.code
        const message = error?.errors?.[0]?.longMessage || error?.message

        if (code === 'form_password_incorrect') {
          console.error('[Sign-In] 🔒 Incorrect password')
          toast({
            title: 'Error',
            description: 'Email or password is incorrect. Please try again.',
          })
        } else if (code === 'form_identifier_not_found') {
          console.error('[Sign-In] 👤 User not found')
          toast({
            title: 'Account not found',
            description: 'No account exists with this email. Please sign up first.',
          })
        } else {
          console.error('[Sign-In] 💥 Unknown error')
          toast({
            title: 'Error',
            description: message || 'Sign in failed. Please try again.',
          })
        }
      }
    }
  )

  return {
    methods,
    onHandleSubmit,
    loading,
  }
}
