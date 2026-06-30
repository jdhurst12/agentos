import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const VAULT_DIR = process.env.OBSIDIAN_VAULT_DIR
  ?? path.join(process.env.HOME ?? '/tmp', 'agentos', 'obsidian-sync', 'Agent Memory')

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

async function ensureDir(dir: string) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type } = body

  await ensureDir(VAULT_DIR)

  if (type === 'journal') {
    const date: string = body.date ?? todayStr()
    const content: string = body.content ?? ''
    const filePath = path.join(VAULT_DIR, `${date}.md`)

    const header = `# Journal · ${date}\n\n`
    await writeFile(filePath, header + content, 'utf8')

    return NextResponse.json({ ok: true, message: `Saved to ${date}.md` })
  }

  if (type === 'goals') {
    const goals: { text: string; done: boolean; priority: string }[] = body.goals ?? []
    const date = todayStr()
    const filePath = path.join(VAULT_DIR, `${date}.md`)

    // Read existing file or start fresh header
    let existing = ''
    try { existing = await readFile(filePath, 'utf8') } catch { /* new file */ }

    // Remove previous goals section if present
    const MARKER = '\n## Goals\n'
    const idx = existing.indexOf(MARKER)
    const base = idx >= 0 ? existing.slice(0, idx) : existing || `# Agent Memory · ${date}\n`

    const priorities: Record<string, string> = { high: '🔴', medium: '🟡', low: '🔵' }
    const lines = goals.map(g =>
      `- [${g.done ? 'x' : ' '}] ${priorities[g.priority] ?? ''} ${g.text}`
    )

    const goalsSection = `${MARKER}*Saved at ${nowTime()}*\n\n${lines.join('\n')}\n`
    await writeFile(filePath, base + goalsSection, 'utf8')

    return NextResponse.json({ ok: true, message: `Saved ${goals.length} goals` })
  }

  return NextResponse.json({ ok: false, message: 'Unknown type' }, { status: 400 })
}
