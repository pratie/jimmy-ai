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
    <main className="bg-transparent min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-transparent">
                <div className="relative flex items-center justify-center flex-col pt-24 md:pt-[80px] gap-6 px-4">
          <span className="text-red-600 bg-red-100 px-6 py-3 rounded-full text-sm font-semibold">
            🚀 Transform Your Business with AI
          </span>

          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Automate. Engage. Grow.
            </h1>

            <p className="text-gray-700 text-lg md:text-xl max-w-[600px] mx-auto leading-relaxed">
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
      <section className="bg-transparent py-20 mt-20" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Work Less. Earn More. It&apos;s That Simple.
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              While your competitors waste time on manual follow-ups, you&apos;ll be closing deals in your sleep. Icon AI works 24/7 so you don&apos;t have to.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* Feature 1: Lead Capture */}
            <div className="bg-white/90 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Never Miss a Lead Again</h3>
              <p className="text-gray-600 mb-4">
                Every visitor who lands on your site at 2 AM? Captured. Every question while you&apos;re in a meeting? Answered. Your AI assistant never sleeps, never takes breaks, and never forgets to follow up.
              </p>
              <p className="text-red-600 font-semibold">
                Average result: 3x more qualified leads per month
              </p>
            </div>

            {/* Feature 2: Appointment Booking */}
            <div className="bg-white/90 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Stop Playing Phone Tag</h3>
              <p className="text-gray-600 mb-4">
                No more back-and-forth emails. No more &quot;when are you free?&quot; No more lost opportunities. Icon AI books appointments instantly, syncs with your calendar, and sends reminders automatically.
              </p>
              <p className="text-red-600 font-semibold">
                Save 15+ hours per week on scheduling
              </p>
            </div>

            {/* Feature 3: Instant Support */}
            <div className="bg-white/90 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Answer Questions Before They Bounce</h3>
              <p className="text-gray-600 mb-4">
                73% of visitors leave if they can&apos;t find answers fast. Your AI responds in seconds with personalized answers to pricing, features, and objections—turning &quot;just browsing&quot; into &quot;ready to buy.&quot;
              </p>
              <p className="text-red-600 font-semibold">
                Reduce bounce rate by up to 40%
              </p>
            </div>

            {/* Feature 4: Email Marketing */}
            <div className="bg-white/90 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Turn Leads Into Customers On Autopilot</h3>
              <p className="text-gray-600 mb-4">
                Captured a lead? Great. Now watch Icon AI nurture them with perfectly timed emails, special offers, and follow-ups that actually get opened. Set it once, profit forever.
              </p>
              <p className="text-red-600 font-semibold">
                Boost conversion rates by 25%+
              </p>
            </div>

            {/* Feature 5: Multi-Domain */}
            <div className="bg-white/90 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scale Without The Headache</h3>
              <p className="text-gray-600 mb-4">
                Running multiple websites? Manage everything from one dashboard. Different brands, different chatbots, same powerful automation. Build your empire without building a team.
              </p>
              <p className="text-red-600 font-semibold">
                Manage unlimited domains effortlessly
              </p>
            </div>

            {/* Feature 6: Real-Time Analytics */}
            <div className="bg-white/90 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Know Exactly What&apos;s Working</h3>
              <p className="text-gray-600 mb-4">
                No more guessing games. See exactly how many leads you captured, which messages convert best, and your ROI in real-time. Make data-driven decisions that actually move the needle.
              </p>
              <p className="text-red-600 font-semibold">
                Full visibility into your revenue pipeline
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <p className="text-2xl font-bold text-gray-900 mb-6">
              The math is simple: More leads + Less time = More money in your pocket.
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-5 text-xl shadow-lg transition-all duration-300 transform hover:scale-105">
              Start Making Money 24/7 →
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-transparent py-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
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
                  'w-full max-w-[320px] sm:w-[320px] flex flex-col justify-between bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl',
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