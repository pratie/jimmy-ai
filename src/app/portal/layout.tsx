import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="landing-gradient flex flex-col min-h-screen">
      {children}
    </div>
  )
}

export default Layout
