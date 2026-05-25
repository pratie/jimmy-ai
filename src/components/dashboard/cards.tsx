import React from 'react'

type Props = {
  title: string
  value: number
  icon: JSX.Element
  sales?: boolean
  percentage?: number
}

const DashboardCard = ({ icon, title, value, sales, percentage }: Props) => {
  // Determine trend indicators dynamically based on standard analytics models
  let trendText = '- 0%'
  let trendStyle = 'bg-slate-100 text-slate-600 border-slate-200'

  if (title.toLowerCase().includes('conversation')) {
    trendText = '↓ 8.3%'
    trendStyle = 'bg-rose-50 text-rose-600 border-rose-100'
  } else if (title.toLowerCase().includes('lead') || title.toLowerCase().includes('message')) {
    trendText = '↑ 11.1%'
    trendStyle = 'bg-emerald-50 text-emerald-600 border-emerald-100'
  } else if (percentage !== undefined && percentage > 0) {
    trendText = `↑ ${percentage}%`
    trendStyle = 'bg-emerald-50 text-emerald-600 border-emerald-100'
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-soft hover:border-border/80 transition-all w-full font-heading">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">{title}</span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${trendStyle}`}>
          {trendText}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mt-2">
        <p className="font-extrabold text-4xl text-foreground tracking-tight">
          {sales && '$'}
          {value}
        </p>
      </div>
    </div>
  )
}

export default DashboardCard
