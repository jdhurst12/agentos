import { NextRequest, NextResponse } from 'next/server'
import { readItems, writeItems } from '@/lib/pipeline'

export async function POST(req: NextRequest) {
  const { slug, pinned } = await req.json()
  const items = readItems()
  const item = items.find(i => i.slug === slug)
  if (item) { item.pinned = !!pinned; writeItems(items) }
  return NextResponse.json({ ok: true })
}
