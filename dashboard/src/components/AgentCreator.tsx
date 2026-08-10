'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Zap, Check } from 'lucide-react'
import {
  AgentConfig, AGENT_TYPES, ACCENT_PRESETS, AVATAR_PRESETS,
  generateId, saveCustomAgent, getAllAgents,
} from '@/lib/agents'

interface Props {
  onClose: () => void
  onCreated: (agent: AgentConfig) => void
  editAgent?: AgentConfig
}

const TOOL_OPTIONS = [
  'web-search', 'code-execute', 'file-ops', 'memory', 'document-parse',
  'send-message', 'route', 'notify', 'summarize', 'monitor', 'scrape',
  'spawn-agent', 'coordinate', 'analysis', 'writing', 'reasoning',
]

export default function AgentCreator({ onClose, onCreated, editAgent }: Props) {
  const allAgents = getAllAgents()

  const [form, setForm] = useState<Partial<AgentConfig>>(editAgent ?? {
    name: '',
    handle: '',
    type: 'Custom',
    status: 'STANDBY',
    accent: '#a855f7',
    avatar: '✦',
    endpoint: '',
    description: '',
    model: 'claude-sonnet-4-6',
    tools: [],
    parentId: undefined,
  })
  const [saved, setSaved] = useState(false)

  const set = (key: keyof AgentConfig, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }))

  const toggleTool = (t: string) => {
    const tools = form.tools ?? []
    set('tools', tools.includes(t) ? tools.filter(x => x !== t) : [...tools, t])
  }

  const handleSave = () => {
    if (!form.name?.trim()) return
    const agent: AgentConfig = {
      id: editAgent?.id ?? generateId(form.name!),
      name: form.name!,
      handle: form.handle || form.name!.toLowerCase().replace(/\s+/g, '-'),
      type: form.type || 'Custom',
      status: form.status || 'STANDBY',
      accent: form.accent || '#a855f7',
      avatar: form.avatar || '✦',
      endpoint: form.endpoint || '',
      description: form.description || '',
      model: form.model,
      tools: form.tools ?? [],
      parentId: form.parentId,
      createdAt: editAgent?.createdAt ?? new Date().toISOString(),
    }
    saveCustomAgent(agent)
    setSaved(true)
    setTimeout(() => onCreated(agent), 700)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-indigo-500/20"
        style={{ background: 'rgba(8,8,24,0.97)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8 sticky top-0 z-10" style={{ background: 'rgba(8,8,24,0.97)' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border"
            style={{ background: `${form.accent}18`, borderColor: `${form.accent}35`, color: form.accent }}
          >
            {form.avatar}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{editAgent ? 'Edit Agent' : 'Create New Agent'}</h2>
            <p className="text-slate-500 text-xs">Configure your AI agent</p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Avatar + Accent */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Avatar</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map(av => (
                  <button
                    key={av}
                    onClick={() => set('avatar', av)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base border transition-all"
                    style={{
                      background: form.avatar === av ? `${form.accent}25` : 'rgba(255,255,255,0.04)',
                      borderColor: form.avatar === av ? `${form.accent}50` : 'rgba(255,255,255,0.08)',
                      color: form.avatar === av ? form.accent : '#64748b',
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => set('accent', c)}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{
                      background: c,
                      borderColor: form.accent === c ? 'white' : 'transparent',
                      boxShadow: form.accent === c ? `0 0 12px ${c}` : 'none',
                    }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={form.accent}
                onChange={e => set('accent', e.target.value)}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-violet-500/50"
                placeholder="#hex"
              />
            </div>
          </div>

          {/* Name + Handle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                placeholder="Agent Alpha"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Handle</label>
              <input
                type="text"
                value={form.handle}
                onChange={e => set('handle', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors font-mono"
                placeholder="auto-generated"
              />
            </div>
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Type</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {AGENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Status</label>
              <div className="flex gap-2">
                {(['ACTIVE', 'STANDBY', 'OFFLINE'] as const).map(s => {
                  const colors = { ACTIVE: '#10b981', STANDBY: '#f59e0b', OFFLINE: '#64748b' }
                  return (
                    <button
                      key={s}
                      onClick={() => set('status', s)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all"
                      style={{
                        background: form.status === s ? `${colors[s]}20` : 'rgba(255,255,255,0.04)',
                        borderColor: form.status === s ? `${colors[s]}50` : 'rgba(255,255,255,0.08)',
                        color: form.status === s ? colors[s] : '#64748b',
                      }}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
              placeholder="What does this agent do?"
            />
          </div>

          {/* Endpoint + Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Endpoint URL</label>
              <input
                type="text"
                value={form.endpoint}
                onChange={e => set('endpoint', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors font-mono text-xs"
                placeholder="http://localhost:5001 or ws://..."
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Model</label>
              <input
                type="text"
                value={form.model}
                onChange={e => set('model', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors font-mono text-xs"
                placeholder="claude-sonnet-4-6"
              />
            </div>
          </div>

          {/* Parent Agent */}
          <div>
            <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Parent Agent (optional)</label>
            <select
              value={form.parentId ?? ''}
              onChange={e => set('parentId', e.target.value || undefined)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <option value="">None (top-level agent)</option>
              {allAgents.filter(a => a.id !== editAgent?.id).map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
              ))}
            </select>
          </div>

          {/* Tools */}
          <div>
            <label className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-2">Tools & Capabilities</label>
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map(t => {
                const active = (form.tools ?? []).includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => toggleTool(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                    style={{
                      background: active ? `${form.accent}20` : 'rgba(255,255,255,0.04)',
                      borderColor: active ? `${form.accent}50` : 'rgba(255,255,255,0.08)',
                      color: active ? form.accent : '#64748b',
                    }}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Save */}
          <motion.button
            onClick={handleSave}
            disabled={!form.name?.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: saved
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : `linear-gradient(135deg, ${form.accent}, ${form.accent}88)`,
              boxShadow: saved ? '0 0 20px #10b98140' : `0 0 20px ${form.accent}40`,
            }}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="saved" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Agent Created!
                </motion.span>
              ) : (
                <motion.span key="create" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {editAgent ? 'Update Agent' : 'Create Agent'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
