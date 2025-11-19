'use client'  // Mark the component as a Client Component

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuthContextHook } from '@/context/use-auth-context'
import { useFormContext } from 'react-hook-form'
import { Spinner } from '@/components/spinner'
import { useSignUpFormContext } from './form-provider'

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
  const { currentStep } = useAuthContextHook()
  const { showAccountForm } = useSignUpFormContext()
  const [onOTP, setOnOTP] = useState<string>('')

  setValue('otp', onOTP)

  const StepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        if (!showAccountForm) return null
        return (
          <DetailForm
            errors={errors}
            register={register}
          />
        )
      case 2:
        return (
          <OTPForm
            onOTP={onOTP}
            setOTP={setOnOTP}
          />
        )
      default:
        return <div />
    }
  }, [currentStep, register, errors, onOTP, showAccountForm])

  return (
    <div className="flex flex-col gap-4">
      {StepContent}
    </div>
  )
}

export default RegistrationFormStep
