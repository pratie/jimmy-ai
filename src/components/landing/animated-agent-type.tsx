'use client'

import { useEffect, useState } from 'react'

const agentTypes = ['Sales', 'Support']

export default function AnimatedAgentType() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false)

            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % agentTypes.length)
                setIsVisible(true)
            }, 300) // Half of transition duration
        }, 3000) // Change every 3 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <span
            className={`inline-block whitespace-nowrap transition-all duration-500 text-blue-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}
        >
            {agentTypes[currentIndex]}
        </span>
    )
}
