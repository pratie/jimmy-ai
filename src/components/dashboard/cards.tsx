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
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sauce-black via-sauce-gray to-sauce-black rounded-t-lg"></div>

      <div className="bg-white border border-sauce-cyan/40 rounded-lg shadow-sm hover:shadow-md transition-all p-5 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sauce-purple/10 flex items-center justify-center text-sauce-purple">
              {icon}
            </div>
            <h3 className="font-medium text-sm text-sauce-gray">{title}</h3>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <p className="font-bold text-3xl text-sauce-black">
            {sales && '$'}
            {value}
          </p>
          {percentage !== undefined && percentage > 0 && (
            <span className="text-xs text-accent-green font-semibold mb-1 bg-accent-green/10 px-2 py-0.5 rounded">
              {percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardCard
