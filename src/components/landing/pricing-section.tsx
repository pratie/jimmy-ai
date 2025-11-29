'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { pricingCards } from '@/constants/landing-page'
import { Check } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { Button } from '../ui/button'

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section
      id="pricing"
      className="py-24 relative"
      data-fast-scroll="viewed_pricing"
      data-fast-scroll-threshold="0.3"
    >
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Pricing That Scales With You
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Cheaper than a support agent. Faster than a founder. Simple, transparent pricing that scales with you.
          </p>

          {/* Monthly/Yearly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={clsx('text-sm font-medium transition-colors', !isYearly ? 'text-white' : 'text-slate-400')}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-7 w-12 items-center rounded-full bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
              data-fast-goal="toggled_yearly_pricing"
            >
              <span
                className={clsx(
                  'inline-block h-5 w-5 transform rounded-full bg-blue-500 transition-transform shadow-sm',
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span className={clsx('text-sm font-medium transition-colors', isYearly ? 'text-white' : 'text-slate-400')}>
              Yearly
              <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Save 40%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
          {pricingCards.map((card) => {
            // Calculate monthly equivalent for yearly plans
            const yearlyPriceNum = card.yearlyPrice ? parseInt(card.yearlyPrice.replace('$', '')) : 0
            const monthlyPriceNum = card.price ? parseInt(card.price.replace('$', '')) : 0
            // Use rounded monthly equivalent to stay consistent with settings upgrade UI
            const monthlyEquivalent = yearlyPriceNum > 0 ? Math.round(yearlyPriceNum / 12) : monthlyPriceNum

            // Calculate savings percentage
            const savingsPercent = monthlyPriceNum > 0
              ? Math.round(((monthlyPriceNum * 12 - yearlyPriceNum) / (monthlyPriceNum * 12)) * 100)
              : 0

            const isBusiness = card.title === 'Business'

            return (
              <Card
                key={card.title}
                className={clsx(
                  'w-full flex flex-col justify-between rounded-xl overflow-hidden transition-all duration-300 border',
                  {
                    'glass-card border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative': isBusiness,
                    'glass-card border-white/10 hover:border-white/20': !isBusiness,
                  }
                )}
              >
                {isBusiness && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white mb-2">{card.title}</CardTitle>
                  <CardDescription className="text-slate-400 text-sm">{card.description}</CardDescription>
                </CardHeader>

                <CardContent className="pb-6">
                  {isYearly && card.yearlyPrice ? (
                    // Yearly pricing display with psychology
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl font-bold text-white">${monthlyEquivalent}</span>
                        <span className="text-slate-500 text-sm">/mo</span>
                      </div>
                      {card.price !== '$0' && (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-500 text-sm line-through">{card.price}/mo</span>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">
                              Save {savingsPercent}%
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs">
                            Billed {card.yearlyPrice} annually
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    // Monthly pricing display
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">{card.price}</span>
                        {card.duration && <span className="text-slate-500 text-sm">/ {card.duration}</span>}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-6 pt-4 border-t border-white/5">
                  <div className="space-y-3 w-full">
                    {card.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-blue-400" />
                        </div>
                        <p className="text-slate-300 text-sm leading-tight">{feature}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/auth/sign-up?plan=${encodeURIComponent(card.title)}${isYearly ? '&billing=yearly' : ''}`}
                    className={clsx(
                      'w-full text-center text-sm font-semibold py-3 px-4 rounded-lg transition-all',
                      isBusiness
                        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    )}
                    data-fast-goal="clicked_pricing_cta"
                    data-fast-goal-plan={card.title.toLowerCase()}
                    data-fast-goal-price={isYearly ? monthlyEquivalent.toString() : card.price}
                    data-fast-goal-billing={isYearly ? 'yearly' : 'monthly'}
                  >
                    Get Started
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
