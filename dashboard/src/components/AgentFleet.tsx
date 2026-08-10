'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Plus, ExternalLink } from 'lucide-react'
import { getAllAgents, AgentConfig } from '@/lib/agents'

const STATUS_COLORS = { ACTIVE: '#10b981', STANDBY: '#f59e0b', OFFLINE: '#475569' }
const STATUS_BG = { ACTIVE: 'rgba(16,185,129,0.1)', STANDBY: 'rgba(245,158,11,0.1)', OFFLINE: 'rgba(71,85,105,0.1)' }

interface Props {
  onSelectAgent?: (id: string) => void
  expanded?: boolean
}

function AgentTile({ agent, onSelect }: { agent: AgentConfig; onSelect?: () => void }) {
  const statusColor = STATUS_COLORS[agent.status]
  const statusBg = STATUS_BG[agent.status]
  const activeCount = Math.floor(Math.random() * 8)
  const completedCount = Math.floor(Math.random() * 50) + 5

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border p-4 cursor-pointer group relative overflow-hidden"
      style={{
        background: `${agent.accent}08`,
        borderColor: `${agent.accent}25`,
      }}
      onClick={onSelect}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30 pointer-events-none transition-opacity group-hover:opacity-50"
        style={{ background: agent.accent }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border flex-shrink-0"
          style={{
            background: `${agent.accent}18`,
            borderColor: `${agent.accent}35`,
            color: agent.accent,
            textShadow: `0 0 10px ${agent.accent}`,
          }}
        >
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-sm truncate">{agent.name}</h3>
            {agent.isBuiltin && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${agent.accent}20`, color: agent.accent }}>
                CORE
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500">{agent.type}</div>
        </div>
        <div
          className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider border flex-shrink-0"
          style={{ background: statusBg, color: statusColor, borderColor: `${statusColor}30` }}
        >
          {agent.status}
        </div>
      </div>

      {/* Description */}
      {agent.description && (
        <p className="text-slate-500 text-[11px] leading-relaxed mb-3 line-clamp-2">{agent.description}</p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-[10px]">
        <div>
          <div className="text-slate-600">Active</div>
          <div className="text-slate-300 font-semibold font-mono">{agent.status === 'OFFLINE' ? '—' : activeCount}</div>
        </div>
        <div>
          <div className="text-slate-600">Done</div>
          <div className="text-slate-300 font-semibold font-mono">{completedCount}</div>
        </div>
        {agent.endpoint && (
          <div className="ml-auto">
            <div className="flex items-center gap-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[9px]">live</span>
            </div>
          </div>
        )}
      </div>

      {/* Tools */}
      {agent.tools && agent.tools.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {agent.tools.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.05)', color: '#475569' }}>
              {t}
            </span>
          ))}
          {agent.tools.length > 3 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono text-slate-600">
              +{agent.tools.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Open button */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
      </div>
    </motion.div>
  )
}

export default function AgentFleet({ onSelectAgent, expanded }: Props) {
  const [agents, setAgents] = useState<AgentConfig[]>([])

  useEffect(() => {
    setAgents(getAllAgents())
    const onStorage = () => setAgents(getAllAgents())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const active = agents.filter(a => a.status === 'ACTIVE').length
  const standby = agents.filter(a => a.status === 'STANDBY').length

  if (expanded) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map(agent => (
          <AgentTile key={agent.id} agent={agent} onSelect={() => onSelectAgent?.(agent.id)} />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-panel p-4 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-white tracking-wider uppercase">Agent Fleet</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500">{active} active · {standby} standby</span>
          <button
            onClick={() => onSelectAgent?.('fleet')}
            className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {agents.slice(0, 4).map((agent) => (
          <AgentTile key={agent.id} agent={agent} onSelect={() => onSelectAgent?.(agent.id)} />
        ))}
      </div>
    </motion.div>
  )
}
