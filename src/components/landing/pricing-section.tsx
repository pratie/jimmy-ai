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
    <section id="pricing" className="bg-transparent py-20 mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary mb-6">
            Pricing That Scales With You
          </h2>
          <p className="text-brand-primary/70 text-lg max-w-2xl mx-auto mb-8">
            Simple, transparent pricing. No hidden fees. Choose the plan that&apos;s right for your business.
          </p>

          {/* Monthly/Yearly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={clsx('text-lg font-semibold', !isYearly ? 'text-brand-primary' : 'text-brand-primary/70')}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-brand-base-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:ring-offset-2"
            >
              <span
                className={clsx(
                  'inline-block h-6 w-6 transform rounded-full bg-brand-accent transition-transform',
                  isYearly ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
            <span className={clsx('text-lg font-semibold', isYearly ? 'text-brand-primary' : 'text-brand-primary/70')}>
              Yearly
              <span className="ml-2 text-sm bg-brand-accent/20 px-2 py-1 rounded-full">Save up to 40%</span>
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-6 flex-wrap px-4">
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

            return (
              <Card
                key={card.title}
                className={clsx(
                  'w-full max-w-[320px] sm:w-[320px] flex flex-col justify-between rounded-base overflow-hidden transition-all',
                  {
                    'bg-bg border-2 border-main shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none relative':
                      card.title === 'Business',
                    'bg-bg border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none': card.title !== 'Business',
                  }
                )}
              >
                {card.title === 'Business' && (
                  <div className="absolute top-0 right-0 bg-main text-black px-4 py-1 text-sm font-heading border-2 border-border border-t-0 border-r-0 rounded-bl-base shadow-[2px_2px_0px_0px_#000]">
                    ⭐ Most Popular
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-brand-primary mb-2">{card.title}</CardTitle>
                  <CardDescription className="text-brand-primary/70 text-base">{card.description}</CardDescription>
                </CardHeader>

                <CardContent className="pb-6">
                  {isYearly && card.yearlyPrice ? (
                    // Yearly pricing display with psychology
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold text-brand-primary">${monthlyEquivalent}</span>
                        <span className="text-brand-primary/60 text-lg">/ month</span>
                      </div>
                      {card.price !== '$0' && (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-brand-primary/40 text-sm line-through">{card.price}/month</span>
                            <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                              Save {savingsPercent}%
                            </span>
                          </div>
                          <p className="text-brand-primary/60 text-sm">
                            Billed {card.yearlyPrice} annually
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    // Monthly pricing display
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-brand-primary">{card.price}</span>
                        {card.duration && <span className="text-brand-primary/60 text-lg">/ {card.duration}</span>}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-6 pt-4 border-t-2 border-brand-base-300">
                  <div className="space-y-3 w-full">
                    {card.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-brand-primary" />
                        </div>
                        <p className="text-brand-primary/70 text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/dashboard?plan=${card.title}`}
                    className={clsx(
                      'w-full text-center font-heading py-3 px-4 rounded-base transition-all border-2',
                      card.title === 'Business'
                        ? 'bg-main text-black border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                        : 'bg-bg text-text border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                    )}
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
