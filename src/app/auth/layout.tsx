import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const user = await currentUser()

  // Redirect authenticated users to dashboard
  if (user) redirect('/dashboard')

  return (
    <div className="landing-gradient h-screen flex w-full justify-center">
      <div className="w-[600px] ld:w-full flex flex-col items-start p-6">
        <Image
          src="/images/logo.svg"
          alt="Logo"
          sizes="100vw"
          style={{
            width: '60px',
            height: 'auto',
          }}
          width={0}
          height={0}
        />
        {children}
      </div>
      <div className="hidden lg:flex flex-1 w-full max-h-full max-w-4000px overflow-hidden relative flex-col pt-10 pl-24 gap-3">
        <h2 className="text-gravel md:text-4xl font-bold">
          Transform Customer Conversations into Sales
        </h2>
        <p className="text-iridium md:text-sm mb-10">
          Our AI chatbot engages visitors naturally, captures leads intelligently,{' '}
          <br />
          and schedules appointments automatically—all without traditional forms.
        </p>
        <Image
          src="/images/app-ui.png"
          alt="app image"
          loading="lazy"
          sizes="30"
          className="absolute shrink-0 !w-[1600px] top-48"
          width={0}
          height={0}
        />
      </div>
    </div>
  )
}

export default Layout
