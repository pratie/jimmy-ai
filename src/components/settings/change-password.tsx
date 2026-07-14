'use client'
import { useChangePassword } from '@/hooks/settings/use-settings'
import React from 'react'
import Section from '../section-label'
import FormGenerator from '../forms/form-generator'
import { Button } from '../ui/button'
import { Loader } from '../loader'

type Props = {}

const ChangePassword = (props: Props) => {
  const { register, errors, onChangePassword, loading } = useChangePassword()

  return (
    <section className="grid gap-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_24px_rgba(15,23,42,.035)] lg:grid-cols-[220px_minmax(0,1fr)] md:p-7">
      <div>
        <Section
          label="Change Password"
          message="Reset your password"
        />
      </div>
      <form
        onSubmit={onChangePassword}
        className="max-w-lg"
      >
        <div className="flex flex-col gap-3">
          <FormGenerator
            register={register}
            errors={errors}
            name="password"
            placeholder="New Password"
            type="password"
            inputType="input"
          />
          <FormGenerator
            register={register}
            errors={errors}
            name="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            inputType="input"
          />
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow">
            <Loader loading={loading}>Change Password</Loader>
          </Button>
        </div>
      </form>
    </section>
  )
}

export default ChangePassword
