'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Zap, Clock, Shield } from 'lucide-react'
import { useAnimatedNumber } from '@/lib/hooks/useAnimatedNumber'

const SPARKLINE_POINTS = [40, 55, 48, 62, 58, 71, 65, 79, 73, 85]

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 60
  const h = 24

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
      <circle
        cx={(data.length - 1) / (data.length - 1) * w}
        cy={h - ((data[data.length - 1] - min) / range) * h}
        r="2.5"
        fill={color}
        opacity={0.9}
      />
    </svg>
  )
}

export default function MetricsBar() {
  const [apiCalls, setApiCalls] = useState(14832)
  const [sparkData, setSparkData] = useState(SPARKLINE_POINTS)
  const animatedApi = useAnimatedNumber(apiCalls, 1000)

  useEffect(() => {
    const interval = setInterval(() => {
      setApiCalls(prev => prev + Math.floor(Math.random() * 12 + 1))
      setSparkData(prev => {
        const next = [...prev.slice(1), Math.floor(40 + Math.random() * 50)]
        return next
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const metrics = [
    {
      icon: <Bot className="w-5 h-5" />,
      label: 'Active Agents',
      value: '2 / 4',
      sub: '50% utilization',
      color: 'violet',
      accent: '#a855f7',
      sparkData: [1, 2, 2, 1, 2, 2, 2, 2, 2, 2],
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'API Calls Today',
      value: animatedApi.toLocaleString(),
      sub: '+12 last minute',
      color: 'cyan',
      accent: '#06b6d4',
      sparkData,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Avg Response',
      value: '1.2s',
      sub: 'p95: 3.4s',
      color: 'emerald',
      accent: '#10b981',
      sparkData: [80, 75, 82, 78, 79, 77, 80, 81, 79, 80],
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Uptime',
      value: '99.97%',
      sub: '43d 7h continuous',
      color: 'emerald',
      accent: '#34d399',
      sparkData: [99, 100, 100, 99, 100, 100, 100, 99, 100, 100],
    },
  ]

  const colorMap: Record<string, string> = {
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
          className="glass-panel glass-panel-hover p-4 flex items-start justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className={`inline-flex p-1.5 rounded-lg border mb-2 ${colorMap[metric.color]}`}>
              {metric.icon}
            </div>
            <div className="text-lg font-bold text-white tabular-nums leading-none mb-1">
              {metric.value}
            </div>
            <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
              {metric.label}
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              {metric.sub}
            </div>
          </div>
          <div className="flex-shrink-0 mt-1">
            <Sparkline data={metric.sparkData} color={metric.accent} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
