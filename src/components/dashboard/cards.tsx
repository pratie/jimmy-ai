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
      <div className="bg-white border border-border rounded-base shadow-shadow hover:shadow-light transition-all p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-base bg-main/15 flex items-center justify-center text-main">
              {icon}
            </div>
            <h3 className="font-heading text-sm text-slate-500">{title}</h3>
          </div>
        </div>

        <div className="flex items-end gap-2 mt-4">
          <p className="font-heading text-4xl text-slate-900 tracking-tight">
            {sales && '$'}
            {value}
          </p>
          {percentage !== undefined && percentage > 0 && (
            <span className="text-xs text-white font-heading mb-2 bg-main px-2.5 py-1 rounded-base shadow-light">
              +{percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardCard
