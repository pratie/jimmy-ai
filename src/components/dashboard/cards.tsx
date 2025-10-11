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
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-accent via-brand-primary to-brand-accent rounded-t-lg"></div>

      <div className="bg-white/90 backdrop-blur-sm border border-brand-base-300 rounded-lg shadow-sm hover:shadow-md transition-all p-6 pt-7">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-accent/20 to-brand-primary/10 flex items-center justify-center text-brand-accent border border-brand-accent/20">
              {icon}
            </div>
            <h3 className="font-medium text-sm text-brand-primary/60">{title}</h3>
          </div>
        </div>

        <div className="flex items-end gap-2 mt-4">
          <p className="font-bold text-4xl text-brand-primary tracking-tight">
            {sales && '$'}
            {value}
          </p>
          {percentage !== undefined && percentage > 0 && (
            <span className="text-xs text-emerald-600 font-semibold mb-2 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              +{percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardCard
