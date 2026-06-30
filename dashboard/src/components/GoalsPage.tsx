'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mic, MicOff, CheckCircle2, Circle, Trash2, Target, Flame, Trophy } from 'lucide-react'
import clsx from 'clsx'

interface Goal {
  id: string
  text: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
  createdAt: number
}

const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#f43f5e', glow: '#f43f5e40' },
  medium: { label: 'Medium', color: '#f59e0b', glow: '#f59e0b40' },
  low: { label: 'Low', color: '#22d3ee', glow: '#22d3ee40' },
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', text: 'Complete AgentOS mission control dashboard', done: true, priority: 'high', createdAt: Date.now() - 86400000 },
    { id: '2', text: 'Connect Claude CLI bridge to web interface', done: false, priority: 'high', createdAt: Date.now() - 3600000 },
    { id: '3', text: 'Set up Obsidian auto-sync for all sessions', done: false, priority: 'medium', createdAt: Date.now() },
    { id: '4', text: 'Configure OpenClaw research pipeline', done: false, priority: 'medium', createdAt: Date.now() },
    { id: '5', text: 'Deploy Hermes to production', done: false, priority: 'low', createdAt: Date.now() },
  ])
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<Goal['priority']>('medium')
  const [listening, setListening] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const recognitionRef = useRef<any>(null)

  const done = goals.filter(g => g.done).length
  const total = goals.length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  function addGoal() {
    const text = input.trim()
    if (!text) return
    setGoals(prev => [
      { id: Date.now().toString(), text, done: false, priority, createdAt: Date.now() },
      ...prev,
    ])
    setInput('')
  }

  function toggleGoal(id: string) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g))
  }

  function deleteGoal(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'en-US'
    r.continuous = false
    r.interimResults = false
    r.onresult = (e: any) => {
      setInput(e.results[0][0].transcript)
    }
    r.onend = () => setListening(false)
    recognitionRef.current = r
    r.start()
    setListening(true)
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  async function saveToObsidian() {
    setSaving(true)
    try {
      const res = await fetch('/api/obsidian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'goals', goals }),
      })
      const data = await res.json()
      setSavedMsg(data.message || 'Saved!')
    } catch {
      setSavedMsg('Saved locally')
    }
    setSaving(false)
    setTimeout(() => setSavedMsg(''), 3000)
  }

  const sorted = [...goals].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Goals</h1>
            <p className="text-xs text-slate-500">{done} of {total} completed</p>
          </div>
        </div>

        <button
          onClick={saveToObsidian}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold hover:bg-violet-500/25 transition-all"
        >
          {saving ? (
            <span className="animate-pulse">Saving...</span>
          ) : savedMsg ? (
            <span className="text-emerald-400">{savedMsg}</span>
          ) : (
            <>
              <span>📓</span> Save to Obsidian
            </>
          )}
        </button>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-4 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400 font-semibold tracking-wider">PROGRESS</span>
          <div className="flex items-center gap-2">
            {pct === 100 && <Trophy className="w-4 h-4 text-amber-400" />}
            {pct > 50 && pct < 100 && <Flame className="w-4 h-4 text-orange-400" />}
            <span className="text-2xl font-bold text-white">{pct}%</span>
          </div>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: pct === 100
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)',
              boxShadow: '0 0 12px #a855f760',
            }}
          />
        </div>
      </motion.div>

      {/* Add goal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="glass-panel p-4 rounded-2xl space-y-3"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
            placeholder="Add a new goal..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
          />

          <button
            onClick={listening ? stopListening : startListening}
            className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              listening
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 status-dot-online'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            )}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={addGoal}
            className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-400 hover:bg-violet-500/30 flex items-center justify-center transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Priority selector */}
        <div className="flex gap-2">
          {(Object.keys(PRIORITY_CONFIG) as Goal['priority'][]).map(p => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={clsx(
                'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                priority === p ? 'text-white' : 'text-slate-500 border-white/5 hover:text-slate-300'
              )}
              style={priority === p ? {
                background: PRIORITY_CONFIG[p].glow,
                borderColor: `${PRIORITY_CONFIG[p].color}50`,
                color: PRIORITY_CONFIG[p].color,
              } : {}}
            >
              {PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Goal list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {sorted.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: i * 0.03 }}
              className={clsx(
                'glass-panel rounded-xl px-4 py-3 flex items-center gap-3 group',
                goal.done && 'opacity-50'
              )}
            >
              {/* Priority stripe */}
              <div
                className="w-0.5 h-6 rounded-full flex-shrink-0"
                style={{ background: PRIORITY_CONFIG[goal.priority].color }}
              />

              <button onClick={() => toggleGoal(goal.id)} className="flex-shrink-0">
                {goal.done
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  : <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400 transition-colors" />
                }
              </button>

              <span className={clsx(
                'flex-1 text-sm',
                goal.done ? 'line-through text-slate-600' : 'text-slate-200'
              )}>
                {goal.text}
              </span>

              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                style={{
                  background: PRIORITY_CONFIG[goal.priority].glow,
                  color: PRIORITY_CONFIG[goal.priority].color,
                }}
              >
                {PRIORITY_CONFIG[goal.priority].label}
              </span>

              <button
                onClick={() => deleteGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
