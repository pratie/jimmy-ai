'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export default function AuthThemeEnforcer() {
    const { setTheme } = useTheme()

    useEffect(() => {
        setTheme('light')
    }, [setTheme])

    return null
}
