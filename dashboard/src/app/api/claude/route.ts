import { NextRequest } from 'next/server'
import { spawn } from 'child_process'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { message } = await req.json()

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

      const close = (reason?: string) => {
        if (closed) return
        closed = true
        if (reason) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: reason })}\n\n`))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }

      // Try to spawn the Claude CLI
      let claudeProcess: ReturnType<typeof spawn> | null = null

      try {
        claudeProcess = spawn('claude', ['-p', message, '--output-format', 'stream-json', '--verbose'], {
          env: process.env,
          stdio: ['ignore', 'pipe', 'pipe'],
        })
      } catch {
        close(
          "Claude CLI is not available in this environment. In production, install the Claude Code CLI and ensure it's in your PATH. This interface is ready for integration."
        )
        return
      }

      let buffer = ''

      claudeProcess.stdout?.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf8')
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          try {
            const parsed = JSON.parse(trimmed)

            // Handle stream-json format from claude CLI
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
              )
            } else if (parsed.type === 'message_stop') {
              close()
              return
            } else if (parsed.result) {
              // Non-streaming fallback: full result at once
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: parsed.result })}\n\n`)
              )
            }
          } catch {
            // If not JSON, treat as plain text chunk
            if (trimmed.length > 0 && !trimmed.startsWith('{')) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: trimmed + '\n' })}\n\n`)
              )
            }
          }
        }
      })

      claudeProcess.stderr?.on('data', (chunk: Buffer) => {
        const text = chunk.toString('utf8')
        // Only surface non-debug stderr
        if (text.includes('Error') || text.includes('error')) {
          console.error('[claude-api] stderr:', text)
        }
      })

      claudeProcess.on('error', (err) => {
        console.error('[claude-api] spawn error:', err.message)
        close(
          "Unable to reach Claude CLI. Please ensure 'claude' is installed and authenticated. Run `claude --version` to verify. This dashboard is ready for integration once the CLI is available."
        )
      })

      claudeProcess.on('close', (code) => {
        if (code !== 0 && !closed) {
          close(`Claude process exited with code ${code}. Ensure the CLI is properly configured.`)
        } else {
          close()
        }
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
