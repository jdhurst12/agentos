import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { spawn } from 'child_process'
import { BUILTIN_AGENTS } from '@/lib/agents'

export const runtime = 'nodejs'

// ── SSE helpers ────────────────────────────────────────────────────────────

function makeStream(fn: (send: (t: string) => void, close: () => void) => void) {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      let closed = false
      const send = (text: string) => {
        if (closed) return
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
      }
      const close = () => {
        if (closed) return
        closed = true
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
      try {
        fn(send, close)
      } catch (err) {
        send(`Error: ${String(err)}`)
        close()
      }
    },
  })
}

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
}

// ── Transport: WebSocket (ws:// / wss://) ──────────────────────────────────

async function wsTransport(endpoint: string, message: string, sessionKey: string): Promise<ReadableStream> {
  const { default: WebSocket } = await import('ws')
  return makeStream((send, close) => {
    let ws: InstanceType<typeof WebSocket>
    try {
      ws = new WebSocket(endpoint)
    } catch {
      send(`Cannot connect to ${endpoint}. Is the agent daemon running?`)
      close()
      return
    }

    const msgId = randomUUID()
    const idempotencyKey = randomUUID()

    ws.on('open', () => {
      ws.send(JSON.stringify({ method: 'chat.send', id: msgId, params: { sessionKey, message, idempotencyKey } }))
    })

    ws.on('message', (raw: Buffer) => {
      try {
        const event = JSON.parse(raw.toString('utf8'))
        if (event.stream === 'assistant' && typeof event.data === 'string') { send(event.data); return }
        if (event.data?.type === 'content_block_delta' && event.data?.delta?.text) { send(event.data.delta.text); return }
        if (event.data?.type === 'message_stop' || event.stream === 'done' || event.method === 'chat.done') { ws.close(); close(); return }
        if (event.id === msgId && event.result) {
          send(typeof event.result === 'string' ? event.result : (event.result.text ?? JSON.stringify(event.result)))
          ws.close(); close(); return
        }
        if (event.error) { ws.close(); send(`Agent error: ${event.error.message ?? JSON.stringify(event.error)}`); close() }
      } catch { /* ignore non-JSON */ }
    })

    ws.on('error', () => { send(`Connection to ${endpoint} failed.`); close() })
    ws.on('close', () => close())
  })
}

// ── Transport: HTTP SSE / REST (http:// / https://) ───────────────────────

async function httpTransport(endpoint: string, message: string, agentId: string): Promise<ReadableStream> {
  return makeStream(async (send, close) => {
    let res: Response
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Agent-Id': agentId },
        body: JSON.stringify({ message }),
      })
    } catch (err) {
      send(`Cannot reach ${endpoint}: ${String(err)}`)
      close()
      return
    }

    if (!res.ok) {
      send(`Agent returned HTTP ${res.status}`)
      close()
      return
    }

    const contentType = res.headers.get('content-type') ?? ''

    if (contentType.includes('text/event-stream') && res.body) {
      // Proxy SSE stream
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
          if (raw === '[DONE]') { close(); return }
          try { const { text } = JSON.parse(raw); if (text) send(text) } catch { /* skip */ }
        }
      }
      close()
    } else {
      // Plain JSON response
      const json = await res.json().catch(() => null)
      const text = json?.text ?? json?.message ?? json?.response ?? JSON.stringify(json)
      send(text)
      close()
    }
  })
}

// ── Transport: subprocess (Claude CLI) ────────────────────────────────────

function subprocessTransport(message: string): ReadableStream {
  return makeStream((send, close) => {
    const proc = spawn('claude', ['-p', message, '--output-format', 'stream-json', '--verbose'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let buf = ''
    proc.stdout.on('data', (chunk: Buffer) => {
      buf += chunk.toString('utf8')
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const ev = JSON.parse(line)
          if (ev.type === 'assistant' && Array.isArray(ev.message?.content)) {
            for (const block of ev.message.content) {
              if (block.type === 'text' && block.text) send(block.text)
            }
          } else if (ev.type === 'content_block_delta' && ev.delta?.text) {
            send(ev.delta.text)
          }
        } catch { /* ignore non-JSON */ }
      }
    })
    proc.on('close', () => close())
    proc.on('error', () => { send('Claude CLI is not available. Install claude-code and ensure it is on your PATH.'); close() })
  })
}

// ── Mock transport (no endpoint configured) ────────────────────────────────

const MOCK_REPLIES: Record<string, string[]> = {
  hermes: ['Message routed successfully.', 'Delivery confirmed across all channels.', 'Pipeline flushed — 0 pending messages.'],
  paperclip: ['Autonomous mode engaged. Starting sub-task tree.', 'Agent Zero executing. Memory updated.', 'Task complete. New capability added to registry.'],
  nexus: ['Orchestration graph updated.', 'Spawning sub-agents for parallel execution.', 'All nodes synchronized.'],
  phantom: ['Shadow mode engaged.', 'Trace wiped from logs.', 'Silent extraction complete.'],
  _default: ['Processing your request…', 'Task received. Executing now.', 'Done. Ready for the next directive.'],
}

function mockTransport(agentId: string): ReadableStream {
  const replies = MOCK_REPLIES[agentId] ?? MOCK_REPLIES._default
  const reply = replies[Math.floor(Math.random() * replies.length)]
  return makeStream(async (send, close) => {
    // Simulate typing delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800))
    send(reply)
    close()
  })
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: { params: { agentId: string } }) {
  const { agentId } = params
  const body = await req.json().catch(() => ({}))
  const message: string = body.message ?? ''
  const sessionKey: string = body.sessionKey ?? 'main'

  if (!message.trim()) {
    return new Response(JSON.stringify({ error: 'Empty message' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  // Resolve agent config — builtins + any custom agents passed via body
  const agent = BUILTIN_AGENTS.find(a => a.id === agentId)
  const endpoint: string = body.endpoint ?? agent?.endpoint ?? ''

  let stream: ReadableStream

  if (!endpoint && agentId === 'claude') {
    stream = subprocessTransport(message)
  } else if (endpoint.startsWith('ws://') || endpoint.startsWith('wss://')) {
    stream = await wsTransport(endpoint, message, sessionKey)
  } else if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    stream = await httpTransport(endpoint, message, agentId)
  } else {
    stream = mockTransport(agentId)
  }

  return new Response(stream, { headers: SSE_HEADERS })
}

// ── Health ping ───────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: { params: { agentId: string } }) {
  const { agentId } = params
  const agent = BUILTIN_AGENTS.find(a => a.id === agentId)
  const endpoint = agent?.endpoint ?? ''

  if (!endpoint) {
    // Claude: try spawning with --version
    return new Promise<Response>(resolve => {
      const proc = spawn('claude', ['--version'], { stdio: 'pipe' })
      proc.on('close', code => resolve(Response.json({ online: code === 0 })))
      proc.on('error', () => resolve(Response.json({ online: false })))
    })
  }

  if (endpoint.startsWith('ws://') || endpoint.startsWith('wss://')) {
    const { default: WebSocket } = await import('ws')
    return new Promise<Response>(resolve => {
      const ws = new WebSocket(endpoint)
      const timer = setTimeout(() => { ws.terminate(); resolve(Response.json({ online: false })) }, 2000)
      ws.on('open', () => { clearTimeout(timer); ws.close(); resolve(Response.json({ online: true })) })
      ws.on('error', () => { clearTimeout(timer); resolve(Response.json({ online: false })) })
    })
  }

  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    try {
      const res = await fetch(endpoint + '/health', { signal: AbortSignal.timeout(2000) })
      return Response.json({ online: res.ok })
    } catch {
      return Response.json({ online: false })
    }
  }

  return Response.json({ online: true })
}
