'use client'  // Mark the component as a Client Component

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuthContextHook } from '@/context/use-auth-context'
import { useFormContext } from 'react-hook-form'
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
  const { currentStep } = useAuthContextHook()
  const [onOTP, setOnOTP] = useState<string>('')

  // Was called straight from the render body, which writes to form state during
  // another component's render.
  useEffect(() => {
    setValue('otp', onOTP)
  }, [onOTP, setValue])

  const StepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        // Shown immediately. It used to be hidden behind a "Sign up with Email"
        // button — a click that revealed a form rather than doing anything.
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
  }, [currentStep, register, errors, onOTP])

  return (
    <div className="flex flex-col gap-4">
      {StepContent}
    </div>
  )
}

export default RegistrationFormStep
