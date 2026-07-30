import React from 'react'
import { Label } from '../ui/label'
import { cn } from '@/lib/utils'
import { Input } from '../ui/input'
import { pricingCards } from '@/constants/landing-page'
import { Check } from 'lucide-react'

type Props = {
  title: string
  description: string
  price: string
  onPayment(payment: string): void
  payment: string
  id: string
}

const SubscriptionCard = ({
  title,
  description,
  price,
  onPayment,
  payment,
  id,
}: Props) => {
  // Card titles in constants are Title Case ('Pro'); plan ids are upper ('PRO')
  const landing = pricingCards.find(
    (c) => c.title.toUpperCase() === title.toUpperCase()
  )
  const topFeatures = landing?.features?.slice(0, 3) || []
  const isPopular = title.toUpperCase() === 'PRO'
  const isSelected = payment === id

  return (
    <Label htmlFor={id} className="cursor-pointer">
      <div
        className={cn(
          'press relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border-2 bg-white p-5 transition-all duration-200',
          isSelected
            ? 'border-[#5b5ce2] shadow-[0_12px_32px_-12px_rgba(91,92,226,0.45)]'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
        )}
      >
        {isPopular && (
          <div className="absolute right-0 top-0 rounded-bl-xl bg-[#5b5ce2] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Most popular
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">{title.charAt(0) + title.slice(1).toLowerCase()}</h3>
            {isSelected && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#5b5ce2] text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">${price}</span>
            <span className="text-sm text-slate-400">/ month</span>
          </div>
        </div>
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          {topFeatures.map((f) => (
            <div key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <p className="text-xs leading-5 text-slate-600">{f}</p>
            </div>
          ))}
        </div>
        <Input
          onClick={() => onPayment(title)}
          value={id}
          id={id}
          className="hidden"
          type="radio"
        />
      </div>
    </Label>
  )
}

export default SubscriptionCard
