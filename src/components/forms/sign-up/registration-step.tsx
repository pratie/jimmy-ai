'use client'  // Mark the component as a Client Component

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuthContextHook } from '@/context/use-auth-context'
import { useFormContext } from 'react-hook-form'
import TypeSelectionForm from './type-selection-form'
import { Spinner } from '@/components/spinner'

const LoadingSpinner = () => <Spinner noPadding={false} />

const DetailForm = dynamic(() => import('./account-details-form'), {
  ssr: false,
  loading: LoadingSpinner,
})

const OTPForm = dynamic(() => import('./otp-form'), {
  ssr: false,
  loading: LoadingSpinner,
})

type Props = {}

const RegistrationFormStep = (props: Props) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext()
  const { currentStep, selectedPlan, billingInterval } = useAuthContextHook()
  const [onOTP, setOnOTP] = useState<string>('')
  const [onUserType, setOnUserType] = useState<'owner' | 'student'>('owner')

  setValue('otp', onOTP)

  const StepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <TypeSelectionForm
            register={register}
            userType={onUserType}
            setUserType={setOnUserType}
          />
        )
      case 2:
        return (
          <DetailForm
            errors={errors}
            register={register}
          />
        )
      case 3:
        return (
          <OTPForm
            onOTP={onOTP}
            setOTP={setOnOTP}
          />
        )
      default:
        return <div />
    }
  }, [currentStep, register, onUserType, errors, onOTP])

  return (
    <div className="flex flex-col gap-4">
      {/* Selected plan badge (if passed via query) */}
      {selectedPlan && (
        <div className="w-full rounded-base border-2 border-brand-base-300 bg-white dark:bg-black/40 px-4 py-3 text-sm">
          <span className="font-semibold">Selected plan:</span>{' '}
          <span className="uppercase">{selectedPlan}</span>
          {billingInterval && (
            <span className="text-muted-foreground"> · {billingInterval.toLowerCase()}</span>
          )}
        </div>
      )}

      {StepContent}
    </div>
  )
}

export default RegistrationFormStep
