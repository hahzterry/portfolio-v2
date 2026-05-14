'use client'

import { useEffect, useRef } from 'react'
import type { JSX } from 'react'

interface RevealProps {
  children: React.ReactNode
  delay?: 1 | 2 | 3 | 4 | 5
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export default function Reveal({ children, delay, className = '', as = 'div' }: RevealProps) {
  // Pragmatic cast — the polymorphic `as` prop is correct at runtime but
  // would require generics + complex ref forwarding to satisfy strict TS.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = as as any
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            obs.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      data-delay={delay}
    >
      {children}
    </Tag>
  )
}
