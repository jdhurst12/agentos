import { NextRequest } from 'next/server'
import { getMemory, updateMemory, deleteMemory } from '@/lib/memory'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const entry = getMemory(params.id)
  if (!entry) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(entry)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null)
  const updated = updateMemory(params.id, {
    content: body?.content,
    tags: body?.tags,
    type: body?.type,
  })
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = deleteMemory(params.id)
  if (!ok) return Response.json({ error: 'Not found' }, { status: 404 })
  return new Response(null, { status: 204 })
}
