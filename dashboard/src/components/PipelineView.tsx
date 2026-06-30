'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox, Sparkles, ShieldCheck, Cpu, CheckCircle2, Send, Loader2, X, Check, Ban, Star, Trash2 } from 'lucide-react'

type Stage = 'inbox' | 'review' | 'building' | 'shipped' | 'rejected'
interface Item {
  slug: string; title: string; stage: Stage; confidence?: number; tags?: string[]
  created: string; idea: string; classification?: string; plan?: string; pinned?: boolean
}

const COLS: { key: Stage; label: string; blurb: string; icon: React.ReactNode; accent: string }[] = [
  { key: 'inbox',    label: 'Capture',     blurb: 'Raw input',          icon: <Inbox size={13} />,       accent: '#5ab896' },
  { key: 'review',   label: 'Human Gate',  blurb: 'Your one checkpoint', icon: <ShieldCheck size={13} />, accent: '#d4a574' },
  { key: 'building', label: 'Execute',     blurb: 'Claude builds it',    icon: <Cpu size={13} />,         accent: '#c97c5e' },
  { key: 'shipped',  label: 'Shipped',     blurb: 'Done & filed',        icon: <CheckCircle2 size={13} />,accent: '#a3e635' },
]

function GraphBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0, h = 0
    const resize = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    resize(); window.addEventListener('resize', resize)
    const COLORS = ['#5ab896', '#d4a574', '#c4607e', '#e6c69a', '#c97c5e']
    const N = 48
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00016, vy: (Math.random() - 0.5) * 0.00016,
      r: Math.random() * 2.4 + 1, c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const n of nodes) { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > 1) n.vx *= -1; if (n.y < 0 || n.y > 1) n.vy *= -1 }
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const a = nodes[i], b = nodes[j]; const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h; const d = Math.hypot(dx, dy)
        if (d < 150) { ctx.strokeStyle = `rgba(212,165,116,${0.06 * (1 - d / 150)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke() }
      }
      for (const n of nodes) {
        ctx.globalAlpha = 0.45; ctx.fillStyle = n.c; ctx.beginPath(); ctx.arc(n.x * w, n.y * h, n.r, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 0.08; ctx.beginPath(); ctx.arc(n.x * w, n.y * h, n.r * 3, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }} />
}

export default function PipelineView() {
  const [items, setItems] = useState<Item[]>([])
  const [capture, setCapture] = useState('')
  const [capturing, setCapturing] = useState(false)
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [err, setErr] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/pipeline', { cache: 'no-store' })
      const j = await r.json()
      setItems(Array.isArray(j.items) ? j.items : [])
    } catch {}
  }, [])

  useEffect(() => { refresh() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function doCapture() {
    const idea = capture.trim(); if (!idea || capturing) return
    setCapturing(true)
    try { await fetch('/api/pipeline/capture', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idea }) }); setCapture(''); await refresh() } catch {}
    setCapturing(false)
  }

  async function shape(slug: string) {
    setBusy(b => ({ ...b, [slug]: true })); setErr(null)
    try {
      const r = await fetch('/api/pipeline/shape', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) })
      const j = await r.json().catch(() => ({}))
      if (!j.ok) setErr(j.error || 'Failed to shape idea. Check your API key.')
    } catch { setErr('Shape failed') }
    await refresh(); setBusy(b => ({ ...b, [slug]: false }))
  }

  async function decide(slug: string, approve: boolean) {
    setBusy(b => ({ ...b, [slug]: true }))
    try { await fetch('/api/pipeline/decide', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, approve }) }) } catch {}
    await refresh(); setBusy(b => ({ ...b, [slug]: false }))
  }

  async function del(slug: string) {
    if (!confirm('Delete this item?')) return
    setItems(xs => xs.filter(x => x.slug !== slug))
    try { await fetch('/api/pipeline/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }) } catch {}
  }

  async function pin(slug: string, pinned: boolean) {
    setItems(xs => xs.map(x => x.slug === slug ? { ...x, pinned } : x))
    try { await fetch('/api/pipeline/pin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, pinned }) }) } catch {}
  }

  const byStage = (s: Stage) => items.filter(i => i.stage === s).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <div className="flex flex-col h-full min-h-0 relative overflow-hidden">
      <GraphBackdrop />

      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-[var(--line-soft)] relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={16} style={{ color: '#d4a574' }} />
          <h2 className="text-[15px] font-semibold" style={{ color: '#f3ebda' }}>Idea Pipeline</h2>
          <span className="text-[11px] ml-1" style={{ color: '#6e6353' }}>{items.length} items</span>
        </div>
        {/* Capture */}
        <div className="flex gap-2">
          <input
            value={capture} onChange={e => setCapture(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') doCapture() }}
            placeholder="Drop an idea, task, or link to capture…"
            className="flex-1 rounded-xl px-3 py-2 text-[13px] placeholder:text-[var(--cream-mute)] focus:outline-none"
            style={{ background: 'var(--bg-mid)', border: '1px solid var(--line-soft)', color: '#f3ebda' }}
          />
          <button onClick={doCapture} disabled={!capture.trim() || capturing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold disabled:opacity-40"
            style={{ background: '#d4a574', color: '#1a130a' }}>
            {capturing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Capture
          </button>
        </div>
        {err && <div className="text-[12px] mt-2 px-3 py-1.5 rounded-lg" style={{ color: 'var(--plum)', background: 'rgba(196,96,126,0.08)', border: '1px solid rgba(196,96,126,0.2)' }}>{err}</div>}
      </div>

      {/* Board */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden relative z-10">
        <div className="flex gap-3 h-full p-4 min-w-max">
          {COLS.map(col => {
            const colItems = byStage(col.key)
            return (
              <div key={col.key} className="flex flex-col w-72 min-h-0">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span style={{ color: col.accent }}>{col.icon}</span>
                  <span className="text-[12px] font-semibold" style={{ color: '#ddd0bb' }}>{col.label}</span>
                  <span className="text-[10px] ml-auto font-mono" style={{ color: '#6e6353' }}>{colItems.length}</span>
                </div>
                <div className="text-[10px] mb-2 px-1" style={{ color: '#6e6353' }}>{col.blurb}</div>

                {/* Cards */}
                <div className="flex-1 min-h-0 overflow-y-auto scroll space-y-2 pr-0.5">
                  <AnimatePresence initial={false}>
                    {colItems.map(item => (
                      <motion.div key={item.slug}
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-xl p-3 border"
                        style={{ background: 'rgba(37,29,44,0.85)', borderColor: item.pinned ? `${col.accent}50` : 'var(--line-soft)' }}>

                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-[12.5px] font-medium truncate" style={{ color: '#f3ebda' }}>{item.title}</div>
                            <div className="text-[10.5px] mt-0.5 line-clamp-2" style={{ color: '#6e6353' }}>{item.idea}</div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => pin(item.slug, !item.pinned)} className="p-1 rounded text-[var(--cream-mute)] hover:text-[var(--gold)]">
                              <Star size={11} fill={item.pinned ? '#d4a574' : 'none'} style={{ color: item.pinned ? '#d4a574' : undefined }} />
                            </button>
                            <button onClick={() => del(item.slug)} className="p-1 rounded text-[var(--cream-mute)] hover:text-[var(--plum)]">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {item.classification && (
                          <div className="text-[10px] px-2 py-0.5 rounded-full inline-block mb-2" style={{ background: `${col.accent}15`, color: col.accent, border: `1px solid ${col.accent}30` }}>
                            {item.classification}
                          </div>
                        )}

                        {item.plan && (
                          <div className="text-[11px] mb-2 rounded-lg p-2" style={{ background: 'var(--bg-mid)', color: '#a59783' }}>
                            {item.plan.slice(0, 160)}{item.plan.length > 160 ? '…' : ''}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-1.5 mt-1">
                          {item.stage === 'inbox' && (
                            <button onClick={() => shape(item.slug)} disabled={busy[item.slug]}
                              className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold border disabled:opacity-50"
                              style={{ borderColor: `${col.accent}40`, color: col.accent, background: `${col.accent}0c` }}>
                              {busy[item.slug] ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                              Shape with AI
                            </button>
                          )}
                          {item.stage === 'review' && (
                            <>
                              <button onClick={() => decide(item.slug, true)} disabled={busy[item.slug]}
                                className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold"
                                style={{ background: 'rgba(90,184,150,0.15)', color: '#5ab896', border: '1px solid rgba(90,184,150,0.3)' }}>
                                <Check size={11} /> Approve
                              </button>
                              <button onClick={() => decide(item.slug, false)} disabled={busy[item.slug]}
                                className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold"
                                style={{ background: 'rgba(196,96,126,0.12)', color: '#c4607e', border: '1px solid rgba(196,96,126,0.25)' }}>
                                <Ban size={11} /> Reject
                              </button>
                            </>
                          )}
                          {item.stage === 'building' && (
                            <div className="flex-1 flex items-center gap-1.5 text-[11px]" style={{ color: '#d4a574' }}>
                              <Loader2 size={11} className="animate-spin" /> Building…
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {colItems.length === 0 && (
                    <div className="text-[11px] text-center py-6" style={{ color: '#6e6353', borderColor: 'var(--line-soft)' }}>
                      {col.key === 'inbox' ? 'Capture something above' : 'Empty'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
