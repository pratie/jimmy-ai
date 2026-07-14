import type { Metadata } from 'next'
import ButtonHandler from '@/components/forms/sign-up/button-handlers'
import SignUpFormProvider from '@/components/forms/sign-up/form-provider'
import RegistrationFormStep from '@/components/forms/sign-up/registration-step'

import React from 'react'

type Props = {}

const SignUp = (props: Props) => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-5">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Start free</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950">Create your agency workspace</h1><p className="mt-2 text-sm leading-6 text-slate-500">Build and test your first client agent with 100 included credits.</p></div>
        <SignUpFormProvider>
          <div className="flex flex-col gap-4">
            <RegistrationFormStep />
            <ButtonHandler />
          </div>
        </SignUpFormProvider>
      </div>
    </div>
  )
}

export default SignUp

export const metadata: Metadata = {
  title: 'Create account — ChatDock',
  alternates: { canonical: '/auth/sign-up' },
  robots: { index: false, follow: false },
}
