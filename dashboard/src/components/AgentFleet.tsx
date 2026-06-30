'use client'

import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import AgentCard, { AgentCardProps } from './AgentCard'

const AGENTS: AgentCardProps[] = [
  {
    name: 'OpenClaw',
    type: 'Research',
    status: 'ACTIVE',
    color: 'cyan',
    icon: 'search',
    taskCount: 7,
    completedTasks: 31,
    lastActive: '0:12s ago',
    description: 'Deep web research agent. Crawls, indexes, and synthesizes data from multiple sources in parallel.',
  },
  {
    name: 'Hermes',
    type: 'Messaging',
    status: 'ACTIVE',
    color: 'pink',
    icon: 'message',
    taskCount: 3,
    completedTasks: 89,
    lastActive: '0:04s ago',
    description: 'Multi-channel communication orchestrator. Routes messages, handles notifications, and manages outreach.',
  },
  {
    name: 'Nexus',
    type: 'Orchestrator',
    status: 'STANDBY',
    color: 'amber',
    icon: 'network',
    taskCount: 0,
    completedTasks: 14,
    lastActive: '2:47m ago',
    description: 'High-level task orchestration and agent coordination. Routes complex workloads to specialized agents.',
  },
  {
    name: 'Phantom',
    type: 'Stealth',
    status: 'OFFLINE',
    color: 'red',
    icon: 'eye',
    taskCount: 0,
    completedTasks: 7,
    lastActive: '1:23h ago',
    description: 'Covert monitoring and reconnaissance agent. Operates with minimal footprint and maximum discretion.',
  },
]

export default function AgentFleet() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-panel p-4 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-white tracking-wider uppercase">Agent Fleet</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">2 / 4 Active</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 status-dot-active" />
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 status-dot-active" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 status-dot-standby" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AGENTS.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.35 + i * 0.08 }}
          >
            <AgentCard {...agent} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
