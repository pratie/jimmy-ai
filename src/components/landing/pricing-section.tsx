
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            No complex tiers. One package to get your fully managed AI agent running 24/7.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="w-full flex flex-col justify-between rounded-2xl overflow-hidden transition-all duration-300 border border-border bg-card/40 backdrop-blur-2xl shadow-large relative">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold rounded-bl-xl shadow-glow">
              Most Popular
            </div>

            <CardHeader className="pb-4 text-center pt-10">
              <CardTitle className="text-2xl font-bold text-foreground mb-2">Concierge Package</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Everything you need to automate sales & support
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6 text-center">
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold text-foreground tracking-tight">$97</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  + $500 one-time setup fee
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-6 pt-6 border-t border-border bg-card/20">
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
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-foreground/90 text-sm font-medium">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="w-full px-4 pb-4">
                <a href="https://cal.com/prathap-reddy-caxwn4/15min" target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-glow transition-all">
                    Get Started Now
                  </Button>
                </a>
                <p className="text-center text-xs text-muted-foreground mt-4">
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
