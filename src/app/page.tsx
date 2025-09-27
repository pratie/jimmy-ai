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
    <main className="bg-gradient-to-br from-orange-50 via-white to-orange-100 min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-orange-300/5 to-white"></div>
        <div className="relative flex items-center justify-center flex-col mt-[80px] gap-6 px-4">
          <span className="text-white bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
            🤖 AI Powered Sales Assistant Chatbot
          </span>

          <div className="text-center space-y-6">
            <Image
              src="/images/corinna-ai-logo.png"
              width={500}
              height={100}
              alt="Corinna AI Logo"
              className="max-w-lg object-contain mx-auto"
            />

            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent leading-tight">
              Your AI Sales Assistant
            </h1>

            <p className="text-gray-700 text-xl max-w-[600px] mx-auto leading-relaxed">
              Embed Corinna AI into any website with just a snippet of code.
              <span className="text-orange-600 font-semibold"> Boost conversions </span>
              and provide 24/7 customer support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
              🚀 Start For Free
            </Button>
            <Button variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold px-8 py-4 text-lg">
              📖 View Demo
            </Button>
          </div>

          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-100/50 to-transparent rounded-3xl"></div>
            <Image
              src="/images/iphonecorinna.png"
              width={400}
              height={100}
              alt="Corinna AI Demo"
              className="max-w-lg object-contain relative z-10 drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-6">
              Choose Your Perfect Plan
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our straightforward pricing plans are tailored to meet your needs.
              Start your AI journey today with our flexible options.
            </p>
          </div>

          <div className="flex justify-center gap-6 flex-wrap px-4">
            {pricingCards.map((card) => (
              <Card
                key={card.title}
                className={clsx(
                  'w-[320px] flex flex-col justify-between bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl',
                  {
                    'border-3 border-orange-500 bg-gradient-to-br from-orange-50 to-white relative': card.title === 'Unlimited',
                  }
                )}
              >
                {card.title === 'Unlimited' && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-orange-600 mb-2">{card.title}</CardTitle>
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
                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-orange-600" />
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
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg'
                        : 'bg-orange-50 text-orange-600 border-2 border-orange-200 hover:bg-orange-100 hover:border-orange-300'
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

      {/* News/Blog Section */}
      <section className="bg-gradient-to-r from-orange-50 to-white py-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-6">
              Latest Insights
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore our insights on AI, technology, and optimizing your business
              with cutting-edge automation solutions.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}