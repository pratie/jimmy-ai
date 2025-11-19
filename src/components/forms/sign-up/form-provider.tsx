'use client'
import { Loader } from '@/components/loader'
import { AuthContextProvider } from '@/context/use-auth-context'
import { useSignUpForm } from '@/hooks/sign-up/use-sign-up'
import React from 'react'
import { FormProvider } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthContextHook } from '@/context/use-auth-context'

type Props = {
  children: React.ReactNode
}

type SignUpFormContextValue = {
  onGenerateOTP: (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => Promise<void>
  loading: boolean
  showAccountForm: boolean
  setShowAccountForm: React.Dispatch<React.SetStateAction<boolean>>
}

const SignUpFormContext = React.createContext<SignUpFormContextValue | undefined>(undefined)

export const useSignUpFormContext = () => {
  const ctx = React.useContext(SignUpFormContext)
  if (!ctx) {
    throw new Error('useSignUpFormContext must be used within SignUpFormProvider')
  }
  return ctx
}

const SignUpFormProvider = ({ children }: Props) => {
  const { methods, onHandleSubmit, onGenerateOTP, loading } = useSignUpForm()
  const [showAccountForm, setShowAccountForm] = React.useState<boolean>(false)
  // Inner initializer to run inside context provider
  const Initializer = () => {
    const params = useSearchParams()
    const { setSelectedPlan, setBillingInterval } = useAuthContextHook()
    useEffect(() => {
      const rawPlan = (params.get('plan') || '').trim()
      const rawBilling = (params.get('billing') || '').trim()
      if (rawPlan) {
        const p = rawPlan.toUpperCase()
        if (p === 'FREE' || p === 'STARTER' || p === 'PRO' || p === 'BUSINESS') {
          setSelectedPlan(p)
        } else {
          const map: Record<string, 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'> = {
            FREE: 'FREE',
            STARTER: 'STARTER',
            BUSINESS: 'BUSINESS',
            PRO: 'PRO',
            BASIC: 'STARTER',
            STANDARD: 'PRO',
          }
          const m = map[p]
          if (m) setSelectedPlan(m)
        }
      }
      if (rawBilling) {
        const b = rawBilling.toUpperCase()
        if (b === 'MONTHLY' || b === 'YEARLY') setBillingInterval(b)
        if (b === 'ANNUAL' || b === 'ANNUALLY' || b === 'YEAR') setBillingInterval('YEARLY')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return null
  }

  return (
    <AuthContextProvider>
      <Initializer />
      <FormProvider {...methods}>
        <SignUpFormContext.Provider
          value={{ onGenerateOTP, loading, showAccountForm, setShowAccountForm }}
        >
          <form
            onSubmit={onHandleSubmit}
            className="h-full"
          >
            <div className="flex flex-col justify-between gap-3 h-full">
              <Loader loading={loading}>{children}</Loader>
            </div>
          </form>
        </SignUpFormContext.Provider>
      </FormProvider>
    </AuthContextProvider>
  )
}

export default SignUpFormProvider
