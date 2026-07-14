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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Welcome back</p>
      <h1 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950">Sign in to your workspace</h1>
      <p className="mb-3 text-sm leading-6 text-slate-500">Manage client agents, conversations, and launches.</p>
      {USER_LOGIN_FORM.map((field) => (
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

export default LoginForm
