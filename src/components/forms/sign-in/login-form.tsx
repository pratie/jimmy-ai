'use client'
import React, { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { USER_LOGIN_FORM } from '@/constants/forms'
import { useSearchParams } from 'next/navigation'

type Props = {}

const LoginForm = (props: Props) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext()
  const params = useSearchParams()

  // Prefill email from query param if present (e.g., after signup email already exists)
  const emailFromQuery = params.get('email') || ''

  useEffect(() => {
    if (emailFromQuery) {
      setValue('email', emailFromQuery, { shouldDirty: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromQuery])
  return (
    <>
      <h2 className="text-gravel md:text-4xl font-bold">Login</h2>
      <p className="text-iridium md:text-sm">Enter your email and password</p>
      {USER_LOGIN_FORM.map((field) => (
        <FormGenerator
          key={field.id}
          {...field}
          errors={errors}
          register={register}
          name={field.name}
        />
      ))}
    </>
  )
}

export default LoginForm
