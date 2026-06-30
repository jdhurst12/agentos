import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const DIR = join(homedir(), '.agentos')
const FILE = join(DIR, 'fusion-history.json')

export async function GET() {
  try {
    if (!existsSync(FILE)) return NextResponse.json({ msgs: [] })
    return NextResponse.json(JSON.parse(readFileSync(FILE, 'utf8')))
  } catch {
    return NextResponse.json({ msgs: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { msgs } = await req.json()
    if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true })
    writeFileSync(FILE, JSON.stringify({ msgs: (msgs ?? []).slice(-200) }, null, 2))
  } catch {}
  return NextResponse.json({ ok: true })
}
