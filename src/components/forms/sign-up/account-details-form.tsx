import { USER_REGISTRATION_FORM } from '@/constants/forms'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FormGenerator from '../form-generator'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

function AccountDetailsForm({ errors, register }: Props) {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="flex-shrink-0 rounded-full border border-border p-2 hover:bg-white/60 transition">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Image
          src="/images/logo.svg"
          alt="Logo"
          width={60}
          height={60}
          className="flex-shrink-0"
        />
      </div>
      <h2 className="text-gravel md:text-4xl font-bold">Account details</h2>
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
