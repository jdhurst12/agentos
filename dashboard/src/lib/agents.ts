'use client'

export interface AgentConfig {
  id: string
  name: string
  handle: string
  type: string
  status: 'ACTIVE' | 'STANDBY' | 'OFFLINE'
  accent: string
  avatar: string
  endpoint: string
  description: string
  model?: string
  tools?: string[]
  parentId?: string
  isBuiltin?: boolean
  createdAt?: string
}

export const BUILTIN_AGENTS: AgentConfig[] = [
  {
    id: 'claude',
    name: 'Claude',
    handle: 'claude-sonnet-4-6',
    type: 'General AI',
    status: 'ACTIVE',
    accent: '#a855f7',
    avatar: '✦',
    endpoint: '',
    description: 'Primary AI assistant powered by Anthropic Claude',
    model: 'claude-sonnet-4-6',
    tools: ['code', 'analysis', 'writing', 'reasoning'],
    isBuiltin: true,
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    handle: 'research-agent',
    type: 'Research',
    status: 'ACTIVE',
    accent: '#06b6d4',
    avatar: '⌖',
    endpoint: 'ws://localhost:18789',
    description: 'Deep web research and document analysis agent',
    tools: ['web-search', 'document-parse', 'summarize'],
    isBuiltin: true,
  },
  {
    id: 'hermes',
    name: 'Hermes',
    handle: 'messaging-agent',
    type: 'Messaging',
    status: 'ACTIVE',
    accent: '#ec4899',
    avatar: '⚡',
    endpoint: '',
    description: 'Fast messaging and communication routing agent',
    tools: ['send-message', 'route', 'notify'],
    isBuiltin: true,
  },
  {
    id: 'paperclip',
    name: 'Paperclip',
    handle: 'agent-zero',
    type: 'Autonomous',
    status: 'STANDBY',
    accent: '#f59e0b',
    avatar: '◈',
    endpoint: '',
    description: 'Agent Zero — autonomous self-improving agent framework',
    tools: ['code-execute', 'file-ops', 'web', 'memory'],
    isBuiltin: true,
  },
  {
    id: 'nexus',
    name: 'Nexus',
    handle: 'orchestrator',
    type: 'Orchestrator',
    status: 'STANDBY',
    accent: '#10b981',
    avatar: '◉',
    endpoint: '',
    description: 'Multi-agent orchestration and workflow coordination',
    tools: ['spawn-agent', 'coordinate', 'monitor'],
    isBuiltin: true,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    handle: 'stealth-agent',
    type: 'Stealth',
    status: 'OFFLINE',
    accent: '#64748b',
    avatar: '◇',
    endpoint: '',
    description: 'Silent background monitoring and data collection agent',
    tools: ['monitor', 'scrape', 'alert'],
    isBuiltin: true,
  },
]

const STORAGE_KEY = 'agentos_custom_agents'

export function getCustomAgents(): AgentConfig[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveCustomAgent(agent: AgentConfig): void {
  if (typeof window === 'undefined') return
  const existing = getCustomAgents()
  const idx = existing.findIndex(a => a.id === agent.id)
  if (idx >= 0) existing[idx] = agent
  else existing.push(agent)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export function deleteCustomAgent(id: string): void {
  if (typeof window === 'undefined') return
  const existing = getCustomAgents().filter(a => a.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export function getAllAgents(): AgentConfig[] {
  return [...BUILTIN_AGENTS, ...getCustomAgents()]
}

export function generateId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 6)
}

export const AGENT_TYPES = [
  'General AI', 'Research', 'Messaging', 'Autonomous', 'Orchestrator',
  'Stealth', 'Data', 'Code', 'Creative', 'Analysis', 'Monitor', 'Custom',
]

export const ACCENT_PRESETS = [
  '#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#8b5cf6', '#f97316', '#14b8a6',
]

export const AVATAR_PRESETS = ['✦', '⌖', '⚡', '◈', '◉', '◇', '⬡', '⬢', '✿', '⊕', '⊗', '⊙', '△', '▽', '⬟']
