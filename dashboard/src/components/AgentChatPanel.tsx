'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, Settings2, Cpu, Zap, Wifi, WifiOff } from 'lucide-react'
import ChatInput from './ChatInput'
import { getAllAgents } from '@/lib/agents'
type AgentId = string
import clsx from 'clsx'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  ts: Date
}

function TypingIndicator({ accent }: { accent: string }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="typing-dot w-1.5 h-1.5 rounded-full"
          style={{ background: accent, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

async function streamAgentReply(
  agentId: string,
  endpoint: string,
  message: string,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const res = await fetch(`/api/agent/${agentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, endpoint }),
  })
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

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
      if (raw === '[DONE]') return
      try {
        const { text } = JSON.parse(raw)
        if (text) onChunk(text)
      } catch { /* ignore */ }
    }
  }
}

export default function AgentChatPanel({ agentId }: { agentId: AgentId }) {
  const agent = getAllAgents().find(a => a.id === agentId) ?? {
    id: agentId, name: agentId, avatar: '?', accent: '#6366f1',
    status: 'STANDBY' as const, type: 'Unknown', handle: agentId,
    endpoint: '', description: '', isBuiltin: false,
  }

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'agent', content: `${agent.name} online. Ready to assist.`, ts: new Date() },
  ])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(agent.status === 'ACTIVE')
  const [online, setOnline] = useState<boolean | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRunning(agent.status === 'ACTIVE')
    setLoading(false)
  }, [agentId, agent.status])

  // Ping agent health on mount / agent change
  useEffect(() => {
    setOnline(null)
    fetch(`/api/agent/${agentId}`)
      .then(r => r.json())
      .then(d => setOnline(d.online ?? false))
      .catch(() => setOnline(false))
  }, [agentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    if (!running) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, ts: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const agentMsgId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: agentMsgId, role: 'agent', content: '', ts: new Date() }])
    setLoading(false)

    try {
      await streamAgentReply(agentId, agent.endpoint ?? '', text, chunk => {
        setMessages(prev =>
          prev.map(m => m.id === agentMsgId ? { ...m, content: m.content + chunk } : m)
        )
      })
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === agentMsgId
          ? { ...m, content: `${agent.name} is unreachable. Check the daemon is running.` }
          : m
        )
      )
    }
  }

  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  const statusColor = running ? 'text-emerald-400' : 'text-slate-500'
  const statusDotClass = running ? 'bg-emerald-400 status-dot-online' : 'bg-slate-600'

  return (
    <div className="glass-panel flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-indigo-500/15 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold border flex-shrink-0"
          style={{
            background: `${agent.accent}18`,
            borderColor: `${agent.accent}35`,
            color: agent.accent,
            textShadow: `0 0 8px ${agent.accent}`,
          }}
        >
          {agent.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm">{agent.name}</div>
          <div className="text-[10px] text-slate-500">{agent.handle} · {agent.type}</div>
        </div>

        {/* Live connectivity indicator */}
        {online !== null && (
          <div className="flex items-center gap-1 text-[10px]" title={online ? 'Daemon reachable' : 'Daemon offline'}>
            {online
              ? <Wifi className="w-3 h-3 text-emerald-400" />
              : <WifiOff className="w-3 h-3 text-slate-600" />
            }
          </div>
        )}

        {/* Status */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
          style={{
            background: running ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
            borderColor: running ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)',
          }}
        >
          <span className={clsx('w-1.5 h-1.5 rounded-full', statusDotClass)} />
          <span className={clsx('text-[10px] font-medium tracking-widest uppercase', statusColor)}>
            {running ? 'Active' : 'Offline'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRunning(r => !r)}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              running
                ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
            )}
            title={running ? 'Stop agent' : 'Start agent'}
          >
            {running ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors">
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Agent stats strip */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5 bg-white/2">
        <StatChip icon={<Cpu className="w-3 h-3" />} label="Tasks" value="7" accent={agent.accent} />
        <StatChip icon={<Zap className="w-3 h-3" />} label="Completed" value="43" accent={agent.accent} />
        {agent.endpoint && (
          <div className="ml-auto text-[10px] text-slate-600 font-mono truncate max-w-[140px]" title={agent.endpoint}>
            {agent.endpoint}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {m.role === 'agent' && (
                <div
                  className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm border mt-0.5"
                  style={{
                    background: `${agent.accent}15`,
                    borderColor: `${agent.accent}30`,
                    color: agent.accent,
                  }}
                >
                  {agent.avatar}
                </div>
              )}
              <div className={`max-w-[78%] flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={
                    m.role === 'user'
                      ? { background: `${agent.accent}20`, border: `1px solid ${agent.accent}30`, color: '#e2e8f0' }
                      : {
                          background: 'rgba(15,15,35,0.7)',
                          border: '1px solid rgba(99,102,241,0.15)',
                          color: '#cbd5e1',
                          borderLeft: `2px solid ${agent.accent}40`,
                        }
                  }
                >
                  {m.content || <span className="opacity-30">…</span>}
                </div>
                <span className="text-[10px] text-slate-600 px-1 font-mono">{fmt(m.ts)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div
              className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm border mt-0.5"
              style={{ background: `${agent.accent}15`, borderColor: `${agent.accent}30`, color: agent.accent }}
            >
              {agent.avatar}
            </div>
            <div className="glass-panel rounded-2xl" style={{ borderLeft: `2px solid ${agent.accent}40` }}>
              <TypingIndicator accent={agent.accent} />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        {running ? (
          <ChatInput
            onSend={send}
            disabled={loading}
            accent={agent.accent}
            placeholder={`Message ${agent.name}…`}
          />
        ) : (
          <div className="flex items-center justify-center py-4 text-sm text-slate-600">
            Agent is offline.{' '}
            <button
              className="ml-2 text-emerald-500 hover:text-emerald-400 transition-colors"
              onClick={() => setRunning(true)}
            >
              Start it →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatChip({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span style={{ color: accent }}>{icon}</span>
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-300 font-mono font-semibold tabular-nums">{value}</span>
    </div>
  )
}
