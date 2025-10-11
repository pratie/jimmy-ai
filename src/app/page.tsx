import NavBar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import PricingSection from '@/components/landing/pricing-section'

export default async function Home() {
  return (
    <main className="landing-gradient min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden landing-hero">
                <div className="relative flex items-center justify-center flex-col pt-24 md:pt-[80px] gap-6 px-4">
          <span className="text-brand-primary bg-brand-secondary backdrop-blur-sm px-6 py-3 rounded-full text-sm font-semibold border-2 border-brand-base-300 shadow-sm">
            ✨ No Credit Card Required to Start
          </span>

          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-primary leading-tight">
              Automate. Engage. Grow.
            </h1>

            <p className="text-brand-primary/70 text-lg md:text-xl max-w-[600px] mx-auto leading-relaxed">
              Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep.
              <span className="text-brand-primary font-bold"> Turn visitors into customers automatically.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-8 py-4 text-lg shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-brand-primary">
              Get Started For Free
            </Button>
          </div>

          <div className="mt-12 relative w-full max-w-4xl">
            <Image
              src="/images/app-ui.png"
              width={800}
              height={600}
              alt="AI Agent Dashboard"
              className="w-full h-auto object-contain relative z-10 drop-shadow-2xl rounded-2xl border-4 border-brand-base-300 bg-white/50 backdrop-blur-sm p-2"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
            />
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="bg-brand-primary text-white rounded-3xl px-6 py-8 md:px-10 md:py-10 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 items-center">
              <div className="flex flex-col items-start">
                <div className="text-4xl md:text-5xl font-extrabold text-brand-success">3.2x</div>
                <div className="opacity-80 text-sm md:text-base mt-1">Conversion Rate</div>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-4xl md:text-5xl font-extrabold text-brand-info">70%</div>
                <div className="opacity-80 text-sm md:text-base mt-1">Less Support Tickets</div>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-4xl md:text-5xl font-extrabold text-brand-yellow">24/7</div>
                <div className="opacity-80 text-sm md:text-base mt-1">Always Available</div>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-4xl md:text-5xl font-extrabold text-brand-accent">&lt;2min</div>
                <div className="opacity-80 text-sm md:text-base mt-1">Setup Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-transparent py-20 mt-20" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary mb-6">
              Work Less. Earn More. It&apos;s That Simple.
            </h2>
            <p className="text-brand-primary/70 text-lg max-w-3xl mx-auto">
              Your AI agent knows your business inside out. It answers questions, qualifies leads, and books meetings—all trained on your company data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* Feature 1: Lead Capture */}
            <div className="bg-brand-base-100 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-brand-base-300 hover:border-brand-accent/60 hover:scale-105">
              <div className="w-14 h-14 bg-brand-accent/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Capture Every Lead, 24/7</h3>
              <p className="text-brand-primary/70 mb-4">
                Your AI agent works around the clock—answering questions at 2 AM, qualifying leads during meetings, and following up instantly. No more missed opportunities.
              </p>
              <p className="text-brand-primary font-semibold bg-brand-accent/20 px-3 py-1 rounded-lg inline-block">
                Average result: 3x more qualified leads per month
              </p>
            </div>

            {/* Feature 2: Appointment Booking */}
            <div className="bg-brand-base-100 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-brand-base-300 hover:border-brand-info/60 hover:scale-105">
              <div className="w-14 h-14 bg-brand-info/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Book Appointments Instantly</h3>
              <p className="text-brand-primary/70 mb-4">
                Stop the endless back-and-forth. Your AI agent books meetings instantly, syncs with your calendar, and sends automatic reminders. Simple, fast, done.
              </p>
              <p className="text-brand-primary font-semibold bg-brand-info/20 px-3 py-1 rounded-lg inline-block">
                Save 15+ hours per week on scheduling
              </p>
            </div>

            {/* Feature 3: Instant Support */}
            <div className="bg-brand-base-100 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-brand-base-300 hover:border-brand-success/60 hover:scale-105">
              <div className="w-14 h-14 bg-brand-success/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Instant Answers, Every Time</h3>
              <p className="text-brand-primary/70 mb-4">
                Trained on your company data, your AI agent answers pricing questions, handles objections, and provides accurate information instantly—turning curious visitors into paying customers.
              </p>
              <p className="text-brand-primary font-semibold bg-brand-success/20 px-3 py-1 rounded-lg inline-block">
                Reduce bounce rate by up to 40%
              </p>
            </div>

            {/* Feature 4: Email Marketing */}
            <div className="bg-brand-base-100 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-brand-base-300 hover:border-brand-accent/60 hover:scale-105">
              <div className="w-14 h-14 bg-brand-accent/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Automated Email Campaigns</h3>
              <p className="text-brand-primary/70 mb-4">
                Nurture leads automatically with personalized emails, timely follow-ups, and targeted offers. Set it up once, let it run forever.
              </p>
              <p className="text-brand-primary font-semibold bg-brand-accent/20 px-3 py-1 rounded-lg inline-block">
                Boost conversion rates by 25%+
              </p>
            </div>

            {/* Feature 5: Multi-Domain */}
            <div className="bg-brand-base-100 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-brand-base-300 hover:border-brand-info/60 hover:scale-105">
              <div className="w-14 h-14 bg-brand-info/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Manage Multiple Websites</h3>
              <p className="text-brand-primary/70 mb-4">
                Run multiple businesses? One dashboard controls everything. Different sites, different AI agents, all trained on their specific data. Scale effortlessly.
              </p>
              <p className="text-brand-primary font-semibold bg-brand-info/20 px-3 py-1 rounded-lg inline-block">
                Manage unlimited domains effortlessly
              </p>
            </div>

            {/* Feature 6: Real-Time Analytics */}
            <div className="bg-brand-base-100 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-brand-base-300 hover:border-brand-accent/60 hover:scale-105">
              <div className="w-14 h-14 bg-brand-accent/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-primary mb-3">Real-Time Analytics</h3>
              <p className="text-brand-primary/70 mb-4">
                Track every lead, conversation, and conversion in real-time. See what&apos;s working, optimize what&apos;s not, and watch your revenue grow. Data-driven decisions made simple.
              </p>
              <p className="text-brand-primary font-semibold bg-brand-accent/20 px-3 py-1 rounded-lg inline-block">
                Full visibility into your revenue pipeline
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <p className="text-2xl font-bold text-brand-primary mb-6">
              Your AI agent handles the work. You handle the growth.
            </p>
            <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-10 py-5 text-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-brand-primary">
              Start Your Free Trial →
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />
    </main>
  )
}
