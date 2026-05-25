import React from 'react'

type Props = {
  title: string
  value: number
  icon: JSX.Element
  sales?: boolean
  percentage?: number
}

const DashboardCard = ({ icon, title, value, sales, percentage }: Props) => {
  return (
    <div className="group relative flex-1 min-w-[280px]">
      <div className="bg-card border border-white/[0.04] rounded-base shadow-[0_20px_45px_rgba(0,0,0,0.5)] hover:border-white/[0.08] transition-all p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-base bg-[#0071E3]/15 flex items-center justify-center text-[#0071E3]">
              {icon}
            </div>
            <h3 className="font-heading text-sm text-white/60">{title}</h3>
          </div>
        </div>

        <div className="flex items-end gap-2 mt-4">
          <p className="font-heading text-4xl text-white tracking-tight">
            {sales && '$'}
            {value}
          </p>
          {percentage !== undefined && percentage > 0 && (
            <span className="text-xs text-white font-heading mb-2 bg-[#0071E3] px-2.5 py-1 rounded-base shadow-[0_4px_12px_rgba(0,113,227,0.3)]">
              +{percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardCard
