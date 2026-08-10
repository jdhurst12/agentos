'use client'

import { motion } from 'framer-motion'
import { Play, Square, Settings2, Search, MessageSquare, Network, Eye } from 'lucide-react'
import clsx from 'clsx'

export type AgentStatus = 'ACTIVE' | 'STANDBY' | 'OFFLINE' | 'ERROR'
export type AgentColor = 'cyan' | 'violet' | 'amber' | 'red' | 'emerald' | 'pink'

export interface AgentCardProps {
  name: string
  type: string
  status: AgentStatus
  color: AgentColor
  icon: 'search' | 'message' | 'network' | 'eye'
  taskCount: number
  completedTasks: number
  lastActive: string
  description: string
}

const iconMap = {
  search: Search,
  message: MessageSquare,
  network: Network,
  eye: Eye,
}

const colorConfig: Record<AgentColor, {
  text: string
  border: string
  bg: string
  glow: string
  ring: string
  badge: string
  dot: string
}> = {
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-500/30 hover:border-cyan-400/60',
    bg: 'bg-cyan-500/10',
    glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    ring: '#06b6d4',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
    dot: 'bg-cyan-400 status-dot-active',
  },
  violet: {
    text: 'text-violet-400',
    border: 'border-violet-500/30 hover:border-violet-400/60',
    bg: 'bg-violet-500/10',
    glow: 'hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]',
    ring: '#a855f7',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    dot: 'bg-violet-400 status-dot-active',
  },
  pink: {
    text: 'text-pink-400',
    border: 'border-pink-500/30 hover:border-pink-400/60',
    bg: 'bg-pink-500/10',
    glow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    ring: '#ec4899',
    badge: 'bg-pink-500/15 text-pink-300 border-pink-500/25',
    dot: 'bg-pink-400 status-dot-active',
  },
  amber: {
    text: 'text-amber-400',
    border: 'border-amber-500/30 hover:border-amber-400/60',
    bg: 'bg-amber-500/10',
    glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    ring: '#f59e0b',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    dot: 'bg-amber-400 status-dot-standby',
  },
  red: {
    text: 'text-red-400',
    border: 'border-red-500/20 hover:border-red-400/40',
    bg: 'bg-red-500/10',
    glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    ring: '#ef4444',
    badge: 'bg-red-500/15 text-red-300 border-red-500/25',
    dot: 'bg-red-500',
  },
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    bg: 'bg-emerald-500/10',
    glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    ring: '#10b981',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-400 status-dot-online',
  },
}

const statusLabel: Record<AgentStatus, string> = {
  ACTIVE: 'Active',
  STANDBY: 'Standby',
  OFFLINE: 'Offline',
  ERROR: 'Error',
}

function ProgressRing({
  progress,
  color,
  size = 56,
}: {
  progress: number
  color: string
  size?: number
}) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={4}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="progress-ring-circle"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      {/* Center text */}
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="11"
        fontWeight="600"
        fontFamily="monospace"
      >
        {progress}%
      </text>
    </svg>
  )
}

export default function AgentCard({
  name,
  type,
  status,
  color,
  icon,
  taskCount,
  completedTasks,
  lastActive,
  description,
}: AgentCardProps) {
  const cfg = colorConfig[color]
  const Icon = iconMap[icon]
  const progress = taskCount > 0 ? Math.round((completedTasks / (taskCount + completedTasks)) * 100) : 0
  const isActive = status === 'ACTIVE'
  const isOffline = status === 'OFFLINE'

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={clsx(
        'glass-panel border transition-all duration-300 p-4 cursor-default',
        cfg.border,
        cfg.glow,
        isOffline && 'opacity-60'
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={clsx('p-2 rounded-xl border', cfg.bg, `border-${color}-500/20`)}>
            <Icon className={clsx('w-4 h-4', cfg.text)} />
          </div>
          <div>
            <div className="font-semibold text-white text-sm leading-tight">{name}</div>
            <div className={clsx('text-[10px] font-medium tracking-wider uppercase border rounded-full px-2 py-0.5 mt-0.5 inline-block', cfg.badge)}>
              {type}
            </div>
          </div>
        </div>

        <ProgressRing progress={progress} color={cfg.ring} />
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3">
        <div>
          <div className="text-[10px] text-slate-600 uppercase tracking-wide">Active Tasks</div>
          <div className={clsx('text-sm font-bold tabular-nums', cfg.text)}>{taskCount}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-600 uppercase tracking-wide">Completed</div>
          <div className="text-sm font-bold text-slate-300 tabular-nums">{completedTasks}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px] text-slate-600 uppercase tracking-wide">Last Active</div>
          <div className="text-[11px] text-slate-400 font-mono">{lastActive}</div>
        </div>
      </div>

      {/* Status + Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
          <span className={clsx('text-[11px] font-medium', cfg.text)}>{statusLabel[status]}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            className={clsx(
              'p-1.5 rounded-lg transition-colors text-xs',
              isActive
                ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
            )}
            title={isActive ? 'Stop' : 'Start'}
          >
            {isActive ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
            title="Configure"
          >
            <Settings2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
