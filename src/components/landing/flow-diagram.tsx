'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FlowDiagram() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const steps = [
    {
      number: '1',
      title: 'Sign up for free',
      description: 'Create your account in 30 seconds',
      position: 'left',
      showCTA: true,
    },
    {
      number: '2',
      title: 'Train your AI',
      description: 'Upload products, FAQs, or website content',
      position: 'right',
    },
    {
      number: '3',
      title: 'Customize your chatbot',
      description: 'Match your brand colors, tone, and voice',
      position: 'left',
    },
    {
      number: '4',
      title: 'Add to your website',
      description: 'Copy one line of code - works with any platform',
      position: 'right',
    },
    {
      number: '5',
      title: 'Start converting visitors',
      description: 'AI handles questions, qualifies leads, books calls',
      position: 'left',
    },
    {
      number: '6',
      title: 'Track your results',
      description: 'See conversions, popular questions, and ROI',
      position: 'right',
    },
  ]

  return (
    <section className="relative py-12 md:py-20 bg-gradient-to-b from-transparent via-brand-base-100/30 to-transparent overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary mb-4">
            How it works
          </h2>
          <p className="text-brand-primary/70 text-base md:text-lg max-w-2xl mx-auto">
            From zero to AI-powered sales in 6 simple steps
          </p>
        </div>

        {/* Flow Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Animated Path SVG - Desktop */}
          <svg
            className="hidden md:block absolute top-0 left-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 1200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ zIndex: 0 }}
          >
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0D9373" />
                <stop offset="50%" stopColor="#4A5568" />
                <stop offset="100%" stopColor="#0D9373" />
              </linearGradient>
            </defs>

            {/* Curved connecting path - 6 steps with smooth S-curve */}
            <path
              d="M 200,100 Q 500,130 650,200 Q 800,270 700,360 Q 600,450 500,480 Q 400,510 500,600 Q 600,690 700,720 Q 850,780 750,880 Q 650,980 600,1050"
              stroke="url(#pathGradient)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-1000 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                strokeDasharray: 2200,
                strokeDashoffset: isVisible ? 0 : 2200,
                transition: 'stroke-dashoffset 2s ease-in-out',
              }}
            />

            {/* Animated dots along path */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle
                key={i}
                cx="0"
                cy="0"
                r="6"
                fill="#0D9373"
                className="animate-pulse"
                style={{
                  animation: `moveAlongPath 3s ease-in-out ${i * 0.5}s infinite`,
                }}
              >
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${i * 0.5}s`}
                  path="M 200,100 Q 500,130 650,200 Q 800,270 700,360 Q 600,450 500,480 Q 400,510 500,600 Q 600,690 700,720 Q 850,780 750,880 Q 650,980 600,1050"
                />
              </circle>
            ))}
          </svg>

          {/* Steps Grid */}
          <div className="relative space-y-8 md:space-y-12" style={{ zIndex: 10 }}>
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-6 md:gap-12 ${
                  step.position === 'right' ? 'md:flex-row-reverse md:text-right' : ''
                } ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transition: `all 0.6s ease-out ${index * 0.15}s`,
                }}
              >
                {/* Step Number Badge */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-3xl md:text-4xl text-white border-3 border-border shadow-shadow ${
                        index % 3 === 0
                          ? 'bg-[#0D9373]'
                          : index % 3 === 1
                          ? 'bg-[#4A5568]'
                          : 'bg-[#0A6553]'
                      }`}
                    >
                      {step.number}
                    </div>
                    {/* Decorative ring */}
                    <div
                      className={`absolute inset-0 rounded-full border-2 border-dashed ${
                        index % 3 === 0
                          ? 'border-[#0D9373]/30'
                          : index % 3 === 1
                          ? 'border-[#4A5568]/30'
                          : 'border-[#0A6553]/30'
                      } animate-spin`}
                      style={{
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 12px)',
                        top: '-6px',
                        left: '-6px',
                        animationDuration: '8s',
                      }}
                    />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 bg-white dark:bg-black/40 backdrop-blur-md p-5 md:p-6 rounded-xl border-2 border-brand-base-300 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-brand-primary/70 text-sm md:text-base leading-relaxed">
                    {step.description}
                  </p>

                  {/* CTA Button for first step */}
                  {step.showCTA && (
                    <Link href="/auth/sign-up" className="inline-block mt-3">
                      <Button
                        size="default"
                        className="bg-main text-black font-heading px-6 py-2.5 text-sm border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                      >
                        Get Started Free →
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Path Indicator */}
        <div className="md:hidden absolute left-12 top-48 bottom-48 w-1 bg-gradient-to-b from-[#0D9373] via-[#4A5568] to-[#0D9373] opacity-30 rounded-full" />
      </div>
    </section>
  )
}
