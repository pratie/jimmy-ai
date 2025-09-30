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
    <div className=" rounded-lg flex flex-col gap-3 pr-10 pl-10 py-10 md:pl-10 md:pr-20 border-[1px] border-border bg-cream dark:bg-muted md:w-fit w-full">
      <div className="flex gap-3">
        {icon}
        <h2 className="font-bold text-xl">{title}</h2>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="font-bold text-4xl">
          {sales && '$'}
          {value}
        </p>
        {percentage !== undefined && percentage > 0 && (
          <span className="text-sm text-gray-500 font-normal">
            ({percentage}% conversion)
          </span>
        )}
      </div>
    </div>
  )
}

export default DashboardCard
