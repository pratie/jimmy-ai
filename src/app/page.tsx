import NavBar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { pricingCards } from '@/constants/landing-page'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  return (
    <main className="bg-white min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
                <div className="relative flex items-center justify-center flex-col mt-[80px] gap-6 px-4">
          <span className="text-red-600 bg-red-100 px-6 py-3 rounded-full text-sm font-semibold">
            🚀 Transform Your Business with AI
          </span>

          <div className="text-center space-y-6">
            <Image
              src="/images/icon-ai-logo.png" // New Logo
              width={500}
              height={100}
              alt="Icon AI Logo"
              className="max-w-lg object-contain mx-auto"
            />

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Automate. Engage. Grow.
            </h1>

            <p className="text-gray-700 text-xl max-w-[600px] mx-auto leading-relaxed">
              Deploy Icon AI on your website to capture leads 24/7, book appointments automatically, and provide instant support.
              <span className="text-gray-900 font-bold"> Stop losing customers. Start closing deals.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
              🚀 Get Started For Free
            </Button>
            <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-4 text-lg">
              📖 See It In Action
            </Button>
          </div>

          <div className="mt-12 relative">
                        <Image
              src="/images/app-ui.png" // Updated hero image
              width={800}
              height={600}
              alt="Icon AI Dashboard"
              className="max-w-4xl object-contain relative z-10 drop-shadow-2xl rounded-2xl border-2 border-gray-200/50"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your All-In-One Customer Interaction Platform
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Icon AI provides all the tools you need to turn website visitors into loyal customers. Stop juggling multiple platforms and start streamlining your workflow.
            </p>
          </div>
          {/* Feature cards would go here */}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pricing That Scales With You
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Simple, transparent pricing. No hidden fees. Choose the plan that&apos;s right for your business.
            </p>
          </div>

          <div className="flex justify-center gap-6 flex-wrap px-4">
            {pricingCards.map((card) => (
              <Card
                key={card.title}
                className={clsx(
                  'w-[320px] flex flex-col justify-between bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl',
                  {
                    'border-2 border-red-600 relative': card.title === 'Unlimited',
                  }
                )}
              >
                {card.title === 'Unlimited' && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{card.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {pricingCards.find((c) => c.title === card.title)?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-6">
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{card.price}</span>
                    <span className="text-gray-500 text-lg ml-2">/ month</span>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-3 w-full">
                    {card.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-red-600" />
                        </div>
                        <p className="text-gray-700 text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/dashboard?plan=${card.title}`}
                    className={clsx(
                      'w-full text-center font-bold py-3 px-4 rounded-xl transition-all duration-300',
                      card.title === 'Unlimited'
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                        : 'bg-white text-red-600 border-2 border-red-200 hover:bg-red-50'
                    )}
                  >
                    Get Started
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}