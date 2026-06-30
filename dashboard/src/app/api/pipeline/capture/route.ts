import { NextRequest, NextResponse } from 'next/server'
import { readItems, writeItems, type PipelineItem } from '@/lib/pipeline'

export async function POST(req: NextRequest) {
  const { idea } = await req.json()
  if (!idea?.trim()) return NextResponse.json({ ok: false, error: 'No idea provided' }, { status: 400 })

  const slug = `idea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const item: PipelineItem = {
    slug,
    title: idea.slice(0, 80),
    stage: 'inbox',
    idea: idea.trim(),
    created: new Date().toISOString(),
  }

  const items = readItems()
  items.unshift(item)
  writeItems(items)

  return NextResponse.json({ ok: true, slug })
}
