import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import React from 'react'
import AuthThemeEnforcer from '@/components/auth/theme-enforcer'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const user = await currentUser()

  // Redirect authenticated users to dashboard
  if (user) redirect('/dashboard')

  return (
    <div className="landing-gradient h-screen flex w-full justify-center items-center">
      <AuthThemeEnforcer />
      <div className="w-[600px] flex flex-col items-center p-6">
        {children}
      </div>
    </div>
  )
}

export default Layout
