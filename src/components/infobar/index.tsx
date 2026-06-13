import React from 'react'
import BreadCrumb from './bread-crumb'

type Props = {}

const InfoBar = (props: Props) => {
  return (
    <div className="flex w-full justify-between items-center py-3 mb-2 px-4 md:px-8 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <BreadCrumb />
    </div>
  )
}

export default InfoBar
