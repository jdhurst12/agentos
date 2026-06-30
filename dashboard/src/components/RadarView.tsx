'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Eye, Radio, Wifi, WifiOff } from 'lucide-react'

const RadarOrb = dynamic(() => import('./RadarOrb'), { ssr: false })

interface VitalState { ok: boolean; latencyMs?: number }

export default function RadarView() {
  const [sweeping, setSweeping] = useState(false)
  const [vitals, setVitals] = useState<{ claude?: VitalState; openclaw?: VitalState; hermes?: VitalState } | null>(null)

  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch('/api/vitals')
        const j = await r.json()
        setVitals(j)
        const anyOffline = !j.claude?.ok || !j.openclaw?.ok || !j.hermes?.ok
        setSweeping(anyOffline)
      } catch {}
    }
    poll()
    const t = setInterval(poll, 15000)
    return () => clearInterval(t)
  }, [])

  const services = [
    { id: 'claude', label: 'Claude CLI', ok: vitals?.claude?.ok, ms: vitals?.claude?.latencyMs, accent: '#c97c5e' },
    { id: 'openclaw', label: 'OpenClaw', ok: vitals?.openclaw?.ok, ms: vitals?.openclaw?.latencyMs, accent: '#c4607e' },
    { id: 'hermes', label: 'Hermes', ok: vitals?.hermes?.ok, ms: vitals?.hermes?.latencyMs, accent: '#e6c69a' },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0 relative">
      {/* Header */}
      <div className="mb-6 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Eye size={15} style={{ color: '#c4607e' }} />
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold" style={{ color: '#c4607e' }}>
            The Oracle
          </span>
        </div>
        <h2 className="text-xl font-semibold" style={{ color: '#f3ebda', letterSpacing: '-0.02em' }}>
          Radar — System Eye
        </h2>
        <p className="text-[12px] mt-1" style={{ color: '#6e6353' }}>
          {sweeping ? 'Anomaly detected — scanning' : 'All systems nominal'}
        </p>
      </div>

      {/* Orb */}
      <div
        className="relative z-10 mb-8"
        style={{ width: 340, height: 340 }}
      >
        <RadarOrb image="/oracle-face.png" sweeping={sweeping} />
        {/* Pulsing ring behind the orb */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `1px solid ${sweeping ? 'rgba(196,96,126,0.3)' : 'rgba(90,184,150,0.15)'}`,
            animation: 'hbeat 2.4s ease-in-out infinite',
            transform: 'scale(1.06)',
          }}
        />
      </div>

      {/* Service vitals */}
      <div className="flex gap-4 z-10">
        {services.map(s => (
          <div
            key={s.id}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border"
            style={{
              background: 'rgba(37,29,44,0.8)',
              borderColor: s.ok === undefined ? 'rgba(243,235,218,0.06)' : s.ok ? `${s.accent}30` : 'rgba(196,96,126,0.3)',
            }}
          >
            {s.ok === undefined ? (
              <span className="w-2 h-2 rounded-full bg-[var(--cream-mute)]" />
            ) : s.ok ? (
              <Wifi size={12} style={{ color: s.accent }} />
            ) : (
              <WifiOff size={12} style={{ color: '#c4607e' }} />
            )}
            <span className="text-[12px] font-medium" style={{ color: s.ok ? '#ddd0bb' : '#a59783' }}>{s.label}</span>
            {s.ms !== undefined && (
              <span className="text-[10px] font-mono" style={{ color: '#6e6353' }}>{s.ms}ms</span>
            )}
          </div>
        ))}
      </div>

      {/* Sweep control */}
      <button
        onClick={() => setSweeping(s => !s)}
        className="mt-5 z-10 text-[11px] uppercase tracking-widest px-4 py-2 rounded-full border transition"
        style={{
          borderColor: sweeping ? 'rgba(196,96,126,0.4)' : 'rgba(243,235,218,0.08)',
          color: sweeping ? '#c4607e' : '#6e6353',
          background: sweeping ? 'rgba(196,96,126,0.06)' : 'transparent',
        }}
      >
        <Radio size={11} className="inline mr-2" />
        {sweeping ? 'Stop sweep' : 'Force sweep'}
      </button>
    </div>
  )
}
