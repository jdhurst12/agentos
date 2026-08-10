# AgentOS Mission Control — Setup & Usage Guide

A local-first, dopamine-inducing dashboard for managing Claude and your AI agent fleet.
Built on **Next.js 14 · Tailwind CSS · Framer Motion**.

---

## What it is

AgentOS Mission Control is a beautiful dark-mode web OS that runs locally on your machine.
It gives you:

- A **live chat interface** connected to Claude via the Claude Code CLI
- A **fleet overview** for your other AI agents (OpenClaw, Hermes, Nexus, Phantom — or your own)
- A **Goals page** with prioritised checkbox tasks and voice input
- A **Journal page** with a day-by-day markdown editor and voice dictation
- **Obsidian auto-sync** — every session, goal list, and journal entry saves to your vault

---

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | `node --version` |
| Claude Code CLI | latest | `npm i -g @anthropic-ai/claude-code` |
| A Claude Pro/Max account | — | for CLI auth |

---

## Quick start (3 steps)

```bash
# 1. Clone and enter the dashboard
git clone https://github.com/jdhurst12/agentos.git
cd agentos/dashboard

# 2. Install dependencies
npm install

# 3. Run the setup wizard
node setup.mjs
```

The wizard asks you:
- Your Claude CLI path and preferred model
- Which agents to include and whether they have real API endpoints
- Your Obsidian vault path
- Dashboard port and your name

It writes **`agentos.config.json`** (gitignored — your private config).

Then:
```bash
npm run dev
```

Open **http://localhost:3333** in your browser.

---

## Directory layout

```
dashboard/
├── setup.mjs                  ← interactive setup wizard
├── agentos.config.example.json ← template (commit this)
├── agentos.config.json         ← your config (gitignored)
├── src/
│   ├── app/
│   │   ├── page.tsx            ← main layout + routing
│   │   ├── globals.css         ← dark theme, glow classes, animations
│   │   └── api/
│   │       ├── claude/         ← SSE bridge to claude CLI
│   │       ├── obsidian/       ← writes markdown to vault
│   │       └── config/         ← serves config to client
│   ├── components/
│   │   ├── Sidebar.tsx         ← navigation
│   │   ├── ClaudePanel.tsx     ← Claude chat
│   │   ├── AgentChatPanel.tsx  ← per-agent chat
│   │   ├── AgentFleet.tsx      ← fleet overview cards
│   │   ├── ActivityLog.tsx     ← live event feed
│   │   ├── GoalsPage.tsx       ← tasks with voice input
│   │   ├── JournalPage.tsx     ← daily journal + voice dictation
│   │   ├── Header.tsx          ← top bar with live clock
│   │   └── MetricsBar.tsx      ← animated system stats
│   └── lib/
│       ├── config.ts           ← config loader (server-side)
│       └── hooks/
│           ├── useClock.ts
│           └── useAnimatedNumber.ts
```

---

## Configuration reference

`agentos.config.json` controls everything. Start from the example:

```bash
cp agentos.config.example.json agentos.config.json
```

### `claude`

```json
"claude": {
  "model": "claude-sonnet-4-6",
  "cliPath": "claude"
}
```

- **`cliPath`** — full path to the CLI if it's not in your `$PATH`, e.g. `/usr/local/bin/claude`
- **`model`** — any Claude model identifier

### `agents`

Each agent entry:

```json
{
  "id": "openclaw",
  "name": "OpenClaw",
  "type": "Research",
  "status": "ACTIVE",
  "color": "cyan",
  "accent": "#06b6d4",
  "avatar": "⌖",
  "endpoint": "http://localhost:4001",
  "description": "Web research agent"
}
```

- **`status`** — `"ACTIVE"` | `"STANDBY"` | `"OFFLINE"`
- **`endpoint`** — leave blank for mock mode; set to your agent's HTTP API for real integration
- **`accent`** — any hex color, controls glow and chat bubble color
- **`avatar`** — any single character or emoji

### `obsidian`

```json
"obsidian": {
  "vaultDir": "~/Obsidian/Vaults/Agent Memory/Agent Memory",
  "syncEnabled": true,
  "autoSaveOnStop": true
}
```

### `dashboard`

```json
"dashboard": {
  "port": 3333,
  "title": "AgentOS Mission Control",
  "ownerName": "Your Name"
}
```

---

## Obsidian sync

### How it works

**Automatic (on session stop):**
The Claude Code stop hook (`~/.claude/save-to-obsidian.py`) reads your session transcript and appends a formatted markdown block to today's file:

```
~/Obsidian/Vaults/Agent Memory/Agent Memory/2026-06-20.md
```

**Manual (from the dashboard):**
- **Goals page** → "Save to Obsidian" button writes your task list as GFM checkboxes
- **Journal page** → "Save to Obsidian" button writes the full markdown content

### File format

Each day's file looks like:

```markdown
# Agent Memory · 2026-06-20

*Auto-saved from Claude Code sessions*

---

## Claude Session · 14:32
*Project: `/path/to/project`*

**You:** What's the status of the fleet?

**Claude:** Fleet Status Report...

## Goals

*Saved at 14:35*

- [x] 🔴 Ship the dashboard
- [ ] 🟡 Configure OpenClaw endpoint
- [ ] 🔵 Deploy Hermes

## Journal · 2026-06-20

Today was productive...
```

### Obsidian setup

1. Open Obsidian → Settings → Files & Links
2. Set **Default location for new notes** to your `Agent Memory` folder
3. (Optional) Install the **Dataview** plugin to query across daily files

---

## Adding a real agent

To connect a real agent instead of using mock replies:

1. Add the agent's URL to `agentos.config.json`:
   ```json
   { "id": "myagent", "endpoint": "http://localhost:5001", ... }
   ```

2. Your agent needs to handle POST requests at `/chat`:
   ```
   POST /chat
   Body: { "message": "user input" }
   Response: { "reply": "agent response" }
   ```
   Or stream SSE at `/chat/stream` in the same `data: {"text":"..."}` format.

3. Restart the dashboard — the panel will use the real endpoint.

---

## Voice input

Both **Goals** and **Journal** use the browser's Web Speech API (no API key needed).
- Supported in Chrome, Edge, Safari 15+
- Not available in Firefox (no implementation)
- Click the mic button to start; click again to stop
- Journal uses **continuous** mode — it keeps transcribing until you stop

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message to Claude |
| `Shift + Enter` | New line in Claude input |
| `Enter` | Add goal (in Goals input) |

---

## Production deployment

The dashboard is intentionally **local-first**. If you want it on a server:

```bash
npm run build
npm start
```

Add a reverse proxy (nginx/Caddy) with auth if exposing to the internet.

**Never expose the dashboard publicly without auth** — it has direct access to your Claude CLI.

---

## Troubleshooting

**Claude panel shows "offline mode"**
- Run `claude --version` in your terminal to verify the CLI is installed
- Check `agentos.config.json` → `claude.cliPath` points to the right binary
- Ensure you're authenticated: `claude auth`

**Obsidian sync isn't saving**
- Verify the vault path in config matches your actual Obsidian vault
- Check the stop hook is registered: `cat ~/.claude/settings.json`
- Run `python3 ~/.claude/save-to-obsidian.py` manually to test

**Port 3333 is in use**
- Change `dashboard.port` in `agentos.config.json`
- Update `package.json` `"dev"` script port to match

**Voice input not working**
- Requires HTTPS or localhost — won't work on non-localhost HTTP
- Grant microphone permission when the browser asks
- Firefox doesn't support Web Speech API — use Chrome or Safari

---

## Tech stack

| Layer | Library |
|-------|---------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| Claude bridge | Claude Code CLI via `child_process.spawn` + SSE |
| Voice input | Web Speech API (browser-native, no key needed) |
| Markdown storage | Node.js `fs` → local files |

---

*Built with Claude Code · Apache 2.0*
