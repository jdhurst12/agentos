import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

function tryClaudeVersion(): { ok: boolean; version: string; latencyMs: number } {
  const t = Date.now()
  try {
    const out = execSync('claude --version 2>&1', { timeout: 4000 }).toString().trim()
    return { ok: true, version: out.split('\n')[0] || 'claude', latencyMs: Date.now() - t }
  } catch {
    return { ok: false, version: 'unavailable', latencyMs: Date.now() - t }
  }
}

async function tryOpenClaw(): Promise<{ ok: boolean; gateway: string; degraded: boolean; agents: string[]; sessions: number; latencyMs: number }> {
  const t = Date.now()
  try {
    const c = await fetch('http://localhost:18789/health', { signal: AbortSignal.timeout(2000) })
    const j = await c.json().catch(() => ({}))
    return { ok: c.ok, gateway: 'ws://localhost:18789', degraded: !c.ok, agents: j.agents ?? [], sessions: j.sessions ?? 0, latencyMs: Date.now() - t }
  } catch {
    return { ok: false, gateway: 'ws://localhost:18789', degraded: false, agents: [], sessions: 0, latencyMs: Date.now() - t }
  }
}

async function tryHermes(): Promise<{ ok: boolean; model: string; provider: string; latencyMs: number }> {
  const t = Date.now()
  try {
    const c = await fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(2000) })
    const j = await c.json().catch(() => ({}))
    return { ok: c.ok, model: j.model ?? 'hermes', provider: j.provider ?? 'local', latencyMs: Date.now() - t }
  } catch {
    return { ok: false, model: 'offline', provider: '—', latencyMs: Date.now() - t }
  }
}

let cached: { data: unknown; at: number } | null = null

export async function GET() {
  if (cached && Date.now() - cached.at < 5000) {
    return NextResponse.json(cached.data)
  }

  const [openclaw, hermes] = await Promise.all([tryOpenClaw(), tryHermes()])
  const claude = tryClaudeVersion()

  const data = { ts: Date.now(), claude, openclaw, hermes }
  cached = { data, at: Date.now() }
  return NextResponse.json(data)
}
