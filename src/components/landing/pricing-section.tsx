
'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Check } from 'lucide-react'
import { Button } from '../ui/button'

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24 relative"
    >
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            No complex tiers. One package to get your fully managed AI agent running 24/7.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="w-full flex flex-col justify-between rounded-xl overflow-hidden transition-all duration-300 border glass-card-light dark:glass-card border-slate-200 dark:border-white/10 shadow-lg relative">
            <div className="absolute top-0 right-0 bg-slate-900 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
              Most Popular
            </div>

            <CardHeader className="pb-4 text-center pt-8">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Concierge Package</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                Everything you need to automate sales & support
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6 text-center">
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">$97</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
                <p className="text-slate-500 text-sm">
                  + $500 one-time setup fee
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-6 pt-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="space-y-4 w-full px-4">
                {[
                  'Full "Done-For-You" Setup',
                  'Custom Knowledge Base Training',
                  'Weekly Performance Tuning',
                  '24/7 Monitoring & Support',
                  'Monthly Strategy Call',
                  'Unlimited Conversations'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-slate-900 dark:text-white" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="w-full px-4 pb-4">
                <a href="https://cal.com/prathap-reddy-caxwn4/15min" target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button className="w-full h-12 bg-slate-900 hover:bg-black text-white font-medium rounded-lg shadow-md transition-all">
                    Get Started Now
                  </Button>
                </a>
                <p className="text-center text-xs text-slate-500 mt-4">
                  100% Satisfaction Guarantee
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
