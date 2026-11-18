'use client'

import { useEffect, useRef, useState } from 'react'

/** Interpola suavemente de um valor para o seguinte (ease-out), para os números "contarem". */
export function useAnimatedNumber(value: number, duration = 650) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return

    const reduce =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      fromRef.current = to
      setDisplay(to)
      return
    }

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = from + (to - from) * eased
      fromRef.current = current
      setDisplay(current)
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  return display
}

export function AnimatedNumber({
  value,
  format,
  className,
  duration,
}: {
  value: number
  format: (n: number) => string
  className?: string
  duration?: number
}) {
  const n = useAnimatedNumber(value, duration)
  return <span className={className}>{format(n)}</span>
}
