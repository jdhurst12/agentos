import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cfg = getConfig()
  // Only expose non-sensitive fields to the client
  return NextResponse.json({
    agents: cfg.agents,
    dashboard: cfg.dashboard,
    claude: { model: cfg.claude.model },
    obsidian: { syncEnabled: cfg.obsidian.syncEnabled },
  })
}
