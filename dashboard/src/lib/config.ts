import { readFileSync, existsSync } from 'fs'
import path from 'path'

export interface AgentConfig {
  id: string
  name: string
  type: string
  status: 'ACTIVE' | 'STANDBY' | 'OFFLINE'
  color: string
  accent: string
  avatar: string
  endpoint: string
  description: string
}

export interface AgentOSConfig {
  claude: {
    model: string
    cliPath: string
    apiKey?: string
  }
  agents: AgentConfig[]
  obsidian: {
    vaultDir: string
    syncEnabled: boolean
    autoSaveOnStop: boolean
  }
  dashboard: {
    port: number
    title: string
    ownerName: string
  }
}

const DEFAULT_CONFIG: AgentOSConfig = {
  claude: { model: 'claude-sonnet-4-6', cliPath: 'claude' },
  agents: [
    { id: 'openclaw', name: 'OpenClaw', type: 'Research', status: 'ACTIVE', color: 'cyan', accent: '#06b6d4', avatar: '⌖', endpoint: '', description: 'Web research and document analysis' },
    { id: 'hermes', name: 'Hermes', type: 'Messaging', status: 'ACTIVE', color: 'pink', accent: '#ec4899', avatar: '⚡', endpoint: '', description: 'Multi-channel messaging and delivery' },
    { id: 'nexus', name: 'Nexus', type: 'Orchestrator', status: 'STANDBY', color: 'amber', accent: '#f59e0b', avatar: '◈', endpoint: '', description: 'Multi-agent orchestration' },
    { id: 'phantom', name: 'Phantom', type: 'Stealth', status: 'OFFLINE', color: 'slate', accent: '#64748b', avatar: '◇', endpoint: '', description: 'Stealth operations' },
  ],
  obsidian: { vaultDir: '/Users/jd/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Vaults/2nd Brain | AI/Agent OS', syncEnabled: true, autoSaveOnStop: true },
  dashboard: { port: 3333, title: 'AgentOS Mission Control', ownerName: 'Agent' },
}

function loadConfig(): AgentOSConfig {
  const configPath = path.resolve(process.cwd(), 'agentos.config.json')
  if (!existsSync(configPath)) return DEFAULT_CONFIG
  try {
    const raw = readFileSync(configPath, 'utf8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

// Cache at module level (server-side singleton)
let _config: AgentOSConfig | null = null
export function getConfig(): AgentOSConfig {
  if (!_config) _config = loadConfig()
  return _config
}
