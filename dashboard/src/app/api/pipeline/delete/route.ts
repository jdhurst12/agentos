import { NextRequest, NextResponse } from 'next/server'
import { readItems, writeItems } from '@/lib/pipeline'

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  writeItems(readItems().filter(i => i.slug !== slug))
  return NextResponse.json({ ok: true })
}
