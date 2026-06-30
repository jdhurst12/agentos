import { NextRequest, NextResponse } from 'next/server'
import { readItems, writeItems } from '@/lib/pipeline'

export async function POST(req: NextRequest) {
  const { slug, approve } = await req.json()
  const items = readItems()
  const item = items.find(i => i.slug === slug)
  if (!item) return NextResponse.json({ ok: false }, { status: 404 })

  item.stage = approve ? 'building' : 'rejected'
  writeItems(items)

  if (approve) {
    // Flip to shipped after a simulated build delay (fire-and-forget)
    setTimeout(() => {
      const fresh = readItems()
      const it = fresh.find(i => i.slug === slug)
      if (it && it.stage === 'building') { it.stage = 'shipped'; writeItems(fresh) }
    }, 8000)
  }

  return NextResponse.json({ ok: true })
}
