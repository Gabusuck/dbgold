'use client'

import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  variant?: 'fade-up' | 'zoom-in' | 'slide-right' | 'slide-left'
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  variant = 'fade-up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const getHiddenStyle = (): CSSProperties => {
    switch (variant) {
      case 'zoom-in':
        return { opacity: 0, transform: 'scale(0.95)', filter: 'blur(6px)' }
      case 'slide-right':
        return { opacity: 0, transform: 'translateX(-32px)', filter: 'blur(6px)' }
      case 'slide-left':
        return { opacity: 0, transform: 'translateX(32px)', filter: 'blur(6px)' }
      case 'fade-up':
      default:
        return { opacity: 0, transform: 'translateY(32px)', filter: 'blur(6px)' }
    }
  }

  const visibleStyle: CSSProperties = {
    opacity: 1,
    transform: 'translateX(0) translateY(0) scale(1)',
    filter: 'blur(0)',
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1), filter 0.9s cubic-bezier(0.16,1,0.3,1)`,
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
        ...(isVisible ? visibleStyle : getHiddenStyle()),
      }}
    >
      {children}
    </div>
  )
}
