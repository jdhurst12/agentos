import { NextRequest } from 'next/server'
import { execFileSync } from 'child_process'
import { getConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

const SYSTEM = `You are a Fusion Boardroom. When given a question or decision, you MUST respond in exactly this format:

---ANALYST---
[Thorough, evidence-based analysis. What do the facts say?]

---CRITIC---
[Identify the weakest assumptions and biggest risks in the Analyst's view]

---DEVIL'S ADVOCATE---
[Argue the strongest opposite position with full conviction]

---SYNTHESIST---
[Integrate the best insights from all perspectives]

---JUDGE'S VERDICT---
[Final synthesis: concrete recommendation, key caveats, the one thing that matters most]

Be rigorous. Do not hedge excessively. Each role must genuinely challenge the others.`

export async function POST(req: NextRequest) {
  const { prompt, history = [] } = await req.json()

  const cfg = getConfig().claude
  const apiKey = cfg.apiKey || process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ t: 'error', m: 'No ANTHROPIC_API_KEY configured. Add it to agentos.config.json or set the env var.' }) + '\n',
      { status: 200, headers: { 'Content-Type': 'application/x-ndjson' } }
    )
  }

  const messages = [
    ...history.map((m: { role: string; text: string }) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
    { role: 'user', content: prompt },
  ]

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: cfg.model || 'claude-sonnet-4-6',
            max_tokens: 4096,
            system: SYSTEM,
            messages,
            stream: true,
          }),
        })

        if (!res.ok || !res.body) {
          const body = await res.text().catch(() => '')
          controller.enqueue(encoder.encode(JSON.stringify({ t: 'error', m: `Anthropic API error ${res.status}: ${body}` }) + '\n'))
          controller.close()
          return
        }

        const reader = res.body.getReader()
        const dec = new TextDecoder()
        let buf = ''
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buf += dec.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const j = JSON.parse(data)
              if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta') {
                controller.enqueue(encoder.encode(JSON.stringify({ t: 'd', c: j.delta.text }) + '\n'))
              }
            } catch {}
          }
        }
      } catch (e) {
        controller.enqueue(encoder.encode(JSON.stringify({ t: 'error', m: String(e) }) + '\n'))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
