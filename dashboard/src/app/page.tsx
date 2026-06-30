'use client'

import { motion } from 'framer-motion'
import Header from '@/components/Header'
import MetricsBar from '@/components/MetricsBar'
import ClaudePanel from '@/components/ClaudePanel'
import AgentFleet from '@/components/AgentFleet'
import ActivityLog from '@/components/ActivityLog'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5"
      >
        <MetricsBar />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 md:gap-5">
          <ClaudePanel />

          <div className="flex flex-col gap-4 md:gap-5">
            <AgentFleet />
            <ActivityLog />
          </div>
        </div>
      </motion.main>

      <footer className="px-6 py-3 border-t border-indigo-500/10 flex items-center justify-between">
        <div className="text-[10px] text-slate-600 tracking-widest uppercase">
          AgentOS Mission Control · v0.1.0
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-600">
          <span>Claude claude-sonnet-4-6</span>
          <span>·</span>
          <span>Next.js 14</span>
          <span>·</span>
          <span>Framer Motion</span>
        </div>
      </footer>
    </div>
  )
}
