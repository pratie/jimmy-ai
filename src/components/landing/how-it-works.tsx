'use client'

import React, { useRef, useEffect, useState } from 'react'
import { User, Brain, Palette, Code, Zap, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
    {
        icon: User,
        title: 'Sign up for free',
        description: 'Create your account in 30 seconds. No credit card required.',
        color: 'bg-blue-500',
        gradient: 'from-blue-500 to-blue-600',
    },
    {
        icon: Brain,
        title: 'Train your AI',
        description: 'Upload your website URL, PDFs, or docs. We auto-chunk and index everything.',
        color: 'bg-indigo-500',
        gradient: 'from-indigo-500 to-indigo-600',
    },
    {
        icon: Palette,
        title: 'Customize look & feel',
        description: 'Match your brand colors, logo, and tone of voice perfectly.',
        color: 'bg-purple-500',
        gradient: 'from-purple-500 to-purple-600',
    },
    {
        icon: Code,
        title: 'Embed in minutes',
        description: 'Copy one line of code to your site. Works with WordPress, Shopify, React, and more.',
        color: 'bg-pink-500',
        gradient: 'from-pink-500 to-pink-600',
    },
    {
        icon: Zap,
        title: 'Start converting',
        description: 'AI handles questions 24/7, qualifies leads, and books meetings automatically.',
        color: 'bg-orange-500',
        gradient: 'from-orange-500 to-orange-600',
    },
    {
        icon: BarChart3,
        title: 'Track & Scale',
        description: 'See exactly what customers ask and how much time you saved. Optimize and grow.',
        color: 'bg-green-500',
        gradient: 'from-green-500 to-green-600',
    },
]

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const beamRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current || !beamRef.current) return

            const containerTop = containerRef.current.getBoundingClientRect().top
            const windowHeight = window.innerHeight
            const scrollProgress = Math.max(0, Math.min(1, (windowHeight / 2 - containerTop) / (windowHeight / 2)))

            // Calculate active step based on scroll position relative to container
            // This is a simplified approximation; for precision we could track each card's position
            const stepProgress = Math.floor(scrollProgress * (steps.length + 1))
            setActiveStep(Math.min(steps.length - 1, Math.max(0, stepProgress)))

            // Update beam height
            // We want the beam to fill up as we scroll down past the section
            const beamHeight = Math.min(100, Math.max(0, (windowHeight * 0.6 - containerTop) / 10))
            // beamRef.current.style.height = `${beamHeight}%` 
            // Actually, let's use IntersectionObserver for cleaner card triggering
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Use IntersectionObserver for individual cards to trigger animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'))
                        setActiveStep((prev) => Math.max(prev, index))
                    }
                })
            },
            { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
        )

        const cards = document.querySelectorAll('.step-card')
        cards.forEach((card) => observer.observe(card))

        return () => observer.disconnect()
    }, [])

    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6 tracking-tight">
                        From zero to AI sales in minutes
                    </h2>
                    <p className="text-xl text-brand-primary/70 max-w-2xl mx-auto">
                        No coding required. Just bring your content, and we handle the rest.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto" ref={containerRef}>
                    {/* Central Beam (Desktop) */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-800 -translate-x-1/2 hidden md:block rounded-full overflow-hidden">
                        <div
                            className="w-full bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 transition-all duration-1000 ease-out"
                            style={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>

                    {/* Mobile Beam (Left aligned) */}
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-800 md:hidden rounded-full overflow-hidden">
                        <div
                            className="w-full bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 transition-all duration-1000 ease-out"
                            style={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>

                    <div className="space-y-12 md:space-y-24">
                        {steps.map((step, index) => {
                            const isActive = index <= activeStep
                            const isLeft = index % 2 === 0

                            return (
                                <div
                                    key={index}
                                    data-index={index}
                                    className={cn(
                                        "step-card relative flex items-center md:justify-between gap-8 md:gap-0",
                                        "transition-all duration-700 ease-out",
                                        isActive ? "opacity-100 translate-y-0" : "opacity-30 translate-y-10"
                                    )}
                                >
                                    {/* Mobile Icon Wrapper */}
                                    <div className="md:hidden absolute left-8 -translate-x-1/2 z-20 bg-white dark:bg-gray-900 p-2 rounded-full border-2 border-gray-100 dark:border-gray-800">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full transition-colors duration-500",
                                            isActive ? step.color : "bg-gray-300 dark:bg-gray-700"
                                        )} />
                                    </div>

                                    {/* Left Content (Desktop) */}
                                    <div className={cn(
                                        "hidden md:block w-[45%] text-right pr-12",
                                        !isLeft && "invisible"
                                    )}>
                                        <h3 className="text-2xl font-bold text-brand-primary mb-2">{step.title}</h3>
                                        <p className="text-brand-primary/70">{step.description}</p>
                                    </div>

                                    {/* Center Icon (Desktop) */}
                                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-20 items-center justify-center">
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 border-4 border-white dark:border-gray-900",
                                            isActive ? `bg-gradient-to-br ${step.gradient} scale-110` : "bg-gray-100 dark:bg-gray-800 scale-100"
                                        )}>
                                            <step.icon className={cn(
                                                "w-7 h-7 transition-colors duration-500",
                                                isActive ? "text-white" : "text-gray-400"
                                            )} />
                                        </div>
                                    </div>

                                    {/* Right Content (Desktop) */}
                                    <div className={cn(
                                        "hidden md:block w-[45%] pl-12",
                                        isLeft && "invisible"
                                    )}>
                                        <h3 className="text-2xl font-bold text-brand-primary mb-2">{step.title}</h3>
                                        <p className="text-brand-primary/70">{step.description}</p>
                                    </div>

                                    {/* Mobile Content Card */}
                                    <div className="md:hidden pl-16 w-full">
                                        <div className={cn(
                                            "bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 transition-all duration-500 shadow-sm",
                                            isActive ? "border-brand-primary/10 shadow-md" : "border-transparent"
                                        )}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg bg-gray-100 dark:bg-gray-800",
                                                    isActive && `bg-gradient-to-br ${step.gradient} text-white`
                                                )}>
                                                    <step.icon className="w-5 h-5" />
                                                </div>
                                                <h3 className="text-xl font-bold text-brand-primary">{step.title}</h3>
                                            </div>
                                            <p className="text-brand-primary/70 text-sm leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
