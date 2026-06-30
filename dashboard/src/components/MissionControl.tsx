'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Radio, Zap, Activity, Cpu, Globe, ChevronRight,
  AlertCircle, CheckCircle2, Clock, Maximize2, X, Terminal,
} from 'lucide-react'
import { getAllAgents, type AgentConfig } from '@/lib/agents'

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

// ── SSE streaming helper ───────────────────────────────────────────────────

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
        try { const { text } = JSON.parse(raw); if (text) onChunk(text) } catch { /* skip */ }
      }
    }
    onDone()
  } catch {
    onDone()
  }
}

// ── Pulsing status dot ─────────────────────────────────────────────────────

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

// ── Mini waveform ──────────────────────────────────────────────────────────

function Waveform({ active, accent }: { active: boolean; accent: string }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: accent }}
          animate={active ? { height: [h, h * 1.8, h] } : { height: 2 }}
          transition={{ duration: 0.5, repeat: active ? Infinity : 0, delay: i * 0.07, ease: 'easeInOut' }}
        />
      ))}
    </div>
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
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isOffline = agent.status === 'OFFLINE'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages, state.streaming])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col rounded-2xl border overflow-hidden relative"
      style={{
        background: `linear-gradient(145deg, ${agent.accent}06 0%, rgba(8,8,20,0.9) 60%)`,
        borderColor: `${agent.accent}25`,
        boxShadow: `0 0 0 1px ${agent.accent}10, inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
    >
      {/* Ambient glow top-right */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: agent.accent }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: `${agent.accent}15`, background: `${agent.accent}08` }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold border flex-shrink-0"
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
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold text-xs truncate">{agent.name}</span>
            {agent.isBuiltin && (
              <span className="text-[8px] px-1 py-0.5 rounded font-bold tracking-wider" style={{ background: `${agent.accent}20`, color: agent.accent }}>CORE</span>
            )}
          </div>
          <div className="text-[9px] text-slate-600 truncate">{agent.type}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Waveform active={state.streaming} accent={agent.accent} />
          <StatusDot status={agent.status} online={state.online} />
          <span
            className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full"
            style={{
              background: agent.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : agent.status === 'STANDBY' ? 'rgba(245,158,11,0.1)' : 'rgba(71,85,105,0.1)',
              color: agent.status === 'ACTIVE' ? '#10b981' : agent.status === 'STANDBY' ? '#f59e0b' : '#475569',
            }}
          >
            {agent.status}
          </span>
          <button
            onClick={onExpand}
            className="p-1 rounded text-slate-600 hover:text-white transition-colors"
            title="Open full chat"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-0">
        <AnimatePresence initial={false}>
          {state.messages.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[88%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                style={
                  m.role === 'user'
                    ? { background: `${agent.accent}22`, border: `1px solid ${agent.accent}30`, color: '#e2e8f0' }
                    : { background: 'rgba(15,15,35,0.8)', border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `2px solid ${agent.accent}50`, color: '#cbd5e1' }
                }
              >
                {m.content || (m.streaming ? <span className="opacity-40">…</span> : '')}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {state.streaming && state.messages[state.messages.length - 1]?.role !== 'agent' && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(15,15,35,0.8)', border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `2px solid ${agent.accent}50` }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ background: agent.accent }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
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
        style={{ borderColor: `${agent.accent}12`, background: `${agent.accent}05` }}
      >
        {isOffline ? (
          <div className="text-[10px] text-slate-600 text-center py-1 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Agent offline
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={state.input}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={handleKey}
              disabled={state.streaming}
              placeholder={`Command ${agent.name}…`}
              rows={1}
              className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-700 resize-none focus:outline-none leading-relaxed py-1"
              style={{ maxHeight: 60, minHeight: 20 }}
            />
            <button
              onClick={onSend}
              disabled={!state.input.trim() || state.streaming}
              className="flex-shrink-0 p-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{
                background: state.input.trim() ? `${agent.accent}25` : 'transparent',
                color: state.input.trim() ? agent.accent : '#475569',
              }}
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
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
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl h-[70vh] flex flex-col rounded-2xl border overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${agent.accent}08 0%, rgba(8,8,20,0.98) 50%)`,
          borderColor: `${agent.accent}30`,
          boxShadow: `0 0 60px ${agent.accent}20`,
        }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0" style={{ borderColor: `${agent.accent}15` }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border"
            style={{ background: `${agent.accent}18`, borderColor: `${agent.accent}35`, color: agent.accent, textShadow: `0 0 12px ${agent.accent}` }}
          >
            {agent.avatar}
          </div>
          <div className="flex-1">
            <div className="text-white font-bold">{agent.name}</div>
            <div className="text-[11px] text-slate-500">{agent.handle} · {agent.type}</div>
          </div>
          <StatusDot status={agent.status} online={state.online} />
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
          {state.messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  m.role === 'user'
                    ? { background: `${agent.accent}20`, border: `1px solid ${agent.accent}30`, color: '#e2e8f0' }
                    : { background: 'rgba(15,15,35,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `2px solid ${agent.accent}50`, color: '#cbd5e1' }
                }
              >
                {m.content || <span className="opacity-30">…</span>}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 py-3 border-t flex-shrink-0" style={{ borderColor: `${agent.accent}15` }}>
          <div className="flex items-end gap-3 bg-white/5 rounded-xl px-4 py-2.5 border border-white/8">
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
              style={{ background: `${agent.accent}25`, color: agent.accent }}
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

function BroadcastBar({ agents, onBroadcast }: { agents: AgentConfig[]; onBroadcast: (msg: string, targets: string[]) => void }) {
  const [msg, setMsg] = useState('')
  const [targets, setTargets] = useState<Set<string>>(new Set(agents.filter(a => a.status !== 'OFFLINE').map(a => a.id)))
  const [sent, setSent] = useState(false)

  const broadcast = () => {
    if (!msg.trim()) return
    onBroadcast(msg.trim(), Array.from(targets))
    setMsg('')
    setSent(true)
    setTimeout(() => setSent(false), 2000)
  }

  return (
    <div className="glass-panel px-4 py-3 flex items-center gap-3 flex-shrink-0">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Radio className="w-4 h-4 text-violet-400" />
        <span className="text-[11px] font-bold text-violet-400 tracking-widest uppercase">Broadcast</span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {agents.map(a => (
          <button
            key={a.id}
            onClick={() => setTargets(prev => {
              const n = new Set(prev)
              n.has(a.id) ? n.delete(a.id) : n.add(a.id)
              return n
            })}
            disabled={a.status === 'OFFLINE'}
            className="text-[9px] px-2 py-0.5 rounded-full border transition-all disabled:opacity-30"
            style={{
              background: targets.has(a.id) ? `${a.accent}20` : 'transparent',
              borderColor: targets.has(a.id) ? `${a.accent}50` : 'rgba(255,255,255,0.08)',
              color: targets.has(a.id) ? a.accent : '#475569',
            }}
            title={a.name}
          >
            {a.avatar}
          </button>
        ))}
      </div>

      <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/8">
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
          style={{ background: sent ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.2)', color: sent ? '#10b981' : '#a855f7' }}
        >
          {sent ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
          {sent ? 'Sent' : 'Send'}
        </button>
      </div>
    </div>
  )
}

// ── System metrics strip ───────────────────────────────────────────────────

function MetricsStrip({ agents }: { agents: AgentConfig[] }) {
  const active = agents.filter(a => a.status === 'ACTIVE').length
  const standby = agents.filter(a => a.status === 'STANDBY').length
  const offline = agents.filter(a => a.status === 'OFFLINE').length

  return (
    <div className="glass-panel px-4 py-2.5 flex items-center gap-6 flex-shrink-0 text-[11px]">
      <div className="flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 text-violet-400" />
        <span className="font-bold text-white tracking-wider uppercase text-[10px]">Mission Control</span>
      </div>
      <div className="h-3 w-px bg-white/10" />
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-slate-400">{active} active</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span className="text-slate-400">{standby} standby</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        <span className="text-slate-500">{offline} offline</span>
      </div>
      <div className="h-3 w-px bg-white/10 ml-auto" />
      <div className="flex items-center gap-1.5 text-slate-500">
        <Clock className="w-3 h-3" />
        <span className="font-mono">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-500">
        <Globe className="w-3 h-3" />
        <span>localhost:3333</span>
      </div>
    </div>
  )
}

// ── Main MissionControl ────────────────────────────────────────────────────

export default function MissionControl({ onOpenAgent }: { onOpenAgent?: (id: string) => void }) {
  const agents = getAllAgents().filter(a => a.isBuiltin)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [panelStates, setPanelStates] = useState<Record<string, AgentPanelState>>(() =>
    Object.fromEntries(agents.map(a => [a.id, {
      messages: [{ id: '0', role: 'agent', content: `${a.name} standing by.`, ts: new Date() }],
      input: '',
      streaming: false,
      online: null,
    }]))
  )

  // Ping all agents on mount
  useEffect(() => {
    agents.forEach(agent => {
      fetch(`/api/agent/${agent.id}`)
        .then(r => r.json())
        .then(d => setPanelStates(prev => ({
          ...prev,
          [agent.id]: { ...prev[agent.id], online: d.online ?? false },
        })))
        .catch(() => setPanelStates(prev => ({
          ...prev,
          [agent.id]: { ...prev[agent.id], online: false },
        })))
    })
  }, []) // eslint-disable-line

  // Clock tick for metrics
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const sendToAgent = useCallback((agentId: string) => {
    setPanelStates(prev => {
      const state = prev[agentId]
      if (!state?.input.trim() || state.streaming) return prev

      const userMsg: AgentMessage = { id: Date.now().toString(), role: 'user', content: state.input.trim(), ts: new Date() }
      const agentMsgId = (Date.now() + 1).toString()
      const agentMsg: AgentMessage = { id: agentMsgId, role: 'agent', content: '', ts: new Date(), streaming: true }

      const agent = agents.find(a => a.id === agentId)!

      // Kick off streaming after state update
      setTimeout(() => {
        streamToAgent(
          agentId,
          agent.endpoint,
          userMsg.content,
          chunk => setPanelStates(p => ({
            ...p,
            [agentId]: {
              ...p[agentId],
              messages: p[agentId].messages.map(m => m.id === agentMsgId ? { ...m, content: m.content + chunk } : m),
            },
          })),
          () => setPanelStates(p => ({
            ...p,
            [agentId]: {
              ...p[agentId],
              streaming: false,
              messages: p[agentId].messages.map(m => m.id === agentMsgId ? { ...m, streaming: false } : m),
            },
          })),
        )
      }, 0)

      return {
        ...prev,
        [agentId]: {
          ...state,
          input: '',
          streaming: true,
          messages: [...state.messages, userMsg, agentMsg],
        },
      }
    })
  }, [agents])

  const broadcast = useCallback((message: string, targetIds: string[]) => {
    targetIds.forEach(id => {
      setPanelStates(prev => {
        const state = prev[id]
        if (!state || state.streaming) return prev
        const userMsg: AgentMessage = { id: `bc-${Date.now()}-${id}`, role: 'user', content: message, ts: new Date() }
        const agentMsgId = `bc-reply-${Date.now()}-${id}`
        const agentMsg: AgentMessage = { id: agentMsgId, role: 'agent', content: '', ts: new Date(), streaming: true }
        const agent = agents.find(a => a.id === id)!

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

        return {
          ...prev,
          [id]: { ...state, streaming: true, messages: [...state.messages, userMsg, agentMsg] },
        }
      })
    })
  }, [agents])

  const expandedAgent = expandedId ? agents.find(a => a.id === expandedId) : null

  // Grid layout: 3 cols on wide, 2 on medium, 1 on small
  const visibleAgents = agents.slice(0, 6)

  return (
    <div className="flex flex-col h-full gap-3 p-4 min-h-0">
      <MetricsStrip agents={agents} />
      <BroadcastBar agents={visibleAgents} onBroadcast={broadcast} />

      {/* Agent grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-hidden">
        {visibleAgents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="min-h-0 flex flex-col"
          >
            <AgentSection
              agent={agent}
              state={panelStates[agent.id] ?? { messages: [], input: '', streaming: false, online: null }}
              onSend={() => sendToAgent(agent.id)}
              onInputChange={v => setPanelStates(prev => ({ ...prev, [agent.id]: { ...prev[agent.id], input: v } }))}
              onExpand={() => onOpenAgent ? onOpenAgent(agent.id) : setExpandedId(agent.id)}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {expandedAgent && (
          <ExpandedAgent
            agent={expandedAgent}
            state={panelStates[expandedAgent.id]}
            onSend={() => sendToAgent(expandedAgent.id)}
            onInputChange={v => setPanelStates(prev => ({ ...prev, [expandedAgent.id]: { ...prev[expandedAgent.id], input: v } }))}
            onClose={() => setExpandedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
