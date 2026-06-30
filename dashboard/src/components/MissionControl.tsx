'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Radio, Zap, Clock, Maximize2, X, Terminal, Plus, Search,
  Activity, Command, CheckCircle2, AlertCircle, ChevronRight,
  Brain, Network, GitBranch, Target, BookOpen, Layers, Wifi, WifiOff,
  Cpu, Box, Sparkles,
} from 'lucide-react'
import { getAllAgents, getCustomAgents, type AgentConfig } from '@/lib/agents'
import clsx from 'clsx'

// ── Types ──────────────────────────────────────────────────────────────────

interface AgentMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  ts: Date
  streaming?: boolean
}

interface AgentPanelState {
  messages: AgentMessage[]
  input: string
  streaming: boolean
  online: boolean | null
}

interface ActivityEvent {
  id: string
  agentId: string
  agentName: string
  accent: string
  avatar: string
  type: 'sent' | 'received' | 'online' | 'offline' | 'broadcast'
  content: string
  ts: Date
}

// ── SSE streaming ──────────────────────────────────────────────────────────

async function streamToAgent(
  agentId: string,
  endpoint: string,
  message: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
) {
  try {
    const res = await fetch(`/api/agent/${agentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, endpoint }),
    })
    if (!res.ok || !res.body) { onDone(); return }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const parts = buf.split('\n\n')
      buf = parts.pop() ?? ''
      for (const part of parts) {
        if (!part.startsWith('data:')) continue
        const raw = part.slice(5).trim()
        if (raw === '[DONE]') { onDone(); return }
        try { const { text } = JSON.parse(raw); if (text) onChunk(text) } catch { /* */ }
      }
    }
    onDone()
  } catch { onDone() }
}

// ── Status dot ─────────────────────────────────────────────────────────────

function StatusDot({ status, online }: { status: AgentConfig['status']; online: boolean | null }) {
  if (status === 'OFFLINE') return <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
  if (online === null) return <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse flex-shrink-0" />
  if (!online && status === 'ACTIVE') return <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
  if (status === 'ACTIVE') return (
    <span className="relative flex-shrink-0 w-2 h-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
    </span>
  )
  return <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
}

// ── Waveform ───────────────────────────────────────────────────────────────

function Waveform({ active, accent }: { active: boolean; accent: string }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[3, 5, 4, 7, 3, 6, 4].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: accent }}
          animate={active ? { height: [h, h * 2.4, h] } : { height: 2 }}
          transition={{ duration: 0.42, repeat: active ? Infinity : 0, delay: i * 0.07, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ── Top OS Bar ─────────────────────────────────────────────────────────────

function TopBar({
  agents,
  onPalette,
}: {
  agents: AgentConfig[]
  onPalette: () => void
}) {
  const [clock, setClock] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const active  = agents.filter(a => a.status === 'ACTIVE').length
  const standby = agents.filter(a => a.status === 'STANDBY').length
  const offline = agents.filter(a => a.status === 'OFFLINE').length

  return (
    <div
      className="flex items-center gap-4 px-5 py-3 border-b flex-shrink-0 relative overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, rgba(124,58,237,0.14) 0%, rgba(8,8,20,0.96) 40%, rgba(8,8,20,0.96) 70%, rgba(6,182,212,0.09) 100%)',
        borderColor: 'rgba(99,102,241,0.18)',
      }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.7) 35%, rgba(6,182,212,0.5) 65%, transparent 100%)' }}
      />

      {/* Brand */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="relative w-6 h-6 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border border-violet-500/50 rounded-lg"
            style={{ borderRadius: 6 }}
          />
          <Terminal className="w-3 h-3 text-violet-400 relative z-10" />
        </div>
        <div>
          <div className="text-[11px] font-black tracking-[0.3em] text-white glow-violet">AGENTOS</div>
          <div className="text-[8px] tracking-[0.35em] text-slate-600 uppercase">Mission Control</div>
        </div>
      </div>

      <div className="h-4 w-px bg-white/8 flex-shrink-0" />

      {/* Status chips */}
      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-online flex-shrink-0" />
          <span className="text-emerald-400 font-bold tabular-nums">{active}</span>
          <span className="text-slate-600">active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-amber-400 font-bold tabular-nums">{standby}</span>
          <span className="text-slate-600">standby</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
          <span className="text-slate-500 font-bold tabular-nums">{offline}</span>
          <span className="text-slate-600">offline</span>
        </div>
      </div>

      {/* OPERATIONAL badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-online" />
        <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">Operational</span>
      </div>

      <div className="flex-1" />

      {/* Clock */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
        <Clock className="w-3 h-3" />
        <span className="font-mono tabular-nums">
          {clock.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' '}
          {clock.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>

      <div className="h-4 w-px bg-white/8 flex-shrink-0" />

      {/* ⌘K palette trigger */}
      <button
        onClick={onPalette}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] text-slate-500 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        title="Command palette (⌘K)"
      >
        <Command className="w-3 h-3" />
        <span className="font-mono">⌘K</span>
      </button>
    </div>
  )
}

// ── Command Palette ────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: 'fleet',    label: 'Fleet Overview',    icon: Layers,      color: '#06b6d4' },
  { id: 'memory',   label: 'Memory',             icon: Brain,       color: '#8b5cf6' },
  { id: 'orgchart', label: 'Org Chart',           icon: Network,     color: '#06b6d4' },
  { id: 'crew',     label: 'Crew Builder',        icon: GitBranch,   color: '#f59e0b' },
  { id: 'goals',    label: 'Goals',               icon: Target,      color: '#a855f7' },
  { id: 'journal',  label: 'Journal',             icon: BookOpen,    color: '#10b981' },
  { id: 'new-agent',label: 'Create New Agent',    icon: Plus,        color: '#10b981' },
]

function CommandPalette({
  agents,
  onClose,
  onNavigate,
  onCreateAgent,
}: {
  agents: AgentConfig[]
  onClose: () => void
  onNavigate?: (id: string) => void
  onCreateAgent?: () => void
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const agentResults = useMemo(() =>
    agents.filter(a =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.type.toLowerCase().includes(query.toLowerCase()) ||
      a.handle.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    [agents, query]
  )

  const actionResults = useMemo(() =>
    QUICK_ACTIONS.filter(a =>
      a.label.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 4),
    [query]
  )

  const total = agentResults.length + actionResults.length

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, total - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter') {
        if (selected < agentResults.length) {
          onNavigate?.(agentResults[selected].id)
        } else {
          const action = actionResults[selected - agentResults.length]
          if (action?.id === 'new-agent') onCreateAgent?.()
          else if (action) onNavigate?.(action.id)
        }
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [agentResults, actionResults, selected, total, onClose, onNavigate, onCreateAgent])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] px-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -16 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{
          background: 'rgba(7,7,22,0.98)',
          borderColor: 'rgba(124,58,237,0.45)',
          boxShadow: '0 0 0 1px rgba(124,58,237,0.15), 0 0 80px rgba(124,58,237,0.18), 0 32px 64px rgba(0,0,0,0.7)',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Search agents, commands, pages…"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-slate-600 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {agentResults.length > 0 && (
            <div className="px-3 mb-1">
              <div className="text-[9px] text-slate-600 uppercase tracking-widest px-2 py-1.5">Agents</div>
              {agentResults.map((agent, i) => (
                <button
                  key={agent.id}
                  onClick={() => { onNavigate?.(agent.id); onClose() }}
                  onMouseEnter={() => setSelected(i)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-all',
                    selected === i ? 'bg-white/8' : 'hover:bg-white/4'
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold border flex-shrink-0"
                    style={{ background: `${agent.accent}18`, borderColor: `${agent.accent}35`, color: agent.accent, textShadow: `0 0 8px ${agent.accent}` }}
                  >
                    {agent.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold">{agent.name}</div>
                    <div className="text-slate-600 text-[11px]">{agent.type} · {agent.handle}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusDot status={agent.status} online={null} />
                    {selected === i && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {actionResults.length > 0 && (
            <div className="px-3">
              <div className="text-[9px] text-slate-600 uppercase tracking-widest px-2 py-1.5">Quick Actions</div>
              {actionResults.map((action, i) => {
                const idx = agentResults.length + i
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.id === 'new-agent') onCreateAgent?.()
                      else onNavigate?.(action.id)
                      onClose()
                    }}
                    onMouseEnter={() => setSelected(idx)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-all',
                      selected === idx ? 'bg-white/8' : 'hover:bg-white/4'
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{ background: `${action.color}14`, borderColor: `${action.color}28`, color: action.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-slate-300 text-sm flex-1">{action.label}</span>
                    {selected === idx && <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}

          {total === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-700">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-sm">No results for &ldquo;{query}&rdquo;</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4 text-[10px] text-slate-700">
          <span className="flex items-center gap-1.5"><kbd className="px-1 py-0.5 rounded bg-white/6 font-mono text-[9px]">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1 py-0.5 rounded bg-white/6 font-mono text-[9px]">↵</kbd> open</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1 py-0.5 rounded bg-white/6 font-mono text-[9px]">esc</kbd> close</span>
          <span className="ml-auto">{total} result{total !== 1 ? 's' : ''}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Activity Feed ──────────────────────────────────────────────────────────

const EVENT_LABELS: Record<ActivityEvent['type'], string> = {
  sent: 'sent',
  received: 'replied',
  online: 'online',
  offline: 'offline',
  broadcast: 'broadcast',
}

const EVENT_COLORS: Record<ActivityEvent['type'], string> = {
  sent: '#6366f1',
  received: '',  // uses agent accent
  online: '#10b981',
  offline: '#64748b',
  broadcast: '#a855f7',
}

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return (
    <div
      className="w-[220px] flex-shrink-0 flex flex-col rounded-2xl border overflow-hidden"
      style={{
        background: 'rgba(7,7,20,0.88)',
        borderColor: 'rgba(99,102,241,0.14)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
        <Activity className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Activity</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-online" />
          <span className="text-[9px] font-mono text-slate-600 tabular-nums">{events.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 min-h-0">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-700">
              <Activity className="w-5 h-5 opacity-25" />
              <span className="text-[11px]">Awaiting activity…</span>
            </div>
          ) : (
            events.map(ev => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/3 transition-colors"
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 border"
                  style={{
                    background: `${ev.accent}18`,
                    borderColor: `${ev.accent}28`,
                    color: ev.accent,
                  }}
                >
                  {ev.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-semibold" style={{ color: ev.accent }}>{ev.agentName}</span>
                    <span
                      className="text-[8px] px-1 py-0.5 rounded font-mono uppercase leading-none"
                      style={{
                        background: `${ev.type === 'received' ? ev.accent : (EVENT_COLORS[ev.type] || '#6366f1')}18`,
                        color: ev.type === 'received' ? ev.accent : (EVENT_COLORS[ev.type] || '#6366f1'),
                      }}
                    >
                      {EVENT_LABELS[ev.type]}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 mt-0.5">{ev.content}</p>
                  <span className="text-[9px] text-slate-700 font-mono">{fmt(ev.ts)}</span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

// ── Add Agent Card ─────────────────────────────────────────────────────────

function AgentAddCard({ onAdd }: { onAdd?: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onAdd}
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed gap-3 group transition-all"
      style={{
        borderColor: 'rgba(99,102,241,0.22)',
        background: 'rgba(99,102,241,0.03)',
        minHeight: 180,
      }}
      whileHover={{
        borderColor: 'rgba(139,92,246,0.55)',
        backgroundColor: 'rgba(139,92,246,0.07)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all"
        style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.25)' }}
        whileHover={{ background: 'rgba(139,92,246,0.2)', borderColor: 'rgba(139,92,246,0.5)' }}
      >
        <Plus className="w-6 h-6 text-violet-400 group-hover:text-violet-300 transition-colors" />
      </motion.div>
      <div className="text-center space-y-0.5">
        <div className="text-xs font-bold text-slate-500 group-hover:text-violet-300 transition-colors tracking-wide">
          Add Agent
        </div>
        <div className="text-[10px] text-slate-700">Connect a new AI agent</div>
      </div>
    </motion.button>
  )
}

// ── Agent Section Panel ────────────────────────────────────────────────────

function AgentSection({
  agent,
  state,
  onSend,
  onInputChange,
  onExpand,
}: {
  agent: AgentConfig
  state: AgentPanelState
  onSend: () => void
  onInputChange: (v: string) => void
  onExpand: () => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isOffline = agent.status === 'OFFLINE'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages, state.streaming])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  return (
    <div
      className="flex flex-col rounded-2xl border overflow-hidden relative scan-line-container"
      style={{
        background: `linear-gradient(145deg, ${agent.accent}08 0%, rgba(7,7,18,0.92) 55%)`,
        borderColor: `${agent.accent}28`,
        boxShadow: `0 0 0 1px ${agent.accent}0c, inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
    >
      {/* Ambient corner glow */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: agent.accent }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: `${agent.accent}18`, background: `${agent.accent}09` }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border flex-shrink-0"
          style={{
            background: `${agent.accent}1c`,
            borderColor: `${agent.accent}38`,
            color: agent.accent,
            textShadow: `0 0 12px ${agent.accent}`,
          }}
        >
          {agent.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold text-[11px] truncate">{agent.name}</span>
            {agent.isBuiltin && (
              <span
                className="text-[7px] px-1 py-0.5 rounded font-bold tracking-widest uppercase"
                style={{ background: `${agent.accent}1a`, color: agent.accent }}
              >
                CORE
              </span>
            )}
          </div>
          <div className="text-[9px] text-slate-600 truncate">{agent.type}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Waveform active={state.streaming} accent={agent.accent} />
          {state.online !== null && (
            state.online
              ? <Wifi className="w-3 h-3 text-emerald-500/60" />
              : <WifiOff className="w-3 h-3 text-slate-700" />
          )}
          <StatusDot status={agent.status} online={state.online} />
          <span
            className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full"
            style={{
              background: agent.status === 'ACTIVE'
                ? 'rgba(16,185,129,0.12)'
                : agent.status === 'STANDBY'
                  ? 'rgba(245,158,11,0.12)'
                  : 'rgba(71,85,105,0.12)',
              color: agent.status === 'ACTIVE' ? '#10b981' : agent.status === 'STANDBY' ? '#f59e0b' : '#475569',
            }}
          >
            {agent.status}
          </span>
          <button
            onClick={onExpand}
            className="p-1 rounded text-slate-700 hover:text-white transition-colors"
            title="Open full chat"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
        <AnimatePresence initial={false}>
          {state.messages.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[90%] px-3 py-2 rounded-xl text-[11px] leading-relaxed"
                style={
                  m.role === 'user'
                    ? { background: `${agent.accent}22`, border: `1px solid ${agent.accent}32`, color: '#e2e8f0' }
                    : { background: 'rgba(12,12,30,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `2px solid ${agent.accent}55`, color: '#cbd5e1' }
                }
              >
                {m.content || (m.streaming ? <span className="opacity-35">▋</span> : '')}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {state.streaming && state.messages.at(-1)?.role !== 'agent' && (
          <div className="flex justify-start">
            <div
              className="px-3 py-2 rounded-xl"
              style={{ background: 'rgba(12,12,30,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `2px solid ${agent.accent}55` }}
            >
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ background: agent.accent }}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-2.5 py-2 border-t flex-shrink-0"
        style={{ borderColor: `${agent.accent}14`, background: `${agent.accent}06` }}
      >
        {isOffline ? (
          <div className="flex items-center justify-center gap-1 py-1 text-[10px] text-slate-600">
            <AlertCircle className="w-3 h-3" />
            Agent offline
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={state.input}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={handleKey}
              disabled={state.streaming}
              placeholder={`Command ${agent.name}…`}
              rows={1}
              className="flex-1 bg-transparent text-[11px] text-slate-300 placeholder-slate-700 resize-none focus:outline-none leading-relaxed py-0.5"
              style={{ maxHeight: 56 }}
            />
            <button
              onClick={onSend}
              disabled={!state.input.trim() || state.streaming}
              className="flex-shrink-0 p-1.5 rounded-lg transition-all disabled:opacity-25"
              style={{
                background: state.input.trim() ? `${agent.accent}28` : 'transparent',
                color: state.input.trim() ? agent.accent : '#475569',
              }}
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Expanded full-screen agent modal ───────────────────────────────────────

function ExpandedAgent({
  agent,
  state,
  onSend,
  onInputChange,
  onClose,
}: {
  agent: AgentConfig
  state: AgentPanelState
  onSend: () => void
  onInputChange: (v: string) => void
  onClose: () => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [state.messages])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full max-w-2xl h-[74vh] flex flex-col rounded-2xl border overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${agent.accent}0a 0%, rgba(7,7,22,0.98) 45%)`,
          borderColor: `${agent.accent}35`,
          boxShadow: `0 0 0 1px ${agent.accent}15, 0 0 80px ${agent.accent}18, 0 32px 64px rgba(0,0,0,0.7)`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0" style={{ borderColor: `${agent.accent}18` }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border"
            style={{ background: `${agent.accent}1c`, borderColor: `${agent.accent}38`, color: agent.accent, textShadow: `0 0 14px ${agent.accent}` }}
          >
            {agent.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold">{agent.name}</div>
            <div className="text-[11px] text-slate-500">{agent.handle} · {agent.type}</div>
          </div>
          <Waveform active={state.streaming} accent={agent.accent} />
          <StatusDot status={agent.status} online={state.online} />
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/6 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
          {state.messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  m.role === 'user'
                    ? { background: `${agent.accent}22`, border: `1px solid ${agent.accent}32`, color: '#e2e8f0' }
                    : { background: 'rgba(12,12,30,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `2px solid ${agent.accent}55`, color: '#cbd5e1' }
                }
              >
                {m.content || <span className="opacity-30">…</span>}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t flex-shrink-0" style={{ borderColor: `${agent.accent}18` }}>
          <div className="flex items-end gap-3 bg-white/4 rounded-xl px-4 py-2.5 border border-white/8">
            <textarea
              autoFocus
              value={state.input}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
              disabled={state.streaming}
              placeholder={`Message ${agent.name}…`}
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none"
              style={{ maxHeight: 100 }}
            />
            <button
              onClick={onSend}
              disabled={!state.input.trim() || state.streaming}
              className="p-2 rounded-lg transition-all disabled:opacity-30"
              style={{ background: `${agent.accent}28`, color: agent.accent }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Broadcast bar ──────────────────────────────────────────────────────────

function BroadcastBar({
  agents,
  onBroadcast,
}: {
  agents: AgentConfig[]
  onBroadcast: (msg: string, targets: string[]) => void
}) {
  const [msg, setMsg] = useState('')
  const [targets, setTargets] = useState<Set<string>>(
    () => new Set(agents.filter(a => a.status !== 'OFFLINE').map(a => a.id))
  )
  const [sent, setSent] = useState(false)

  const broadcast = () => {
    if (!msg.trim() || targets.size === 0) return
    onBroadcast(msg.trim(), Array.from(targets))
    setMsg('')
    setSent(true)
    setTimeout(() => setSent(false), 2000)
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border flex-shrink-0"
      style={{
        background: 'rgba(7,7,20,0.88)',
        borderColor: 'rgba(139,92,246,0.2)',
        boxShadow: '0 0 0 1px rgba(139,92,246,0.06)',
      }}
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <Radio className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-[10px] font-bold text-violet-400 tracking-[0.2em] uppercase">Broadcast</span>
      </div>

      {/* Target toggles */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {agents.map(a => (
          <button
            key={a.id}
            onClick={() => setTargets(prev => {
              const n = new Set(prev)
              n.has(a.id) ? n.delete(a.id) : n.add(a.id)
              return n
            })}
            disabled={a.status === 'OFFLINE'}
            title={a.name}
            className="text-[10px] w-6 h-6 rounded-lg border transition-all disabled:opacity-30 flex items-center justify-center"
            style={{
              background: targets.has(a.id) ? `${a.accent}22` : 'transparent',
              borderColor: targets.has(a.id) ? `${a.accent}55` : 'rgba(255,255,255,0.08)',
              color: targets.has(a.id) ? a.accent : '#475569',
            }}
          >
            {a.avatar}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex-1 flex items-center gap-2 bg-white/4 rounded-xl px-3 py-1.5 border border-white/8">
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') broadcast() }}
          placeholder={`Broadcast to ${targets.size} agent${targets.size !== 1 ? 's' : ''}…`}
          className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
        />
        <button
          onClick={broadcast}
          disabled={!msg.trim() || targets.size === 0}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all disabled:opacity-30"
          style={{
            background: sent ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.22)',
            color: sent ? '#10b981' : '#a855f7',
          }}
        >
          {sent ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
          {sent ? 'Sent!' : 'Fire'}
        </button>
      </div>
    </div>
  )
}

// ── Main MissionControl ────────────────────────────────────────────────────

export default function MissionControl({
  onOpenAgent,
  onCreateAgent,
}: {
  onOpenAgent?: (id: string) => void
  onCreateAgent?: () => void
}) {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [showPalette, setShowPalette] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([])
  const [vitals, setVitals] = useState<{ claude: { ok: boolean; version: string }; openclaw: { ok: boolean; agents: string[]; sessions: number }; hermes: { ok: boolean; model: string } } | null>(null)

  useEffect(() => {
    const fetchVitals = () => fetch('/api/vitals', { cache: 'no-store' }).then(r => r.json()).then(setVitals).catch(() => {})
    fetchVitals()
    const t = setInterval(fetchVitals, 10000)
    return () => clearInterval(t)
  }, [])

  // Load agents (builtin + custom) on client
  useEffect(() => {
    setAgents(getAllAgents())
    const onStorage = () => setAgents(getAllAgents())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const [panelStates, setPanelStates] = useState<Record<string, AgentPanelState>>({})

  // Initialize panel states as agents load
  useEffect(() => {
    setPanelStates(prev => {
      const next = { ...prev }
      for (const a of agents) {
        if (!next[a.id]) {
          next[a.id] = {
            messages: [{ id: `init-${a.id}`, role: 'agent', content: `${a.name} standing by.`, ts: new Date() }],
            input: '',
            streaming: false,
            online: null,
          }
        }
      }
      return next
    })
  }, [agents])

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowPalette(p => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Ping all agents on mount
  useEffect(() => {
    if (agents.length === 0) return
    agents.forEach(agent => {
      fetch(`/api/agent/${agent.id}`)
        .then(r => r.json())
        .then(d => {
          const isOnline = d.online ?? false
          setPanelStates(prev => ({
            ...prev,
            [agent.id]: { ...(prev[agent.id] ?? { messages: [], input: '', streaming: false, online: null }), online: isOnline },
          }))
          pushEvent({
            agentId: agent.id, agentName: agent.name, accent: agent.accent, avatar: agent.avatar,
            type: isOnline ? 'online' : 'offline',
            content: isOnline ? 'Daemon reachable' : 'Daemon unreachable',
          })
        })
        .catch(() => {
          setPanelStates(prev => ({
            ...prev,
            [agent.id]: { ...(prev[agent.id] ?? { messages: [], input: '', streaming: false, online: null }), online: false },
          }))
        })
    })
  }, [agents]) // eslint-disable-line

  const pushEvent = useCallback((ev: Omit<ActivityEvent, 'id' | 'ts'>) => {
    setActivityEvents(prev => [
      ...prev.slice(-99),
      { ...ev, id: `${Date.now()}-${Math.random()}`, ts: new Date() },
    ])
  }, [])

  const sendToAgent = useCallback((agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return

    setPanelStates(prev => {
      const state = prev[agentId]
      if (!state?.input.trim() || state.streaming) return prev

      const userMsg: AgentMessage = { id: `u-${Date.now()}`, role: 'user', content: state.input.trim(), ts: new Date() }
      const agentMsgId = `a-${Date.now()}`
      const agentMsg: AgentMessage = { id: agentMsgId, role: 'agent', content: '', ts: new Date(), streaming: true }

      pushEvent({ agentId, agentName: agent.name, accent: agent.accent, avatar: agent.avatar, type: 'sent', content: userMsg.content })

      setTimeout(() => {
        streamToAgent(
          agentId,
          agent.endpoint,
          userMsg.content,
          chunk => setPanelStates(p => ({
            ...p,
            [agentId]: { ...p[agentId], messages: p[agentId].messages.map(m => m.id === agentMsgId ? { ...m, content: m.content + chunk } : m) },
          })),
          () => setPanelStates(p => {
            const reply = p[agentId]?.messages.find(m => m.id === agentMsgId)
            if (reply?.content) {
              pushEvent({ agentId, agentName: agent.name, accent: agent.accent, avatar: agent.avatar, type: 'received', content: reply.content.slice(0, 80) })
            }
            return {
              ...p,
              [agentId]: { ...p[agentId], streaming: false, messages: p[agentId].messages.map(m => m.id === agentMsgId ? { ...m, streaming: false } : m) },
            }
          }),
        )
      }, 0)

      return {
        ...prev,
        [agentId]: { ...state, input: '', streaming: true, messages: [...state.messages, userMsg, agentMsg] },
      }
    })
  }, [agents, pushEvent])

  const broadcast = useCallback((message: string, targetIds: string[]) => {
    pushEvent({ agentId: 'system', agentName: 'Broadcast', accent: '#a855f7', avatar: '⚡', type: 'broadcast', content: message })
    targetIds.forEach(id => {
      const agent = agents.find(a => a.id === id)
      if (!agent) return
      setPanelStates(prev => {
        const state = prev[id]
        if (!state || state.streaming) return prev
        const userMsg: AgentMessage = { id: `bc-u-${Date.now()}-${id}`, role: 'user', content: message, ts: new Date() }
        const agentMsgId = `bc-a-${Date.now()}-${id}`
        const agentMsg: AgentMessage = { id: agentMsgId, role: 'agent', content: '', ts: new Date(), streaming: true }
        setTimeout(() => {
          streamToAgent(id, agent.endpoint, message,
            chunk => setPanelStates(p => ({
              ...p,
              [id]: { ...p[id], messages: p[id].messages.map(m => m.id === agentMsgId ? { ...m, content: m.content + chunk } : m) },
            })),
            () => setPanelStates(p => ({
              ...p,
              [id]: { ...p[id], streaming: false, messages: p[id].messages.map(m => m.id === agentMsgId ? { ...m, streaming: false } : m) },
            })),
          )
        }, 0)
        return { ...prev, [id]: { ...state, streaming: true, messages: [...state.messages, userMsg, agentMsg] } }
      })
    })
  }, [agents, pushEvent])

  const expandedAgent = expandedId ? agents.find(a => a.id === expandedId) : null
  const getState = (id: string): AgentPanelState =>
    panelStates[id] ?? { messages: [], input: '', streaming: false, online: null }

  return (
    <div className="flex flex-col h-full min-h-0">
      <TopBar agents={agents} onPalette={() => setShowPalette(true)} />

      <div className="flex flex-1 gap-3 p-4 min-h-0 overflow-hidden">
        {/* Left: agent grid + broadcast */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">

          {/* Vitals strip */}
          {vitals && (
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {[
                { label: 'Claude', icon: <Sparkles className="w-3 h-3" />, ok: vitals.claude.ok, sub: vitals.claude.version?.split(' ')[0] ?? '—', accent: '#d97757' },
                { label: 'OpenClaw', icon: <Box className="w-3 h-3" />, ok: vitals.openclaw.ok, sub: `${vitals.openclaw.agents.length} agents · ${vitals.openclaw.sessions} sessions`, accent: '#f472b6' },
                { label: 'Hermes', icon: <Cpu className="w-3 h-3" />, ok: vitals.hermes.ok, sub: vitals.hermes.model?.split('/').pop() ?? '—', accent: '#60a5fa' },
              ].map(v => (
                <div
                  key={v.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[130px]"
                  style={{ background: `${v.accent}08`, borderColor: `${v.accent}20` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: v.ok ? '#10b981' : '#ef4444', boxShadow: `0 0 6px ${v.ok ? '#10b981' : '#ef4444'}` }} />
                  <span style={{ color: v.accent }} className="flex-shrink-0">{v.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-white truncate">{v.label}</div>
                    <div className="text-[10px] text-slate-600 truncate">{v.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agent grid — scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-[minmax(220px,280px)]">
              {agents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: idx * 0.04 }}
                  className="flex flex-col min-h-0"
                >
                  <AgentSection
                    agent={agent}
                    state={getState(agent.id)}
                    onSend={() => sendToAgent(agent.id)}
                    onInputChange={v => setPanelStates(prev => ({ ...prev, [agent.id]: { ...getState(agent.id), ...prev[agent.id], input: v } }))}
                    onExpand={() => onOpenAgent ? onOpenAgent(agent.id) : setExpandedId(agent.id)}
                  />
                </motion.div>
              ))}
              {/* Add Agent card always at the end */}
              <AgentAddCard onAdd={onCreateAgent} />
            </div>
          </div>

          <BroadcastBar agents={agents} onBroadcast={broadcast} />
        </div>

        {/* Right: activity feed */}
        <ActivityFeed events={activityEvents} />
      </div>

      <AnimatePresence>
        {showPalette && (
          <CommandPalette
            agents={agents}
            onClose={() => setShowPalette(false)}
            onNavigate={onOpenAgent}
            onCreateAgent={onCreateAgent}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedAgent && (
          <ExpandedAgent
            agent={expandedAgent}
            state={getState(expandedAgent.id)}
            onSend={() => sendToAgent(expandedAgent.id)}
            onInputChange={v => setPanelStates(prev => ({ ...prev, [expandedAgent.id]: { ...getState(expandedAgent.id), ...prev[expandedAgent.id], input: v } }))}
            onClose={() => setExpandedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
