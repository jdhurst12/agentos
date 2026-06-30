'use client'

import { useState, useEffect } from 'react'

export function useClock(): string {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const format = () => {
      const now = new Date()
      return now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    }

    setTime(format())
    const interval = setInterval(() => setTime(format()), 1000)
    return () => clearInterval(interval)
  }, [])

  return time
}
