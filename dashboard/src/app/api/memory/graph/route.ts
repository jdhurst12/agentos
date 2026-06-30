import { NextResponse } from 'next/server'
import { readdirSync, readFileSync, statSync, existsSync } from 'fs'
import { join, relative, basename, dirname } from 'path'
import { getConfig } from '@/lib/config'

interface RawNode { id: string; title: string; group: string; degree: number; mtime: number }
interface RawLink { source: string; target: string }

function walkMd(dir: string, root: string, out: { path: string; rel: string; mtime: number }[]) {
  if (!existsSync(dir)) return
  try {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f)
      try {
        const st = statSync(full)
        if (st.isDirectory()) { walkMd(full, root, out); continue }
        if (f.endsWith('.md')) out.push({ path: full, rel: relative(root, full), mtime: st.mtimeMs })
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
}

export async function GET() {
  const cfg = getConfig().obsidian
  const vaultDir = cfg.vaultDir.startsWith('~')
    ? cfg.vaultDir.replace('~', process.env.HOME ?? '')
    : cfg.vaultDir

  const files: { path: string; rel: string; mtime: number }[] = []
  walkMd(vaultDir, vaultDir, files)

  if (files.length === 0) {
    return NextResponse.json({ nodes: [], links: [] })
  }

  // Build node map
  const nodeMap = new Map<string, RawNode>()
  for (const f of files) {
    const id = f.rel.replace(/\.md$/, '')
    const title = basename(f.rel, '.md')
    const group = dirname(f.rel).split('/')[0] || 'root'
    nodeMap.set(id, { id, title, group, degree: 0, mtime: f.mtime })
  }

  // Parse wikilinks [[Note Title]] from content
  const links: RawLink[] = []
  const titleToId = new Map<string, string>()
  Array.from(nodeMap.entries()).forEach(([id, node]) => titleToId.set(node.title.toLowerCase(), id))

  for (const f of files) {
    const src = f.rel.replace(/\.md$/, '')
    try {
      const content = readFileSync(f.path, 'utf8')
      const matches = Array.from(content.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g))
      for (const m of matches) {
        const target = titleToId.get(m[1].trim().toLowerCase())
        if (target && target !== src) {
          links.push({ source: src, target })
          const sNode = nodeMap.get(src)
          const tNode = nodeMap.get(target)
          if (sNode) sNode.degree++
          if (tNode) tNode.degree++
        }
      }
    } catch { /* skip */ }
  }

  return NextResponse.json({ nodes: Array.from(nodeMap.values()), links })
}
