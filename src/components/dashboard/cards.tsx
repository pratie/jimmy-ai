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
      <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-medium hover:border-border/80 transition-all p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
            <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
          </div>
        </div>

        <div className="flex items-end gap-2 mt-4">
          <p className="font-bold text-4xl text-foreground tracking-tight">
            {sales && '$'}
            {value}
          </p>
          {percentage !== undefined && percentage > 0 && (
            <span className="text-xs text-primary-foreground font-medium mb-2 bg-primary px-2.5 py-1 rounded-md shadow-glow">
              +{percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardCard
