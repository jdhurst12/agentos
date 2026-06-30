import { NextResponse } from 'next/server'
import { readObsidianNotes } from '@/lib/obsidian'
import { getConfig } from '@/lib/config'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const subfolder = searchParams.get('subfolder') ?? ''
  const notes = readObsidianNotes(subfolder)
  const cfg = getConfig().obsidian
  return NextResponse.json({ vaultDir: cfg.vaultDir, syncEnabled: cfg.syncEnabled, notes })
}
