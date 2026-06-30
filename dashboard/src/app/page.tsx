'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import MetricsBar from '@/components/MetricsBar'
import ClaudePanel from '@/components/ClaudePanel'
import AgentFleet from '@/components/AgentFleet'
import ActivityLog from '@/components/ActivityLog'
import Sidebar, { AGENTS, type PageId } from '@/components/Sidebar'
import AgentChatPanel from '@/components/AgentChatPanel'
import GoalsPage from '@/components/GoalsPage'
import JournalPage from '@/components/JournalPage'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')

  const activeAgent = AGENTS.find(a => a.id === activePage)

  return (
    <div className="min-h-screen flex">
      <Sidebar activeAgent={activePage} onSelect={setActivePage} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <AnimatePresence mode="wait">
          {activePage === 'dashboard' && (
            <motion.main
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto"
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
          )}

          {activePage === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <GoalsPage />
            </motion.div>
          )}

          {activePage === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <JournalPage />
            </motion.div>
          )}

          {activeAgent && (
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <AgentChatPanel agentId={activeAgent.id} />
            </motion.div>
          )}
        </AnimatePresence>

        {activePage === 'dashboard' && (
          <footer className="px-6 py-3 border-t border-indigo-500/10 flex items-center justify-between flex-shrink-0">
            <div className="text-[10px] text-slate-600 tracking-widest uppercase">
              AgentOS Mission Control · v0.1.0
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-600">
              <span>Claude claude-sonnet-4-6</span>
              <span>·</span>
              <span>Next.js 14</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}
