import { NextRequest } from 'next/server'
import { getAllMemories, createMemory, searchMemories } from '@/lib/memory'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId') ?? undefined
  const q = searchParams.get('q')

  const entries = q ? searchMemories(q, agentId) : getAllMemories(agentId)
  return Response.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.content?.trim()) {
    return Response.json({ error: 'content is required' }, { status: 400 })
  }

  const entry = createMemory({
    agentId: body.agentId ?? 'global',
    type: body.type ?? 'note',
    content: body.content.trim(),
    tags: Array.isArray(body.tags) ? body.tags : [],
  })
  return Response.json(entry, { status: 201 })
}
