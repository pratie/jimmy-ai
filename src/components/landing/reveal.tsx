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
 */
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
    return () => observer.disconnect()
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
