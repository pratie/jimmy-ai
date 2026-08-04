'use client'

import * as React from 'react'

type RevealProps = {
  children: React.ReactNode
  /** Stagger delay in ms */
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'span'
}

/**
 * Lightweight scroll-reveal: fades + lifts content in once when it enters
 * the viewport. Pure CSS transitions (off main thread), honors
 * prefers-reduced-motion via the .reveal utility in globals.css.
 *
 * The observer starts hidden and only reveals on intersection, which means any
 * failure to fire leaves marketing copy permanently invisible. Two safety nets
 * guard that: an immediate reveal for elements already on screen at mount, and
 * a bounded fallback timer that reveals unconditionally. Both are far cheaper
 * than the failure they prevent.
 */
const FALLBACK_REVEAL_MS = 2500

export function Reveal({ children, delay = 0, className = '', as = 'div' }: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    // Already on screen at mount (above the fold, or a deep link / restored
    // scroll position): reveal without waiting for a scroll event.
    const box = node.getBoundingClientRect()
    if (box.top < window.innerHeight && box.bottom > 0) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
    )
    observer.observe(node)

    // Last resort: never leave content hidden because the observer went quiet.
    const fallback = setTimeout(() => {
      if (node.getBoundingClientRect().top < window.innerHeight) setVisible(true)
    }, FALLBACK_REVEAL_MS)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  const Tag = as as React.ElementType

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
