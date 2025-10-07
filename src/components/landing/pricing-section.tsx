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
    <section className="bg-transparent py-20 mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Pricing That Scales With You
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
            Simple, transparent pricing. No hidden fees. Choose the plan that&apos;s right for your business.
          </p>

          {/* Monthly/Yearly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={clsx('text-lg font-semibold', !isYearly ? 'text-text-primary' : 'text-text-secondary')}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-pastel-lavender/50 transition-colors focus:outline-none focus:ring-2 focus:ring-interactive-pink focus:ring-offset-2"
            >
              <span
                className={clsx(
                  'inline-block h-6 w-6 transform rounded-full bg-interactive-pink transition-transform',
                  isYearly ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
            <span className={clsx('text-lg font-semibold', isYearly ? 'text-text-primary' : 'text-text-secondary')}>
              Yearly
              <span className="ml-2 text-sm bg-interactive-pink/20 px-2 py-1 rounded-full">Save up to 40%</span>
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-6 flex-wrap px-4">
          {pricingCards.map((card) => {
            const displayPrice = isYearly && card.yearlyPrice ? card.yearlyPrice : card.price
            const displayDuration = isYearly ? 'year' : card.duration

            return (
              <Card
                key={card.title}
                className={clsx(
                  'w-full max-w-[320px] sm:w-[320px] flex flex-col justify-between shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl',
                  {
                    'bg-gradient-to-br from-pastel-pink/60 to-pastel-lavender/60 backdrop-blur-md border-3 border-interactive-pink/50 relative':
                      card.title === 'Business',
                    'bg-pastel-cream/60 backdrop-blur-md border-2 border-pastel-lavender/50': card.title !== 'Business',
                  }
                )}
              >
                {card.title === 'Business' && (
                  <div className="absolute top-0 right-0 bg-interactive-pink text-text-primary px-4 py-1 text-sm font-bold rounded-bl-lg shadow-md">
                    ⭐ Most Popular
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-text-primary mb-2">{card.title}</CardTitle>
                  <CardDescription className="text-text-secondary text-base">{card.description}</CardDescription>
                </CardHeader>

                <CardContent className="pb-6">
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-text-primary">{displayPrice}</span>
                    {displayDuration && <span className="text-text-muted text-lg ml-2">/ {displayDuration}</span>}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-6 pt-4 border-t-2 border-pastel-lavender/50">
                  <div className="space-y-3 w-full">
                    {card.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-interactive-pink/30 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-text-primary" />
                        </div>
                        <p className="text-text-secondary text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/dashboard?plan=${card.title}`}
                    className={clsx(
                      'w-full text-center font-bold py-3 px-4 rounded-xl transition-all duration-300',
                      card.title === 'Business'
                        ? 'bg-interactive-pink text-text-primary hover:bg-interactive-pink/90 shadow-lg border-2 border-interactive-pink/40'
                        : 'bg-pastel-sky/50 backdrop-blur-sm text-text-primary border-2 border-pastel-periwinkle hover:bg-pastel-sky/70'
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
