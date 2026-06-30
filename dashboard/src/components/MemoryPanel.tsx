'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Search, Plus, Trash2, Tag, X, BookOpen } from 'lucide-react'
import { getAllAgents } from '@/lib/agents'
import type { MemoryEntry, MemoryType } from '@/lib/memory'

const TYPE_COLORS: Record<MemoryType, string> = {
  fact: '#6366f1',
  conversation: '#06b6d4',
  preference: '#a855f7',
  task: '#f59e0b',
  note: '#10b981',
}

const TYPE_LABELS: Record<MemoryType, string> = {
  fact: 'Fact',
  conversation: 'Conversation',
  preference: 'Preference',
  task: 'Task',
  note: 'Note',
}

function MemoryCard({ entry, onDelete }: { entry: MemoryEntry; onDelete: () => void }) {
  const color = TYPE_COLORS[entry.type]
  const agents = getAllAgents()
  const agent = agents.find(a => a.id === entry.agentId)
  const label = agent ? agent.name : entry.agentId === 'global' ? 'Global' : entry.agentId

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border p-4 relative"
      style={{ background: `${color}08`, borderColor: `${color}20` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase"
              style={{ background: `${color}20`, color }}
            >
              {TYPE_LABELS[entry.type]}
            </span>
            <span className="text-[10px] text-slate-600">
              {agent?.avatar && <span className="mr-1">{agent.avatar}</span>}
              {label}
            </span>
            {entry.tags.map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded font-mono text-slate-600" style={{ background: 'rgba(255,255,255,0.04)' }}>
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
          <div className="mt-2 text-[10px] text-slate-700 font-mono">
            {new Date(entry.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

function AddMemoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [content, setContent] = useState('')
  const [type, setType] = useState<MemoryType>('note')
  const [agentId, setAgentId] = useState('global')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const agents = getAllAgents()

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  const save = async () => {
    if (!content.trim()) return
    setSaving(true)
    await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type, agentId, tags }),
    })
    onSaved()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg rounded-2xl border border-indigo-500/20 p-6 space-y-4"
        style={{ background: 'rgba(8,8,24,0.98)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <h2 className="text-white font-bold text-sm">Add Memory</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <textarea
          autoFocus
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What should be remembered?"
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-slate-600 uppercase tracking-widest mb-1.5">Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as MemoryType)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              {(Object.keys(TYPE_LABELS) as MemoryType[]).map(t => (
                <option key={t} value={t} style={{ background: '#0a0a1a' }}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-600 uppercase tracking-widest mb-1.5">Agent</label>
            <select
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="global" style={{ background: '#0a0a1a' }}>Global</option>
              {agents.map(a => (
                <option key={a.id} value={a.id} style={{ background: '#0a0a1a' }}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-slate-600 uppercase tracking-widest mb-1.5">Tags</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                #{t}
                <button onClick={() => setTags(p => p.filter(x => x !== t))}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
              placeholder="Add tag…"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={addTag}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 border border-white/10 hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!content.trim() || saving}
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save Memory'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MemoryPanel() {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [search, setSearch] = useState('')
  const [filterAgent, setFilterAgent] = useState('all')
  const [filterType, setFilterType] = useState<MemoryType | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [obsidianSync, setObsidianSync] = useState<{ enabled: boolean; vaultDir: string } | null>(null)

  const agents = getAllAgents()

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterAgent !== 'all') params.set('agentId', filterAgent)
    if (search.trim()) params.set('q', search.trim())
    const res = await fetch(`/api/memory?${params}`)
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filterAgent, search])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(load, search ? 200 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  useEffect(() => {
    fetch('/api/obsidian')
      .then(r => r.json())
      .then(d => setObsidianSync({ enabled: d.syncEnabled, vaultDir: d.vaultDir }))
      .catch(() => {})
  }, [])

  const handleDelete = async (id: string) => {
    await fetch(`/api/memory/${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const filtered = filterType === 'all' ? entries : entries.filter(e => e.type === filterType)

  return (
    <div className="flex flex-col h-full min-h-0 p-6 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-400" />
          <h1 className="text-lg font-bold text-white">Memory</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 font-mono">
            {filtered.length} entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          {obsidianSync && (
            <div
              title={`Obsidian sync ${obsidianSync.enabled ? 'active' : 'disabled'}\n${obsidianSync.vaultDir}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium"
              style={{
                background: obsidianSync.enabled ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)',
                borderColor: obsidianSync.enabled ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)',
                color: obsidianSync.enabled ? '#a78bfa' : '#475569',
              }}
            >
              <BookOpen className="w-3 h-3" />
              Obsidian {obsidianSync.enabled ? 'sync on' : 'sync off'}
            </div>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Memory
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search memories…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40"
          />
        </div>

        <select
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-indigo-500/40"
        >
          <option value="all" style={{ background: '#0a0a1a' }}>All agents</option>
          <option value="global" style={{ background: '#0a0a1a' }}>Global</option>
          {agents.map(a => (
            <option key={a.id} value={a.id} style={{ background: '#0a0a1a' }}>{a.name}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as MemoryType | 'all')}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-indigo-500/40"
        >
          <option value="all" style={{ background: '#0a0a1a' }}>All types</option>
          {(Object.keys(TYPE_LABELS) as MemoryType[]).map(t => (
            <option key={t} value={t} style={{ background: '#0a0a1a' }}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Type summary chips */}
      <div className="flex gap-2 flex-wrap flex-shrink-0">
        {(Object.keys(TYPE_COLORS) as MemoryType[]).map(t => {
          const count = entries.filter(e => e.type === t).length
          if (!count) return null
          return (
            <button
              key={t}
              onClick={() => setFilterType(prev => prev === t ? 'all' : t)}
              className="text-[10px] px-2.5 py-1 rounded-full border transition-all"
              style={{
                background: filterType === t ? `${TYPE_COLORS[t]}20` : 'transparent',
                borderColor: filterType === t ? `${TYPE_COLORS[t]}40` : 'rgba(255,255,255,0.08)',
                color: filterType === t ? TYPE_COLORS[t] : '#475569',
              }}
            >
              {TYPE_LABELS[t]} · {count}
            </button>
          )
        })}
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-600 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-600">
            <Brain className="w-8 h-8 opacity-30" />
            <span className="text-sm">{search ? 'No matches found.' : 'No memories yet. Add one above.'}</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map(entry => (
              <MemoryCard key={entry.id} entry={entry} onDelete={() => handleDelete(entry.id)} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showAdd && <AddMemoryModal onClose={() => setShowAdd(false)} onSaved={load} />}
      </AnimatePresence>
    </div>
  )
}
