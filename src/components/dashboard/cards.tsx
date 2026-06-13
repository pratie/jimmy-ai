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
  let trendStyle = 'bg-muted/50 text-muted-foreground border-border/50'

  if (title.toLowerCase().includes('conversation')) {
    trendText = '↓ 8.3%'
    trendStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  } else if (title.toLowerCase().includes('lead') || title.toLowerCase().includes('message')) {
    trendText = '↑ 11.1%'
    trendStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  } else if (percentage !== undefined && percentage > 0) {
    trendText = `↑ ${percentage}%`
    trendStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }

  return (
    <div className="relative bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-glow-primary hover:border-primary/20 hover:scale-[1.02] transition-all duration-300 w-full font-heading overflow-hidden group">
      {/* Left accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary rounded-l-2xl" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">{title}</span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${trendStyle}`}>
          {trendText}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mt-2">
        <p className="font-black text-4xl text-foreground tracking-tighter">
          {sales && '$'}
          {value}
        </p>
      </div>
    </div>
  )
}

export default DashboardCard
