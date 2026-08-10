'use client'

import { useEffect, useState } from 'react'

type Mood = 'idle' | 'running' | 'waving' | 'waiting' | 'failed'

interface HermesPetProps {
  mood?: Mood
  size?: number
  className?: string
}

const MOOD_CYCLE: Mood[] = ['waving', 'idle', 'idle', 'waiting', 'idle', 'running']

export default function HermesPet({ mood: forceMood, size = 48, className = '' }: HermesPetProps) {
  const [mood, setMood] = useState<Mood>(forceMood ?? 'idle')
  const [frame, setFrame] = useState(0)

  // Auto-cycle moods if not forced
  useEffect(() => {
    if (forceMood) { setMood(forceMood); return }
    let idx = 0
    const t = setInterval(() => {
      idx = (idx + 1) % MOOD_CYCLE.length
      setMood(MOOD_CYCLE[idx])
    }, 4000)
    return () => clearInterval(t)
  }, [forceMood])

  // Blink frame for idle (simulate sprite animation)
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 400)
    return () => clearInterval(t)
  }, [])

  const src = `/pets/boba/${mood}.png`

  return (
    <div
      className={`relative inline-flex items-end justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={`Hermes (${mood})`}
    >
      {/* Glow under pet */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-sm"
        style={{
          width: size * 0.7,
          height: size * 0.15,
          background: 'rgba(212,165,116,0.25)',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Hermes ${mood}`}
        width={size}
        height={size}
        style={{
          imageRendering: 'pixelated',
          filter: mood === 'failed' ? 'hue-rotate(280deg) saturate(0.6)' : undefined,
          transform: mood === 'running' ? `translateX(${frame % 2 === 0 ? -1 : 1}px)` : undefined,
          transition: 'transform 0.1s',
        }}
        draggable={false}
      />
      {/* Mood label */}
      {mood !== 'idle' && (
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: 'rgba(37,29,44,0.9)', color: '#d4a574', border: '1px solid rgba(212,165,116,0.2)' }}
        >
          {mood}
        </div>
      )}
    </div>
  )
}
