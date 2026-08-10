import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

const OPENCLAW_WS = process.env.OPENCLAW_WS_URL || 'ws://localhost:18789'

export async function POST(req: NextRequest) {
  const { message, sessionKey = 'main' } = await req.json()

  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      let closed = false

      const send = (text: string) => {
        if (closed) return
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
      }

      const close = (reason?: string) => {
        if (closed) return
        closed = true
        if (reason) send(reason)
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }

      // Dynamically import ws so it works in Node.js runtime
      import('ws').then(({ default: WebSocket }) => {
        let ws: InstanceType<typeof WebSocket>

        try {
          ws = new WebSocket(OPENCLAW_WS)
        } catch {
          close('OpenClaw gateway is not available. Start it with `openclaw onboard --install-daemon` and ensure the daemon is running on port 18789.')
          return
        }

        const msgId = randomUUID()
        const idempotencyKey = randomUUID()

        ws.on('open', () => {
          const frame = {
            method: 'chat.send',
            id: msgId,
            params: {
              sessionKey,
              message,
              idempotencyKey,
            },
          }
          ws.send(JSON.stringify(frame))
        })

        ws.on('message', (raw: Buffer) => {
          try {
            const event = JSON.parse(raw.toString('utf8'))

            // AgentEvent frames: { runId, seq, stream, ts, data }
            if (event.stream === 'assistant' && typeof event.data === 'string') {
              send(event.data)
              return
            }

            // Text delta in data object
            if (event.data?.type === 'content_block_delta' && event.data?.delta?.text) {
              send(event.data.delta.text)
              return
            }

            // End-of-turn signal
            if (
              event.data?.type === 'message_stop' ||
              event.stream === 'done' ||
              event.method === 'chat.done'
            ) {
              ws.close()
              close()
              return
            }

            // JSON-RPC result (non-streaming fallback)
            if (event.id === msgId && event.result) {
              if (typeof event.result === 'string') {
                send(event.result)
              } else if (event.result.text) {
                send(event.result.text)
              }
              ws.close()
              close()
            }

            // Error frame
            if (event.error) {
              ws.close()
              close(`OpenClaw error: ${event.error.message ?? JSON.stringify(event.error)}`)
            }
          } catch {
            // ignore non-JSON frames
          }
        })

        ws.on('error', () => {
          close('Unable to connect to OpenClaw daemon. Ensure `openclaw onboard --install-daemon` completed and the daemon is running.')
        })

        ws.on('close', () => {
          close()
        })
      }).catch(() => {
        close('WebSocket module not available. Run `npm install ws` in the dashboard directory.')
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
