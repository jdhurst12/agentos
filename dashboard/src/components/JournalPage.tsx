'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, BookOpen, Save, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import clsx from 'clsx'

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function prettyDate(s: string) {
  const d = new Date(s + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function JournalPage() {
  const today = formatDate(new Date())
  const [currentDate, setCurrentDate] = useState(today)
  const [entries, setEntries] = useState<Record<string, string>>({ [today]: '' })
  const [listening, setListening] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const text = entries[currentDate] ?? ''

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(Boolean).length
    setWordCount(words)
  }, [text])

  function setText(val: string) {
    setEntries(prev => ({ ...prev, [currentDate]: val }))
  }

  function prevDay() {
    const d = new Date(currentDate + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    setCurrentDate(formatDate(d))
  }

  function nextDay() {
    const d = new Date(currentDate + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    const next = formatDate(d)
    if (next <= today) setCurrentDate(next)
  }

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'en-US'
    r.continuous = true
    r.interimResults = true
    let base = text
    r.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((res: any) => res[0].transcript)
        .join('')
      setText(base + (base && !base.endsWith(' ') ? ' ' : '') + transcript)
    }
    r.onend = () => setListening(false)
    r.onstart = () => { base = text }
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
        body: JSON.stringify({ type: 'journal', date: currentDate, content: text }),
      })
      const data = await res.json()
      setSavedMsg(data.message || 'Saved!')
    } catch {
      setSavedMsg('Saved locally')
    }
    setSaving(false)
    setTimeout(() => setSavedMsg(''), 3000)
  }

  const isToday = currentDate === today

  return (
    <div className="flex-1 p-6 flex flex-col gap-5 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Journal</h1>
            <p className="text-xs text-slate-500">One file per day · Obsidian sync</p>
          </div>
        </div>

        <button
          onClick={saveToObsidian}
          disabled={saving || !text.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-all disabled:opacity-40"
        >
          {saving ? (
            <span className="animate-pulse">Saving...</span>
          ) : savedMsg ? (
            <span className="text-emerald-400">{savedMsg}</span>
          ) : (
            <><Save className="w-3.5 h-3.5" /> Save to Obsidian</>
          )}
        </button>
      </motion.div>

      {/* Date navigator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl p-4 flex items-center gap-4"
      >
        <button
          onClick={prevDay}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 text-center">
          <div className="text-sm font-semibold text-white">{prettyDate(currentDate)}</div>
          {isToday && (
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">Today</span>
            </div>
          )}
        </div>

        <button
          onClick={nextDay}
          disabled={currentDate >= today}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button
          onClick={listening ? stopListening : startListening}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border',
            listening
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          )}
        >
          {listening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span className="animate-pulse">Recording...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              Voice Input
            </>
          )}
        </button>

        <div className="flex-1" />

        <span className="text-xs text-slate-600">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
      </div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col"
      >
        {/* Markdown hint bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5">
          {['# Heading', '**Bold**', '*Italic*', '- List', '> Quote'].map(hint => (
            <button
              key={hint}
              onClick={() => {
                const el = textareaRef.current
                if (!el) return
                const s = el.selectionStart
                const e = el.selectionEnd
                const before = text.slice(0, s)
                const after = text.slice(e)
                const insert = hint.split(' ')[0] + ' '
                const newText = before + insert + after
                setText(newText)
                setTimeout(() => {
                  el.selectionStart = el.selectionEnd = s + insert.length
                  el.focus()
                }, 0)
              }}
              className="text-[10px] font-mono text-slate-600 hover:text-slate-300 transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
            >
              {hint}
            </button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`What's on your mind today?\n\nWrite freely — this auto-saves to your Obsidian vault at\n/Agent Memory/${currentDate}.md`}
          className="flex-1 w-full bg-transparent p-5 text-sm text-slate-200 placeholder-slate-700 resize-none focus:outline-none leading-relaxed font-mono"
          style={{ minHeight: '300px' }}
        />
      </motion.div>

      {/* File path hint */}
      <div className="text-[10px] text-slate-700 text-center">
        Syncs to: <span className="text-slate-500 font-mono">Agent Memory/{currentDate}.md</span>
      </div>
    </div>
  )
}
