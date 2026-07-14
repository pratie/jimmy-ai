import { USER_REGISTRATION_FORM } from '@/constants/forms'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import FormGenerator from '../form-generator'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

function AccountDetailsForm({ errors, register }: Props) {
  return (
    <>
      <p className="text-sm font-semibold text-slate-800">Account details</p>
      <p className="mb-1 text-xs text-slate-500">Use the email you want associated with the agency.</p>
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
