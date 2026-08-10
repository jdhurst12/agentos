'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react'
import clsx from 'clsx'

type EventType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'

interface LogEvent {
  id: string
  timestamp: string
  agent: string
  message: string
  type: EventType
}

const INITIAL_EVENTS: LogEvent[] = [
  { id: '1', timestamp: '23:58:01', agent: 'OpenClaw', message: 'Initialized web crawl session for target domain batch #47', type: 'INFO' },
  { id: '2', timestamp: '23:58:03', agent: 'Hermes', message: 'Delivered 3 notifications to Slack workspace channels', type: 'SUCCESS' },
  { id: '3', timestamp: '23:58:07', agent: 'Claude', message: 'Completed code review task — 4 issues flagged, 2 resolved', type: 'SUCCESS' },
  { id: '4', timestamp: '23:58:12', agent: 'OpenClaw', message: 'Rate limit detected on target host, backing off 30s', type: 'WARNING' },
  { id: '5', timestamp: '23:58:15', agent: 'Nexus', message: 'Orchestration queue depth: 0 — entering standby mode', type: 'INFO' },
  { id: '6', timestamp: '23:58:22', agent: 'Claude', message: 'Generated 1,247 tokens in response to user query', type: 'INFO' },
  { id: '7', timestamp: '23:58:29', agent: 'Hermes', message: 'Email delivery failed: SMTP connection timeout', type: 'ERROR' },
  { id: '8', timestamp: '23:58:33', agent: 'Hermes', message: 'Retry succeeded on second attempt — message delivered', type: 'SUCCESS' },
  { id: '9', timestamp: '23:58:41', agent: 'OpenClaw', message: 'Scraped and indexed 847 new documents this session', type: 'SUCCESS' },
  { id: '10', timestamp: '23:58:48', agent: 'Claude', message: 'Tool call: read_file("/src/app/layout.tsx") — 142 tokens', type: 'INFO' },
]

const MESSAGE_POOL: Array<{ agent: string; message: string; type: EventType }> = [
  { agent: 'OpenClaw', message: 'Discovered 23 new links in crawl depth 3', type: 'INFO' },
  { agent: 'OpenClaw', message: 'Successfully extracted structured data from target page', type: 'SUCCESS' },
  { agent: 'OpenClaw', message: 'Blocked by CAPTCHA on page — routing through fallback', type: 'WARNING' },
  { agent: 'Hermes', message: 'Processed 5 incoming webhook events from GitHub', type: 'SUCCESS' },
  { agent: 'Hermes', message: 'Message queue flushed — 0 pending items', type: 'INFO' },
  { agent: 'Claude', message: 'Completed task: "Refactor authentication module"', type: 'SUCCESS' },
  { agent: 'Claude', message: 'Tool call: bash("npm run test") — exit code 0', type: 'SUCCESS' },
  { agent: 'Claude', message: 'Context window at 68% capacity — compressing history', type: 'WARNING' },
  { agent: 'Claude', message: 'Generated architecture diagram for microservices spec', type: 'SUCCESS' },
  { agent: 'Nexus', message: 'Scheduled 3 deferred tasks for next cycle', type: 'INFO' },
  { agent: 'System', message: 'Heartbeat check passed — all services healthy', type: 'SUCCESS' },
  { agent: 'System', message: 'Memory pressure detected — running GC sweep', type: 'WARNING' },
  { agent: 'OpenClaw', message: 'Completed research batch: 1,204 tokens indexed', type: 'SUCCESS' },
  { agent: 'Hermes', message: 'Dispatched daily digest to 12 subscribers', type: 'SUCCESS' },
  { agent: 'Claude', message: 'API call latency spike: 4.2s (threshold: 3.0s)', type: 'WARNING' },
]

const typeConfig: Record<EventType, {
  icon: React.ElementType
  color: string
  bg: string
  border: string
  dot: string
}> = {
  INFO: { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  SUCCESS: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  ERROR: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20', dot: 'bg-red-400' },
}

const agentColor: Record<string, string> = {
  OpenClaw: 'text-cyan-300',
  Hermes: 'text-pink-300',
  Claude: 'text-violet-300',
  Nexus: 'text-amber-300',
  Phantom: 'text-red-300',
  System: 'text-slate-400',
}

let idCounter = 100

export default function ActivityLog() {
  const [events, setEvents] = useState<LogEvent[]>(INITIAL_EVENTS)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const template = MESSAGE_POOL[Math.floor(Math.random() * MESSAGE_POOL.length)]
      const now = new Date()
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

      const newEvent: LogEvent = {
        id: String(++idCounter),
        timestamp,
        ...template,
      }

      setEvents(prev => {
        const next = [newEvent, ...prev]
        return next.slice(0, 50)
      })
    }, 3000 + Math.random() * 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-panel p-4 flex flex-col gap-3 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wider uppercase">Activity Log</h2>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-online" />
        </div>
        <div className="text-[10px] text-slate-500 font-mono">{events.length} events</div>
      </div>

      {/* Events scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1"
        style={{ maxHeight: '420px' }}
      >
        <AnimatePresence initial={false}>
          {events.map((event) => {
            const cfg = typeConfig[event.type]
            const Icon = cfg.icon

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={clsx(
                  'flex items-start gap-2 p-2 rounded-lg border text-[11px]',
                  cfg.bg, cfg.border
                )}
              >
                <Icon className={clsx('w-3 h-3 mt-0.5 flex-shrink-0', cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={clsx('font-semibold', agentColor[event.agent] || 'text-slate-300')}>
                      {event.agent}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-600 font-mono tabular-nums">{event.timestamp}</span>
                  </div>
                  <div className="text-slate-400 leading-relaxed truncate">{event.message}</div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
