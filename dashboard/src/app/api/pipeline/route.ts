import { NextResponse } from 'next/server'
import { readItems } from '@/lib/pipeline'

export async function GET() {
  return NextResponse.json({ items: readItems() })
}
