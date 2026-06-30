'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ZoomIn, ZoomOut, Maximize2, Edit2, Trash2 } from 'lucide-react'
import { AgentConfig, getAllAgents, deleteCustomAgent } from '@/lib/agents'
import clsx from 'clsx'

interface Props {
  onCreateAgent: () => void
  onEditAgent: (agent: AgentConfig) => void
  refreshKey: number
}

interface TreeNode {
  agent: AgentConfig
  children: TreeNode[]
  x: number
  y: number
}

const NODE_W = 160
const NODE_H = 80
const H_GAP = 40
const V_GAP = 100

function buildTree(agents: AgentConfig[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  agents.forEach(a => map.set(a.id, { agent: a, children: [], x: 0, y: 0 }))

  const roots: TreeNode[] = []
  agents.forEach(a => {
    const node = map.get(a.id)!
    if (a.parentId && map.has(a.parentId)) {
      map.get(a.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

function layoutTree(node: TreeNode, x: number, y: number, depth: number): number {
  node.x = x
  node.y = y
  if (node.children.length === 0) return NODE_W + H_GAP

  let childX = x
  let totalWidth = 0
  node.children.forEach(child => {
    const w = layoutTree(child, childX, y + NODE_H + V_GAP, depth + 1)
    childX += w
    totalWidth += w
  })

  // Center parent over children
  const firstChild = node.children[0]
  const lastChild = node.children[node.children.length - 1]
  node.x = (firstChild.x + lastChild.x + NODE_W) / 2 - NODE_W / 2

  return Math.max(totalWidth, NODE_W + H_GAP)
}

function flattenTree(node: TreeNode, out: TreeNode[] = []): TreeNode[] {
  out.push(node)
  node.children.forEach(c => flattenTree(c, out))
  return out
}

function collectEdges(node: TreeNode): { from: TreeNode; to: TreeNode }[] {
  const edges: { from: TreeNode; to: TreeNode }[] = []
  node.children.forEach(c => {
    edges.push({ from: node, to: c })
    edges.push(...collectEdges(c))
  })
  return edges
}

const STATUS_COLORS = { ACTIVE: '#10b981', STANDBY: '#f59e0b', OFFLINE: '#475569' }

export default function OrgChart({ onCreateAgent, onEditAgent, refreshKey }: Props) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 40, y: 40 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const agents = getAllAgents()
  const roots = buildTree(agents)
  roots.forEach((root, i) => {
    const prevWidth = roots.slice(0, i).reduce((acc, r) => {
      const flat = flattenTree(r)
      const maxX = Math.max(...flat.map(n => n.x))
      return acc + maxX + NODE_W + H_GAP * 3
    }, 0)
    layoutTree(root, prevWidth, 0, 0)
  })

  const allNodes = roots.flatMap(r => flattenTree(r))
  const allEdges = roots.flatMap(r => collectEdges(r))

  const svgW = Math.max(...allNodes.map(n => n.x + NODE_W)) + 80
  const svgH = Math.max(...allNodes.map(n => n.y + NODE_H)) + 80

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('.agent-node')) return
    setDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }, [dragging, dragStart])

  const handleMouseUp = () => setDragging(false)

  const handleDelete = (id: string) => {
    deleteCustomAgent(id)
    setConfirmDelete(null)
    setSelected(null)
    window.location.reload()
  }

  return (
    <div className="flex flex-col h-full bg-[#05050f]">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 flex-shrink-0">
        <h2 className="text-white font-bold text-sm tracking-wide">Agent Org Chart</h2>
        <span className="text-slate-600 text-xs">{agents.length} agents</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500 font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }) }} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onCreateAgent}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white border border-violet-500/30 transition-all hover:border-violet-500/60"
            style={{ background: 'rgba(168,85,247,0.15)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Agent
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className={clsx('flex-1 overflow-hidden relative', dragging ? 'cursor-grabbing' : 'cursor-grab')}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
          <defs>
            <pattern id="orgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#orgrid)" />
        </svg>

        <svg
          ref={svgRef}
          width={svgW}
          height={svgH}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            overflow: 'visible',
          }}
        >
          <defs>
            <filter id="node-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {allEdges.map(({ from, to }, i) => {
            const fx = from.x + NODE_W / 2
            const fy = from.y + NODE_H
            const tx = to.x + NODE_W / 2
            const ty = to.y
            const my = (fy + ty) / 2
            return (
              <path
                key={i}
                d={`M ${fx} ${fy} C ${fx} ${my}, ${tx} ${my}, ${tx} ${ty}`}
                fill="none"
                stroke={from.agent.accent + '40'}
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            )
          })}

          {/* Nodes */}
          {allNodes.map(node => {
            const { agent, x, y } = node
            const isSelected = selected === agent.id
            const statusColor = STATUS_COLORS[agent.status]
            return (
              <g
                key={agent.id}
                className="agent-node"
                transform={`translate(${x}, ${y})`}
                onClick={() => setSelected(isSelected ? null : agent.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow */}
                {isSelected && (
                  <rect
                    x={-4} y={-4} width={NODE_W + 8} height={NODE_H + 8}
                    rx={16} fill="none"
                    stroke={agent.accent} strokeWidth={1.5} opacity={0.6}
                    filter="url(#node-glow)"
                  />
                )}

                {/* Card background */}
                <rect
                  x={0} y={0} width={NODE_W} height={NODE_H} rx={12}
                  fill={isSelected ? `${agent.accent}18` : 'rgba(15,15,35,0.95)'}
                  stroke={isSelected ? agent.accent + '60' : agent.accent + '25'}
                  strokeWidth={1}
                />

                {/* Accent stripe */}
                <rect x={0} y={0} width={3} height={NODE_H} rx={1.5} fill={agent.accent} opacity={0.8} />

                {/* Avatar circle */}
                <circle cx={28} cy={NODE_H / 2} r={16} fill={agent.accent + '20'} stroke={agent.accent + '40'} strokeWidth={1} />
                <text x={28} y={NODE_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={14} fill={agent.accent}>
                  {agent.avatar}
                </text>

                {/* Name */}
                <text x={52} y={NODE_H / 2 - 10} fontSize={12} fontWeight="600" fill="white" fontFamily="system-ui">
                  {agent.name.length > 13 ? agent.name.slice(0, 12) + '…' : agent.name}
                </text>

                {/* Type */}
                <text x={52} y={NODE_H / 2 + 6} fontSize={9} fill="#64748b" fontFamily="system-ui">
                  {agent.type}
                </text>

                {/* Status dot + label */}
                <circle cx={52} cy={NODE_H / 2 + 20} r={3} fill={statusColor} />
                <text x={59} y={NODE_H / 2 + 23} fontSize={8} fill={statusColor} fontFamily="system-ui">
                  {agent.status}
                </text>

                {/* Builtin badge */}
                {agent.isBuiltin && (
                  <rect x={NODE_W - 36} y={6} width={28} height={12} rx={4} fill={agent.accent + '20'} />
                )}
                {agent.isBuiltin && (
                  <text x={NODE_W - 22} y={15} fontSize={7} fill={agent.accent} textAnchor="middle" fontFamily="system-ui">CORE</text>
                )}

                {/* Edit/Delete buttons (non-builtin, selected) */}
                {isSelected && !agent.isBuiltin && (
                  <>
                    <g onClick={e => { e.stopPropagation(); onEditAgent(agent) }}>
                      <rect x={NODE_W - 56} y={NODE_H - 22} width={24} height={16} rx={4}
                        fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.4)" strokeWidth={0.5} />
                      <text x={NODE_W - 44} y={NODE_H - 11} fontSize={8} fill="#818cf8" textAnchor="middle">edit</text>
                    </g>
                    <g onClick={e => { e.stopPropagation(); setConfirmDelete(agent.id) }}>
                      <rect x={NODE_W - 28} y={NODE_H - 22} width={22} height={16} rx={4}
                        fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.3)" strokeWidth={0.5} />
                      <text x={NODE_W - 17} y={NODE_H - 11} fontSize={8} fill="#f87171" textAnchor="middle">del</text>
                    </g>
                  </>
                )}
              </g>
            )
          })}
        </svg>

        {/* Agent detail tooltip */}
        <AnimatePresence>
          {selected && (() => {
            const node = allNodes.find(n => n.agent.id === selected)
            if (!node) return null
            const { agent } = node
            return (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border p-4 min-w-64"
                style={{ background: 'rgba(8,8,24,0.98)', borderColor: agent.accent + '40' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl" style={{ color: agent.accent }}>{agent.avatar}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{agent.name}</div>
                    <div className="text-slate-500 text-xs">{agent.handle}</div>
                  </div>
                  {!agent.isBuiltin && (
                    <div className="ml-auto flex gap-1">
                      <button onClick={() => onEditAgent(agent)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(agent.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-slate-400 text-xs mb-2">{agent.description}</p>
                {agent.tools && agent.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {agent.tools.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: agent.accent + '18', color: agent.accent }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {agent.endpoint && (
                  <div className="mt-2 text-[10px] font-mono text-slate-600 truncate">{agent.endpoint}</div>
                )}
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </div>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="rounded-2xl border border-red-500/30 p-6 max-w-sm w-full mx-4"
              style={{ background: 'rgba(8,8,24,0.98)' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-white font-bold mb-2">Delete Agent?</h3>
              <p className="text-slate-400 text-sm mb-4">This will permanently remove the agent from your fleet.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 border border-white/10 hover:border-white/20 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl text-sm text-white font-semibold bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
