'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, ChevronRight, Zap } from 'lucide-react'
import clsx from 'clsx'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  tokens?: number
  responseTime?: number
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Mission Control online. I'm Claude, your primary AI interface. I can help you orchestrate agents, analyze data, write and debug code, and coordinate complex multi-step workflows. What shall we tackle today?",
    timestamp: new Date(Date.now() - 120000),
    tokens: 48,
    responseTime: 0.8,
  },
  {
    id: '2',
    role: 'user',
    content: "Give me a status summary of the current agent operations.",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '3',
    role: 'assistant',
    content: "**Fleet Status Report** — 2026-06-20\n\n**OpenClaw** (Research) — ACTIVE: Currently executing web crawl batch #47. 847 documents indexed this session, 7 tasks in queue. Minor rate limiting detected on one host, auto-throttling engaged.\n\n**Hermes** (Messaging) — ACTIVE: 3 tasks running, 89 completed today. SMTP retry succeeded after brief connectivity issue. All delivery queues nominal.\n\n**Nexus** (Orchestrator) — STANDBY: Queue depth zero, entered low-power mode 2m 47s ago. Ready to spin up on demand.\n\n**Phantom** (Stealth) — OFFLINE: Last active 1h 23m ago. Scheduled maintenance window.\n\nOverall system health: ✓ Nominal. No critical alerts.",
    timestamp: new Date(Date.now() - 55000),
    tokens: 142,
    responseTime: 1.4,
  },
]

let msgIdCounter = 10

export default function ClaudePanel() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [totalTokens, setTotalTokens] = useState(190)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isTyping) return

    const userMsg: Message = {
      id: String(++msgIdCounter),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const startTime = Date.now()

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      const assistantId = String(++msgIdCounter)

      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') break
              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullText += parsed.text
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantId ? { ...m, content: fullText } : m
                    )
                  )
                }
              } catch {
                // Non-JSON chunk, ignore
              }
            }
          }
        }
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      const tokenCount = Math.round(fullText.length / 4)
      setTotalTokens(prev => prev + tokenCount + Math.round(trimmed.length / 4))

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, tokens: tokenCount, responseTime: parseFloat(elapsed) }
            : m
        )
      )
    } catch {
      setIsTyping(false)
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

      setMessages(prev => [...prev, {
        id: String(++msgIdCounter),
        role: 'assistant',
        content: "I'm currently running in offline mode — the Claude CLI isn't reachable from this environment. In production, I'd stream responses directly from `claude -p`. For now, consider this your mission control interface ready for integration.",
        timestamp: new Date(),
        tokens: 52,
        responseTime: parseFloat(elapsed),
      }])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line === '') return <div key={i} className="h-1" />
      // Render inline **bold** spans within a line
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        }
        return <span key={j}>{part}</span>
      })
      return <div key={i} className="leading-relaxed">{rendered}</div>
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel flex flex-col h-full"
      style={{ minHeight: '600px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-violet-500/15">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg glow-box-violet">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d0d1a] status-dot-online" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Claude</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-violet-400 font-mono tracking-wide">claude-sonnet-4-6</span>
              <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
              <span className="text-[10px] text-emerald-400 font-medium">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Tokens</div>
            <div className="text-sm font-mono font-bold text-violet-400 tabular-nums">{totalTokens.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Context</div>
            <div className="text-sm font-mono font-bold text-slate-300">
              {((totalTokens / 200000) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Token usage bar */}
      <div className="h-0.5 bg-white/5 relative overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-600 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((totalTokens / 200000) * 100, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={clsx('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
            >
              {/* Avatar */}
              <div className={clsx(
                'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5',
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-violet-600 to-indigo-700'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700 border border-slate-500/30'
              )}>
                {msg.role === 'assistant'
                  ? <Bot className="w-3.5 h-3.5 text-white" />
                  : <User className="w-3.5 h-3.5 text-slate-300" />
                }
              </div>

              {/* Bubble */}
              <div className={clsx('flex flex-col gap-1 max-w-[85%]', msg.role === 'user' && 'items-end')}>
                <div className={clsx(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'assistant'
                    ? 'bg-[rgba(13,13,30,0.9)] border border-violet-500/20 text-slate-300 rounded-tl-sm [border-left:2px_solid_rgba(124,58,237,0.5)]'
                    : 'bg-gradient-to-br from-violet-700 to-indigo-700 text-white rounded-tr-sm shadow-lg glow-box-violet'
                )}>
                  {msg.role === 'assistant'
                    ? <div className="text-[13px]">{formatContent(msg.content)}</div>
                    : <div className="text-[13px]">{msg.content}</div>
                  }
                </div>
                <div className={clsx('flex items-center gap-2 text-[10px] text-slate-600', msg.role === 'user' && 'flex-row-reverse')}>
                  <span className="font-mono">{formatTime(msg.timestamp)}</span>
                  {msg.tokens && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" />
                        {msg.tokens} tokens
                      </span>
                    </>
                  )}
                  {msg.responseTime && (
                    <>
                      <span>·</span>
                      <span>{msg.responseTime}s</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex gap-3 items-start"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[rgba(13,13,30,0.9)] border border-violet-500/20 [border-left:2px_solid_rgba(124,58,237,0.5)]">
                <div className="flex items-center gap-1.5 h-4">
                  <div className="typing-dot w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <div className="typing-dot w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <div className="typing-dot w-1.5 h-1.5 rounded-full bg-violet-400" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-violet-500/10">
        <div className="flex items-end gap-2 bg-[rgba(10,10,25,0.8)] border border-violet-500/20 rounded-xl p-2 focus-within:border-violet-500/50 focus-within:shadow-[0_0_15px_rgba(124,58,237,0.15)] transition-all duration-200">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a command to Claude... (Enter to send, Shift+Enter for newline)"
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none outline-none leading-relaxed max-h-32 min-h-[36px] py-1 px-2"
            rows={1}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 128) + 'px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className={clsx(
              'p-2 rounded-lg transition-all duration-200 flex-shrink-0',
              input.trim() && !isTyping
                ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg glow-box-violet'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] text-slate-600">Connected to claude-sonnet-4-6 via AgentOS API</span>
          <span className="text-[10px] text-slate-600 font-mono">{input.length} chars</span>
        </div>
      </div>
    </motion.div>
  )
}
