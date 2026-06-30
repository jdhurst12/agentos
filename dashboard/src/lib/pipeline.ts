import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const DIR = join(homedir(), '.agentos')
const FILE = join(DIR, 'pipeline.json')

export interface PipelineItem {
  slug: string
  title: string
  stage: 'inbox' | 'review' | 'building' | 'shipped' | 'rejected'
  confidence?: number
  tags?: string[]
  created: string
  idea: string
  classification?: string
  plan?: string
  pinned?: boolean
}

export function readItems(): PipelineItem[] {
  try {
    if (!existsSync(FILE)) return []
    return JSON.parse(readFileSync(FILE, 'utf8'))
  } catch { return [] }
}

export function writeItems(items: PipelineItem[]) {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true })
  writeFileSync(FILE, JSON.stringify(items, null, 2))
}
