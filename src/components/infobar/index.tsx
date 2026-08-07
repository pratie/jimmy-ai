import React from 'react'
import BreadCrumb from './bread-crumb'

const InfoBar = () => (
  <header className="sticky top-0 z-30 flex min-h-[68px] w-full items-center border-b border-border bg-background/90 px-5 backdrop-blur-xl md:px-8">
    <BreadCrumb />
  </header>
)

export default InfoBar
