import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { randomUUID } from 'crypto'
import { syncMemoryToObsidian, deleteMemoryFromObsidian } from './obsidian'

export type MemoryType = 'fact' | 'conversation' | 'preference' | 'task' | 'note'

export interface MemoryEntry {
  id: string
  agentId: string
  type: MemoryType
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const MEMORY_DIR = join(homedir(), '.agentos')
const MEMORY_FILE = join(MEMORY_DIR, 'memory.json')

function load(): MemoryEntry[] {
  if (!existsSync(MEMORY_FILE)) return []
  try {
    return JSON.parse(readFileSync(MEMORY_FILE, 'utf8'))
  } catch {
    return []
  }
}

function save(entries: MemoryEntry[]): void {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })
  writeFileSync(MEMORY_FILE, JSON.stringify(entries, null, 2), 'utf8')
}

export function getAllMemories(agentId?: string): MemoryEntry[] {
  const entries = load()
  if (!agentId || agentId === 'all') return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return entries.filter(e => e.agentId === agentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getMemory(id: string): MemoryEntry | null {
  return load().find(e => e.id === id) ?? null
}

export function createMemory(data: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): MemoryEntry {
  const entries = load()
  const entry: MemoryEntry = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  save([...entries, entry])
  syncMemoryToObsidian(entry, data.agentId)
  return entry
}

export function updateMemory(id: string, data: Partial<Pick<MemoryEntry, 'content' | 'tags' | 'type'>>): MemoryEntry | null {
  const entries = load()
  const idx = entries.findIndex(e => e.id === id)
  if (idx === -1) return null
  entries[idx] = { ...entries[idx], ...data, updatedAt: new Date().toISOString() }
  save(entries)
  syncMemoryToObsidian(entries[idx], entries[idx].agentId)
  return entries[idx]
}

export function deleteMemory(id: string): boolean {
  const entries = load()
  const entry = entries.find(e => e.id === id)
  const filtered = entries.filter(e => e.id !== id)
  if (filtered.length === entries.length) return false
  save(filtered)
  if (entry) deleteMemoryFromObsidian(id, entry.agentId)
  return true
}

export function searchMemories(query: string, agentId?: string): MemoryEntry[] {
  const entries = getAllMemories(agentId)
  const q = query.toLowerCase()
  return entries.filter(e =>
    e.content.toLowerCase().includes(q) ||
    e.tags.some(t => t.toLowerCase().includes(q))
  )
}
