#!/usr/bin/env node
/**
 * AgentOS Mission Control — Interactive Setup Wizard
 * Run: node setup.mjs
 */

import { createInterface } from 'readline'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { execSync } from 'child_process'
import { homedir } from 'os'
import path from 'path'

const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const VIOLET = '\x1b[35m'
const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

const rl = createInterface({ input: process.stdin, output: process.stdout })

function ask(question, defaultVal = '') {
  return new Promise(resolve => {
    const hint = defaultVal ? ` ${DIM}[${defaultVal}]${RESET}` : ''
    rl.question(`${CYAN}?${RESET} ${question}${hint}: `, answer => {
      resolve(answer.trim() || defaultVal)
    })
  })
}

function askYN(question, defaultVal = true) {
  return new Promise(resolve => {
    const hint = defaultVal ? 'Y/n' : 'y/N'
    rl.question(`${CYAN}?${RESET} ${question} ${DIM}[${hint}]${RESET}: `, answer => {
      const a = answer.trim().toLowerCase()
      resolve(a === '' ? defaultVal : a === 'y' || a === 'yes')
    })
  })
}

function print(msg) { process.stdout.write(msg + '\n') }
function hr() { print(`${DIM}${'─'.repeat(60)}${RESET}`) }
function ok(msg) { print(`${GREEN}✓${RESET} ${msg}`) }
function warn(msg) { print(`${YELLOW}⚠${RESET}  ${msg}`) }
function err(msg) { print(`${RED}✗${RESET} ${msg}`) }
function section(msg) { print(`\n${VIOLET}${BOLD}◈ ${msg}${RESET}`) }

function checkCLI(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function expandHome(p) {
  return p.startsWith('~/') ? path.join(homedir(), p.slice(2)) : p
}

async function main() {
  console.clear()
  print('')
  print(`${VIOLET}${BOLD}  ╔═══════════════════════════════════════╗${RESET}`)
  print(`${VIOLET}${BOLD}  ║   AGENTOS MISSION CONTROL — SETUP     ║${RESET}`)
  print(`${VIOLET}${BOLD}  ╚═══════════════════════════════════════╝${RESET}`)
  print('')
  print(`  Welcome! This wizard creates your ${CYAN}agentos.config.json${RESET}.`)
  print(`  Takes about 2 minutes. Press ${DIM}Enter${RESET} to accept defaults.`)
  print('')
  hr()

  const config = {
    claude: {},
    agents: [],
    obsidian: {},
    dashboard: {},
  }

  // ── Claude ───────────────────────────────────────────────────────────────
  section('Claude Configuration')
  print('')

  const claudeInstalled = checkCLI('claude')
  if (claudeInstalled) {
    ok('Claude CLI detected')
  } else {
    warn('Claude CLI not found. Install from https://claude.ai/download')
    print(`  The dashboard will show an offline message until it\'s installed.`)
  }

  config.claude.cliPath = await ask('Claude CLI path', 'claude')
  config.claude.model = await ask('Model', 'claude-sonnet-4-6')

  // ── Dashboard ────────────────────────────────────────────────────────────
  section('Dashboard Settings')
  print('')

  config.dashboard.port = parseInt(await ask('Port', '3333'), 10)
  config.dashboard.title = await ask('Dashboard title', 'AgentOS Mission Control')
  config.dashboard.ownerName = await ask('Your name (shown in UI)', 'Agent')

  // ── Agents ───────────────────────────────────────────────────────────────
  section('Agent Fleet')
  print('')
  print('  Configure your agents. Leave endpoint blank to use mock mode.')
  print('')

  const defaultAgents = [
    { id: 'openclaw', name: 'OpenClaw', type: 'Research', status: 'ACTIVE', color: 'cyan', accent: '#06b6d4', avatar: '⌖', description: 'Web research and document analysis' },
    { id: 'hermes', name: 'Hermes', type: 'Messaging', status: 'ACTIVE', color: 'pink', accent: '#ec4899', avatar: '⚡', description: 'Multi-channel messaging and delivery' },
    { id: 'nexus', name: 'Nexus', type: 'Orchestrator', status: 'STANDBY', color: 'amber', accent: '#f59e0b', avatar: '◈', description: 'Multi-agent orchestration' },
    { id: 'phantom', name: 'Phantom', type: 'Stealth', status: 'OFFLINE', color: 'slate', accent: '#64748b', avatar: '◇', description: 'Stealth operations' },
  ]

  for (const agent of defaultAgents) {
    const include = await askYN(`Include ${BOLD}${agent.name}${RESET} (${agent.type})?`, true)
    if (!include) continue

    const endpoint = await ask(`  ${agent.name} API endpoint (blank = mock mode)`, '')
    config.agents.push({ ...agent, endpoint })
    ok(`${agent.name} added${endpoint ? ` → ${endpoint}` : ' (mock mode)'}`)
  }

  const addCustom = await askYN('\nAdd a custom agent?', false)
  if (addCustom) {
    const name = await ask('  Agent name', 'MyAgent')
    const type = await ask('  Agent type', 'Custom')
    const endpoint = await ask('  API endpoint', '')
    config.agents.push({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      type,
      status: 'ACTIVE',
      color: 'violet',
      accent: '#a855f7',
      avatar: '✦',
      endpoint,
      description: `${type} agent`,
    })
    ok(`${name} added`)
  }

  // ── Obsidian ─────────────────────────────────────────────────────────────
  section('Obsidian Vault Sync')
  print('')

  const obsidianEnabled = await askYN('Enable Obsidian sync?', true)
  if (obsidianEnabled) {
    const defaultVault = '~/Obsidian/Vaults/Agent Memory/Agent Memory'
    const vaultDir = await ask('Vault directory', defaultVault)
    const expanded = expandHome(vaultDir)

    try {
      mkdirSync(expanded, { recursive: true })
      ok(`Vault directory ready: ${expanded}`)
    } catch {
      warn(`Could not create ${expanded} — create it manually`)
    }

    config.obsidian = {
      vaultDir,
      syncEnabled: true,
      autoSaveOnStop: await askYN('Auto-save sessions to vault on stop?', true),
    }
  } else {
    config.obsidian = { vaultDir: '', syncEnabled: false, autoSaveOnStop: false }
  }

  // ── Write config ─────────────────────────────────────────────────────────
  print('')
  hr()
  section('Saving Configuration')
  print('')

  const configPath = new URL('./agentos.config.json', import.meta.url).pathname
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
  ok(`Wrote ${configPath}`)

  // Update obsidian sync script with new vault path
  if (config.obsidian.syncEnabled && config.obsidian.vaultDir) {
    const hookPath = path.join(homedir(), '.claude', 'save-to-obsidian.py')
    if (existsSync(hookPath)) {
      let hookSrc = readFileSync(hookPath, 'utf8')
      const expanded = expandHome(config.obsidian.vaultDir)
      hookSrc = hookSrc.replace(
        /VAULT_DIR\s*=.*$/m,
        `VAULT_DIR = Path("${expanded}")`
      )
      writeFileSync(hookPath, hookSrc)
      ok('Updated Obsidian hook with vault path')
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  print('')
  hr()
  print('')
  print(`${GREEN}${BOLD}  Setup complete!${RESET}`)
  print('')
  print(`  ${BOLD}Start the dashboard:${RESET}`)
  print(`    ${CYAN}npm run dev${RESET}   → opens at http://localhost:${config.dashboard.port}`)
  print('')
  print(`  ${BOLD}Agents configured:${RESET} ${config.agents.map(a => a.name).join(', ')}`)
  if (config.obsidian.syncEnabled) {
    print(`  ${BOLD}Obsidian vault:${RESET}   ${config.obsidian.vaultDir}`)
  }
  print('')
  print(`  ${DIM}Edit agentos.config.json anytime to change settings.${RESET}`)
  print(`  ${DIM}It\'s gitignored — your keys and paths stay private.${RESET}`)
  print('')

  rl.close()
}

main().catch(e => { console.error(e); process.exit(1) })
