'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Hexagon, Settings, User, Activity, Cpu, Database, Zap, Menu } from 'lucide-react'
import { useClock } from '@/lib/hooks/useClock'
import { useAnimatedNumber } from '@/lib/hooks/useAnimatedNumber'

export default function Header({ onMenuClick }: { onMenuClick?: () => void } = {}) {
  const time = useClock()
  const [date, setDate] = useState('')
  const [cpuVal, setCpuVal] = useState(42)
  const [memVal, setMemVal] = useState(67)
  const [apiVal, setApiVal] = useState(1284)

  const cpu = useAnimatedNumber(cpuVal, 800)
  const mem = useAnimatedNumber(memVal, 800)
  const api = useAnimatedNumber(apiVal, 1200)

  useEffect(() => {
    const now = new Date()
    setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }))

    // Simulate fluctuating metrics
    const interval = setInterval(() => {
      setCpuVal(Math.floor(30 + Math.random() * 40))
      setMemVal(Math.floor(55 + Math.random() * 25))
      setApiVal(prev => prev + Math.floor(Math.random() * 5))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass-panel border-b border-blue-500/20 px-6 py-3 flex items-center justify-between sticky top-0 z-50 scan-line-container"
      style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative flex items-center justify-center w-10 h-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <Hexagon className="w-10 h-10 text-blue-500" strokeWidth={1} />
          </motion.div>
          <Zap className="w-4 h-4 text-blue-300 relative z-10" />
        </div>

        <div>
          <h1 className="text-sm font-bold tracking-[0.3em] text-white glow-blue">
            AGENT OPS
          </h1>
          <p className="text-[10px] tracking-[0.4em] text-blue-400/70 uppercase">
            Agent Operations System
          </p>
        </div>

        <div className="h-8 w-px bg-blue-500/20 mx-2" />

        {/* Status pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-online" />
          <span className="text-[10px] font-medium text-emerald-400 tracking-widest uppercase">Systems Nominal</span>
        </div>
      </div>

      {/* Center: System Metrics */}
      <div className="hidden lg:flex items-center gap-6">
        <MetricChip
          icon={<Cpu className="w-3 h-3" />}
          label="CPU"
          value={`${cpu}%`}
          color={cpu > 70 ? 'amber' : 'cyan'}
        />
        <MetricChip
          icon={<Database className="w-3 h-3" />}
          label="MEM"
          value={`${mem}%`}
          color={mem > 80 ? 'amber' : 'violet'}
        />
        <MetricChip
          icon={<Activity className="w-3 h-3" />}
          label="API CALLS"
          value={api.toLocaleString()}
          color="emerald"
        />
      </div>

      {/* Right: Clock + User */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-mono font-bold text-cyan-300 glow-cyan tabular-nums">
            {time}
          </div>
          <div className="text-[10px] text-slate-500 tracking-wide">
            {date}
          </div>
        </div>

        <div className="h-8 w-px bg-blue-500/20" />

        <button className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-blue-300 hidden md:block">Admin</span>
        </button>
      </div>
    </motion.header>
  )
}

function MetricChip({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'cyan' | 'violet' | 'emerald' | 'amber'
}) {
  const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    violet: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorMap[color]} transition-colors duration-500`}>
      <span className="opacity-60">{icon}</span>
      <span className="text-[10px] tracking-widest opacity-60 uppercase">{label}</span>
      <span className="text-xs font-mono font-semibold tabular-nums">{value}</span>
    </div>
  )
}
