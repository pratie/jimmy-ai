'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export default function DashboardThemeEnforcer() {
    const { setTheme } = useTheme()

    useEffect(() => {
        setTheme('light')
    }, [setTheme])

    return null
}
