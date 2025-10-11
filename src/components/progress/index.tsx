'use client'
import React from 'react'

import { Progress } from '@/components/ui/progress'

type ProgressBarProps = {
  label: string
  end: number
  credits: number
}

export const ProgressBar = ({ label, end, credits }: ProgressBarProps) => {
  const percentage = Math.min((credits / end) * 100, 100)
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm text-brand-primary">{label}</h3>
        <span className="text-xs text-brand-primary/70">
          {credits} / {end}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <Progress
          value={percentage}
          className="w-full h-2 [&>div]:bg-gradient-to-r [&>div]:from-brand-accent [&>div]:via-brand-primary [&>div]:to-brand-accent"
        />
      </div>
    </div>
  )
}
