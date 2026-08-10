import { existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { getConfig } from './config'
import type { MemoryEntry } from './memory'

function resolveVaultDir(): string {
  const raw = getConfig().obsidian.vaultDir
  return raw.startsWith('~') ? raw.replace('~', process.env.HOME ?? '') : raw
}

function memoryDir(agentId: string): string {
  return join(resolveVaultDir(), 'Memory', agentId)
}

function noteContent(entry: MemoryEntry, agentLabel: string): string {
  const tags = entry.tags.length ? entry.tags.map(t => `#${t}`).join(' ') : ''
  const frontmatter = [
    '---',
    `id: ${entry.id}`,
    `agent: ${agentLabel}`,
    `type: ${entry.type}`,
    `tags: [${entry.tags.join(', ')}]`,
    `created: ${entry.createdAt}`,
    `updated: ${entry.updatedAt}`,
    '---',
    '',
  ].join('\n')

  return `${frontmatter}${entry.content}\n${tags ? `\n${tags}\n` : ''}`
}

export function syncMemoryToObsidian(entry: MemoryEntry, agentLabel: string): void {
  try {
    const cfg = getConfig().obsidian
    if (!cfg.syncEnabled) return

    const dir = memoryDir(entry.agentId)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    const notePath = join(dir, `${entry.id}.md`)
    writeFileSync(notePath, noteContent(entry, agentLabel), 'utf8')
  } catch {
    // Vault may not be accessible in this environment; silently skip
  }
}

export function deleteMemoryFromObsidian(id: string, agentId: string): void {
  try {
    const cfg = getConfig().obsidian
    if (!cfg.syncEnabled) return

    const notePath = join(memoryDir(agentId), `${id}.md`)
    if (existsSync(notePath)) unlinkSync(notePath)
  } catch {
    // Silently skip
  }
}

export interface ObsidianNote {
  filename: string
  title: string
  content: string
  mtime: number
}

export function readObsidianNotes(subfolder = ''): ObsidianNote[] {
  try {
    const base = subfolder
      ? join(resolveVaultDir(), subfolder)
      : resolveVaultDir()

    if (!existsSync(base)) return []

    return readdirSync(base)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const full = join(base, f)
        const raw = readFileSync(full, 'utf8')
        const { mtimeMs } = require('fs').statSync(full)
        const titleLine = raw.split('\n').find(l => l.startsWith('# '))
        return {
          filename: f.replace('.md', ''),
          title: titleLine ? titleLine.slice(2).trim() : f.replace('.md', ''),
          content: raw,
          mtime: mtimeMs,
        }
      })
      .sort((a, b) => b.mtime - a.mtime)
  } catch {
    return []
  }
}
