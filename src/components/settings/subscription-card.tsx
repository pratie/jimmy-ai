import React from 'react'
import { Label } from '../ui/label'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardTitle, CardHeader, CardFooter } from '../ui/card'
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
  // Map internal id/title to landing config title for features
  const mapToLandingTitle = (t: string) => {
    const up = t.toUpperCase()
    if (up === 'FREE') return 'Free'
    if (up === 'STARTER') return 'Starter'
    if (up === 'PRO') return 'Pro'
    if (up === 'BUSINESS') return 'Business'
    return t
  }

  const landing = pricingCards.find(
    (c) => c.title.toLowerCase() === mapToLandingTitle(title).toLowerCase()
  )
  const topFeatures = landing?.features?.slice(0, 3) || []
  const isPopular = title.toUpperCase() === 'BUSINESS'
  const isSelected = payment === id

  return (
    <Label htmlFor={id} className="cursor-pointer">
      <Card
        className={cn(
          'relative w-full flex flex-col justify-between rounded-base overflow-hidden transition-all bg-bg border-2 shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
          // Featured look like landing: Business card gets main border by default
          isSelected ? 'border-main bg-main/10' : (isPopular ? 'border-main' : 'border-border')
        )}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 bg-main text-black px-3 py-0.5 text-xs font-heading border-2 border-border border-t-0 border-r-0 rounded-bl-base">
            Most Popular
          </div>
        )}
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-brand-primary">{mapToLandingTitle(title)}</CardTitle>
          <CardDescription className="text-brand-primary/70 text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-brand-primary">${price}</span>
            <span className="text-brand-primary/60 text-lg">/ month</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3 pt-4 border-t-2 border-brand-base-300">
          <div className="space-y-2 w-full">
            {topFeatures.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-brand-primary" />
                </div>
                <p className="text-brand-primary/70 text-sm">{f}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 self-end">
            <div
              className={cn(
                'h-4 w-4 rounded-full border-2',
                isSelected ? 'border-brand-accent bg-brand-accent' : 'border-brand-base-300 bg-white'
              )}
            />
            <Input
              onClick={() => onPayment(title)}
              value={id}
              id={id}
              className="hidden"
              type="radio"
            />
          </div>
        </CardFooter>
      </Card>
    </Label>
  )
}

export default SubscriptionCard
