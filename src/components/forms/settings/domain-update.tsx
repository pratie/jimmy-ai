import React from 'react'

import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import FormGenerator from '../form-generator'

type DomainUpdateProps = {
  name: string
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

/** Sits inside the workspace's Identity section, so it takes the width it is
 *  given rather than the 400px it used to insist on. */
export const DomainUpdate = ({ name, register, errors }: DomainUpdateProps) => {
  return (
    <div className="w-full max-w-sm text-[12px] font-semibold text-foreground">
      <FormGenerator
        label="Domain name"
        register={register}
        name="domain"
        errors={errors}
        type="text"
        inputType="input"
        placeholder={name}
      />
    </div>
  )
}
