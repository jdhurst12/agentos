'use client'

import { useState, useEffect, useRef } from 'react'

export function useAnimatedNumber(target: number, duration: number = 500): number {
  const [current, setCurrent] = useState(0)
  const startRef = useRef<number | null>(null)
  const startValueRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    startValueRef.current = current
    startRef.current = null

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    const animate = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp
      }

      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.round(startValueRef.current + (target - startValueRef.current) * eased)

      setCurrent(value)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return current
}
