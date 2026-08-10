'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageSquare, Send, Square, Trash2, Network, Sparkles, Search, Gavel, Users } from 'lucide-react'

const ACCENT = '#d4a574'
const HISTORY_KEY = 'agentos/fusion/history/v1'
const PANEL = ['Analyst', 'Critic', 'Devil\'s Advocate', 'Synthesist', 'Judge']

type Msg = { role: 'user' | 'assistant'; text: string }

const PRESETS = [
  { name: 'Ask the board', q: '' },
  { name: 'SEO content council', q: 'Act as an SEO content council. For the keyword "[KEYWORD]", synthesise: search intent, the angle competitors miss, a recommended H2 outline, and 3 questions every article forgets to answer.' },
  { name: 'Red-team my idea', q: 'Red-team this idea. Find the weakest assumption, the objection that kills it fastest, and the one change that would most strengthen it. Idea: "[IDEA]"' },
  { name: 'Deep research', q: 'Do deep research on "[TOPIC]". Give me what\'s confirmed, what\'s contested, the strongest opposing view, and the 3 things most people get wrong.' },
  { name: 'Title brain', q: 'Propose 10 titles under 50 characters for a video about "[TOPIC]". Rank the top 3 and explain why each wins the click.' },
  { name: 'Fact-check', q: 'Fact-check this claim — true, partly true, or false — and where sources agree vs contradict. Claim: "[CLAIM]"' },
]

function clock(s: number) {
  const m = Math.floor(s / 60), ss = s % 60
  return `${m}:${String(ss).padStart(2, '0')}`
}
function stageFor(s: number): { icon: 'users' | 'search' | 'gavel'; text: string } {
  if (s < 8)  return { icon: 'users',  text: 'Convening the board…' }
  if (s < 28) return { icon: 'users',  text: 'Panel deliberating in parallel…' }
  if (s < 55) return { icon: 'search', text: 'Cross-checking and pressure-testing…' }
  return { icon: 'gavel', text: 'Judge writing the final verdict…' }
}

export default function FusionView() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [partial, setPartial] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const ctrlRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try { const raw = localStorage.getItem(HISTORY_KEY); if (raw) setMsgs(JSON.parse(raw).slice(-200)) } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-200))) } catch {}
  }, [msgs])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [msgs, partial, elapsed])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return
    setErr(null)
    const next = [...msgs, { role: 'user' as const, text }]
    setMsgs(next); setInput(''); setStreaming(true); setPartial(''); setElapsed(0)
    const start = Date.now()
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250)
    const ctrl = new AbortController(); ctrlRef.current = ctrl
    let acc = '', errMsg: string | null = null
    try {
      const r = await fetch('/api/fusion/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: text, history: next.slice(0, -1) }),
        signal: ctrl.signal,
      })
      if (!r.ok) errMsg = `Server error ${r.status}`
      if (r.body) {
        const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = ''
        while (true) {
          const { value, done } = await reader.read(); if (done) break
          buf += dec.decode(value, { stream: true })
          const lines = buf.split('\n'); buf = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.trim()) continue
            try { const j = JSON.parse(line); if (j.t === 'd') { acc += j.c; setPartial(acc) } else if (j.t === 'error') errMsg = j.m } catch {}
          }
        }
      }
    } catch (e) { if ((e as Error).name !== 'AbortError') errMsg = String(e) }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (acc.trim()) setMsgs(m => [...m, { role: 'assistant', text: acc.trim() }])
    if (errMsg) setErr(acc.trim() ? `Note: ${errMsg}` : errMsg)
    setPartial(''); setStreaming(false)
  }, [input, streaming, msgs])

  function stop() { ctrlRef.current?.abort(); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }; setStreaming(false); setPartial('') }
  function clearChat() { if (confirm('Clear Fusion history?')) { setMsgs([]); try { localStorage.removeItem(HISTORY_KEY) } catch {} } }

  const stg = stageFor(elapsed)

  return (
    <div className="flex flex-col h-full min-h-0 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-9 h-9 rounded-lg grid place-items-center font-bold text-[#1a130a]"
          style={{ background: 'linear-gradient(135deg,#e6c69a,#a87f54)' }}>
          <Network size={16} />
        </div>
        <div>
          <div className="text-[15px] font-semibold leading-none" style={{ color: '#f3ebda' }}>Fusion Boardroom</div>
          <div className="text-[11px] mt-0.5" style={{ color: '#6e6353' }}>Multi-perspective reasoning · Claude panel + judge</div>
        </div>
        {msgs.length > 0 && (
          <button onClick={clearChat} title="Clear" className="ml-auto p-2 rounded-lg border border-[var(--line-soft)] text-[var(--cream-mute)] hover:text-[var(--plum)]">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="panel flex flex-col min-h-0 flex-1 p-0 overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll p-4 space-y-4">
          {msgs.length === 0 && !streaming && (
            <div className="h-full grid place-items-center text-center">
              <div>
                <Sparkles size={24} style={{ color: ACCENT }} className="mx-auto mb-3 opacity-70" />
                <div className="text-[13.5px] font-medium" style={{ color: '#f3ebda' }}>Ask the whole board, not one model.</div>
                <div className="text-[12px] mt-1.5 max-w-xs" style={{ color: '#6e6353' }}>Claude plays Analyst, Critic, Devil's Advocate, Synthesist, then Judge — for decisions where being wrong is expensive.</div>
                <div className="text-[11px] mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--line-soft)]" style={{ color: '#a59783' }}>
                  <Network size={11} style={{ color: ACCENT }} />
                  Full board takes <b className="mx-1" style={{ color: ACCENT }}>15–60s</b> — that's normal.
                </div>
              </div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[82%] rounded-xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap"
                style={m.role === 'user'
                  ? { background: `${ACCENT}1a`, border: `1px solid ${ACCENT}40`, color: '#f3ebda' }
                  : { background: 'var(--bg-card)', border: '1px solid var(--line-soft)', color: '#ddd0bb' }}>
                {m.text}
              </div>
            </div>
          ))}

          {streaming && (
            <div className="flex justify-start">
              <div className="max-w-[88%] w-full rounded-xl px-4 py-3.5" style={{ background: 'var(--bg-card)', border: `1px solid ${ACCENT}40` }}>
                {!partial ? (
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="relative grid place-items-center w-6 h-6 shrink-0">
                        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: `${ACCENT}55` }} />
                        {stg.icon === 'search' ? <Search size={14} style={{ color: ACCENT }} /> : stg.icon === 'gavel' ? <Gavel size={14} style={{ color: ACCENT }} /> : <Users size={14} style={{ color: ACCENT }} />}
                      </span>
                      <span className="text-[13px] font-semibold" style={{ color: '#f3ebda' }}>{stg.text}</span>
                      <span className="ml-auto text-[12px] font-mono tabular-nums" style={{ color: ACCENT }}>{clock(elapsed)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {PANEL.map((p, idx) => (
                        <span key={p} className="text-[10.5px] font-medium px-2 py-1 rounded-full animate-pulse"
                          style={{ color: '#ddd0bb', background: `${ACCENT}14`, border: `1px solid ${ACCENT}33`, animationDelay: `${idx * 0.18}s`, animationDuration: '1.4s' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(243,235,218,0.06)' }}>
                      <div className="h-full rounded-full fusion-shimmer" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`, width: '40%' }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gavel size={13} style={{ color: ACCENT }} />
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>Judge writing the verdict</span>
                      <span className="ml-auto text-[12px] font-mono tabular-nums" style={{ color: '#6e6353' }}>{clock(elapsed)}</span>
                    </div>
                    <div className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: '#ddd0bb' }}>
                      {partial}<span className="fusion-caret">▋</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {err && <div className="text-[12px] rounded-lg px-3 py-2 whitespace-pre-wrap" style={{ color: 'var(--plum)', background: 'rgba(196,96,126,0.08)', border: '1px solid rgba(196,96,126,0.3)' }}>{err}</div>}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5 px-3 pt-3 shrink-0">
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => { if (p.q) setInput(p.q) }}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full border transition hover:border-[var(--gold)]"
              style={{ borderColor: 'var(--line-soft)', color: 'var(--cream-dim)', background: 'transparent' }}>
              {p.name}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 flex items-end gap-2 shrink-0">
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask the board anything where being wrong is expensive…"
            className="flex-1 resize-none rounded-xl px-3 py-2 text-[13.5px] placeholder:text-[var(--cream-mute)] focus:outline-none"
            style={{ background: 'var(--bg-mid)', border: '1px solid var(--line-soft)', color: '#f3ebda' }} />
          {streaming
            ? <button onClick={stop} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-500/20 border border-rose-400/40 text-rose-300"><Square size={14} /> Stop</button>
            : <button onClick={send} disabled={!input.trim()} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-40"
                style={{ background: ACCENT, color: '#1a130a' }}><Send size={14} /> Convene</button>}
        </div>
      </div>
    </div>
  )
}
