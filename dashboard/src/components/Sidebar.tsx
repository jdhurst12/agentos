'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hexagon, Zap, LayoutDashboard, Settings, ChevronRight,
  Target, BookOpen, Network, Plus, Users, GitBranch, Brain,
  Eye, Layers, Workflow,
} from 'lucide-react'
import clsx from 'clsx'
import { BUILTIN_AGENTS, getCustomAgents, type AgentConfig } from '@/lib/agents'

export type AgentId = string
export type PageId = string

// Re-export for backward compat
export const AGENTS = BUILTIN_AGENTS
export type { AgentConfig }

const STATUS_DOT: Record<string, string> = {
  ACTIVE: 'bg-emerald-400 status-dot-online',
  STANDBY: 'bg-amber-400 status-dot-standby',
  OFFLINE: 'bg-slate-600',
}

interface SidebarProps {
  activeAgent: PageId
  onSelect: (id: PageId) => void
  onCreateAgent: () => void
}

const CORE_NAV: { id: PageId; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, color: '#6366f1' },
]

const TOOLS_NAV: { id: PageId; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'radar', label: 'Radar', icon: Eye, color: '#c4607e' },
  { id: 'fusion', label: 'Fusion', icon: Layers, color: '#d4a574' },
  { id: 'pipeline', label: 'Pipeline', icon: Workflow, color: '#5ab896' },
  { id: 'goals', label: 'Goals', icon: Target, color: '#a855f7' },
  { id: 'journal', label: 'Journal', icon: BookOpen, color: '#10b981' },
  { id: 'orgchart', label: 'Org Chart', icon: Network, color: '#06b6d4' },
  { id: 'crew', label: 'Crew Builder', icon: GitBranch, color: '#f59e0b' },
  { id: 'memory', label: 'Memory', icon: Brain, color: '#8b5cf6' },
]

export default function Sidebar({ activeAgent, onSelect, onCreateAgent }: SidebarProps) {
  const [customAgents, setCustomAgents] = useState<AgentConfig[]>([])

  useEffect(() => {
    setCustomAgents(getCustomAgents())
    const onStorage = () => setCustomAgents(getCustomAgents())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const allAgents = [...BUILTIN_AGENTS, ...customAgents]

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col w-64 min-h-screen border-r border-blue-500/10"
      style={{ background: 'rgba(5,5,18,0.97)', borderRadius: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-blue-500/10">
        <div className="relative w-9 h-9 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <Hexagon className="w-9 h-9 text-blue-500/70" strokeWidth={1} />
          </motion.div>
          <Zap className="w-3.5 h-3.5 text-blue-300 relative z-10" />
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-[0.35em] text-white glow-violet">AGENTOS</div>
          <div className="text-[9px] tracking-[0.4em] text-indigo-400/50 uppercase">Mission Control</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {/* Core */}
        {CORE_NAV.map(item => {
          const Icon = item.icon
          const active = activeAgent === item.id
          return (
            <NavButton key={item.id} active={active} color={item.color} onClick={() => onSelect(item.id)}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-[13px]">{item.label}</span>
            </NavButton>
          )
        })}

        {/* Tools section */}
        <SectionLabel>Tools</SectionLabel>
        {TOOLS_NAV.map(item => {
          const Icon = item.icon
          const active = activeAgent === item.id
          return (
            <NavButton key={item.id} active={active} color={item.color} onClick={() => onSelect(item.id)}>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all"
                style={{
                  background: active ? `${item.color}18` : 'transparent',
                  borderColor: active ? `${item.color}35` : 'rgba(255,255,255,0.06)',
                  color: active ? item.color : '#475569',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[13px]">{item.label}</span>
            </NavButton>
          )
        })}

        {/* Agents section */}
        <div className="flex items-center justify-between px-3 pt-5 pb-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-semibold">Agents</span>
          <button
            onClick={onCreateAgent}
            className="p-1 rounded-md text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            title="Add new agent"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Builtin agents */}
        {BUILTIN_AGENTS.map(agent => (
          <AgentNavItem
            key={agent.id}
            agent={agent}
            active={activeAgent === agent.id}
            onClick={() => onSelect(agent.id)}
          />
        ))}

        {/* Custom agents */}
        {customAgents.length > 0 && (
          <>
            <SectionLabel>Custom</SectionLabel>
            {customAgents.map(agent => (
              <AgentNavItem
                key={agent.id}
                agent={agent}
                active={activeAgent === agent.id}
                onClick={() => onSelect(agent.id)}
              />
            ))}
          </>
        )}

        {/* Add agent CTA if no custom agents */}
        {customAgents.length === 0 && (
          <button
            onClick={onCreateAgent}
            className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] text-slate-600 hover:text-slate-400 border border-dashed border-slate-800 hover:border-slate-700 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>Add custom agent</span>
          </button>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-blue-500/10 space-y-0.5">
        <button
          onClick={() => onSelect('fleet')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
            activeAgent === 'fleet'
              ? 'bg-white/8 text-white'
              : 'text-slate-500 hover:text-white hover:bg-white/5'
          )}
        >
          <Users className="w-4 h-4" />
          <span className="text-[13px]">Fleet Overview</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all">
          <Settings className="w-4 h-4" />
          <span className="text-[13px]">Settings</span>
        </button>
      </div>
    </motion.aside>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-1.5">
      <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-semibold">{children}</span>
    </div>
  )
}

function NavButton({ active, color, onClick, children }: {
  active: boolean; color: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group relative',
        active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
      style={{ background: active ? `${color}18` : undefined }}
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
          style={{ background: color }}
        />
      )}
      {children}
      {active && <ChevronRight className="w-3 h-3 ml-auto text-slate-600" />}
    </button>
  )
}

function AgentNavItem({ agent, active, onClick }: { agent: AgentConfig; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group relative',
        active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5',
        agent.status === 'OFFLINE' && 'opacity-50'
      )}
      style={{ background: active ? `${agent.accent}12` : undefined }}
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
          style={{ background: agent.accent }}
        />
      )}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 border"
        style={{
          background: active ? `${agent.accent}20` : `${agent.accent}10`,
          borderColor: active ? `${agent.accent}40` : `${agent.accent}20`,
          color: agent.accent,
        }}
      >
        {agent.avatar}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="font-semibold text-[12px] leading-tight truncate">{agent.name}</div>
        <div className="text-[10px] text-slate-600 truncate">{agent.type}</div>
      </div>
      <AnimatePresence>
        {agent.status === 'ACTIVE' && (
          <motion.span
            key="dot"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-online flex-shrink-0"
          />
        )}
        {agent.status === 'STANDBY' && (
          <motion.span key="standby" className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
        )}
      </AnimatePresence>
    </button>
  )
}
