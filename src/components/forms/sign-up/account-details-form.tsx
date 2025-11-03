import { USER_REGISTRATION_FORM } from '@/constants/forms'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import FormGenerator from '../form-generator'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useAuthContextHook } from '@/context/use-auth-context'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

function AccountDetailsForm({ errors, register }: Props) {
  const { setCurrentStep } = useAuthContextHook()

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCurrentStep(1)}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Image
          src="/images/logo.svg"
          alt="Logo"
          width={60}
          height={60}
          className="flex-shrink-0"
        />
        <h2 className="text-gravel md:text-4xl font-bold">Account details</h2>
      </div>
      <p className="text-iridium md:text-sm">Enter your email and password</p>
      {USER_REGISTRATION_FORM.map((field) => (
        <FormGenerator
          key={field.id}
          {...field}
          errors={errors}
          register={register}
          name={field.name}
        />
      ))}
      {/* Container for Clerk Smart CAPTCHA if bot protection is enabled */}
      <div id="clerk-captcha" className="mt-2" />
    </>
  )
}

export default AccountDetailsForm
