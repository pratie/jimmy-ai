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

const SignUpFormProvider = ({ children }: Props) => {
  const { methods, onHandleSubmit, loading } = useSignUpForm()
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
        <form
          onSubmit={onHandleSubmit}
          className="h-full"
        >
          <div className="flex flex-col justify-between gap-3 h-full">
            <Loader loading={loading}>{children}</Loader>
          </div>
        </form>
      </FormProvider>
    </AuthContextProvider>
  )
}

export default SignUpFormProvider
