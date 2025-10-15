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
      <div className="bg-bg dark:bg-darkBg border-2 border-border rounded-base shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-base bg-main border-2 border-border shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-black">
              {icon}
            </div>
            <h3 className="font-heading text-sm text-text/70 dark:text-darkText/70">{title}</h3>
          </div>
        </div>

        <div className="flex items-end gap-2 mt-4">
          <p className="font-heading text-4xl text-text dark:text-darkText tracking-tight">
            {sales && '$'}
            {value}
          </p>
          {percentage !== undefined && percentage > 0 && (
            <span className="text-xs text-black font-heading mb-2 bg-main px-2.5 py-1 rounded-base border-2 border-border shadow-[2px_2px_0px_0px_#000]">
              +{percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardCard
