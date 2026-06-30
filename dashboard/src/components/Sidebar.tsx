'use client'

import { motion } from 'framer-motion'
import { Hexagon, Zap, LayoutDashboard, Settings, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export type AgentId = 'claude' | 'openclaw' | 'hermes' | 'nexus' | 'phantom'

export const AGENTS: {
  id: AgentId
  name: string
  handle: string
  type: string
  status: 'ACTIVE' | 'STANDBY' | 'OFFLINE'
  color: string
  accent: string
  avatar: string
}[] = [
  {
    id: 'claude',
    name: 'Claude',
    handle: 'claude-sonnet-4-6',
    type: 'General AI',
    status: 'ACTIVE',
    color: 'violet',
    accent: '#a855f7',
    avatar: '✦',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    handle: 'research-agent',
    type: 'Research',
    status: 'ACTIVE',
    color: 'cyan',
    accent: '#06b6d4',
    avatar: '⌖',
  },
  {
    id: 'hermes',
    name: 'Hermes',
    handle: 'messaging-agent',
    type: 'Messaging',
    status: 'ACTIVE',
    color: 'pink',
    accent: '#ec4899',
    avatar: '⚡',
  },
  {
    id: 'nexus',
    name: 'Nexus',
    handle: 'orchestrator',
    type: 'Orchestrator',
    status: 'STANDBY',
    color: 'amber',
    accent: '#f59e0b',
    avatar: '◈',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    handle: 'stealth-agent',
    type: 'Stealth',
    status: 'OFFLINE',
    color: 'slate',
    accent: '#64748b',
    avatar: '◇',
  },
]

const statusDot: Record<string, string> = {
  ACTIVE: 'bg-emerald-400 status-dot-online',
  STANDBY: 'bg-amber-400 status-dot-standby',
  OFFLINE: 'bg-slate-600',
}

interface SidebarProps {
  activeAgent: AgentId | 'dashboard'
  onSelect: (id: AgentId | 'dashboard') => void
}

export default function Sidebar({ activeAgent, onSelect }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col w-64 min-h-screen glass-panel border-r border-indigo-500/10 rounded-none"
      style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-indigo-500/10">
        <div className="relative w-9 h-9 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <Hexagon className="w-9 h-9 text-violet-500/70" strokeWidth={1} />
          </motion.div>
          <Zap className="w-3.5 h-3.5 text-violet-300 relative z-10" />
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-[0.35em] text-white glow-violet">AGENTOS</div>
          <div className="text-[9px] tracking-[0.4em] text-indigo-400/50 uppercase">Mission Control</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <button
          onClick={() => onSelect('dashboard')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
            activeAgent === 'dashboard'
              ? 'bg-indigo-500/15 text-white border border-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Overview</span>
          {activeAgent === 'dashboard' && (
            <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />
          )}
        </button>

        {/* Section label */}
        <div className="px-3 pt-4 pb-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-semibold">Agents</span>
        </div>

        {/* Agent list */}
        {AGENTS.map(agent => (
          <button
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative',
              activeAgent === agent.id
                ? 'bg-white/8 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5',
              agent.status === 'OFFLINE' && 'opacity-50'
            )}
          >
            {/* Active indicator bar */}
            {activeAgent === agent.id && (
              <motion.div
                layoutId="active-bar"
                className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                style={{ background: agent.accent }}
              />
            )}

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 border"
              style={{
                background: `${agent.accent}18`,
                borderColor: `${agent.accent}35`,
                color: agent.accent,
                textShadow: `0 0 8px ${agent.accent}`,
              }}
            >
              {agent.avatar}
            </div>

            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold text-[13px] leading-tight truncate">{agent.name}</div>
              <div className="text-[10px] text-slate-600 truncate">{agent.type}</div>
            </div>

            {/* Status dot */}
            <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', statusDot[agent.status])} />
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-indigo-500/10">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </motion.aside>
  )
}
