'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import MetricsBar from '@/components/MetricsBar'
import ClaudePanel from '@/components/ClaudePanel'
import AgentFleet from '@/components/AgentFleet'
import ActivityLog from '@/components/ActivityLog'
import Sidebar, { type PageId } from '@/components/Sidebar'
import AgentChatPanel from '@/components/AgentChatPanel'
import GoalsPage from '@/components/GoalsPage'
import JournalPage from '@/components/JournalPage'
import OrgChart from '@/components/OrgChart'
import CrewBuilder from '@/components/CrewBuilder'
import AgentCreator from '@/components/AgentCreator'
import { getAllAgents, type AgentConfig } from '@/lib/agents'

const pageVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
}

const dashboardVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [showCreator, setShowCreator] = useState(false)
  const [editAgent, setEditAgent] = useState<AgentConfig | undefined>()
  const [orgRefreshKey, setOrgRefreshKey] = useState(0)

  const agents = getAllAgents()
  const activeAgent = agents.find(a => a.id === activePage)

  const handleCreateAgent = useCallback(() => {
    setEditAgent(undefined)
    setShowCreator(true)
  }, [])

  const handleEditAgent = useCallback((agent: AgentConfig) => {
    setEditAgent(agent)
    setShowCreator(true)
  }, [])

  const handleAgentCreated = useCallback((agent: AgentConfig) => {
    setShowCreator(false)
    setOrgRefreshKey(k => k + 1)
    setActivePage(agent.id)
  }, [])

  // Pages where we show the full-height layout
  const isAgentPage = !!activeAgent
  const isToolPage = ['goals', 'journal', 'orgchart', 'crew', 'fleet'].includes(activePage)

  return (
    <div className="min-h-screen flex">
      <Sidebar
        activeAgent={activePage}
        onSelect={setActivePage}
        onCreateAgent={handleCreateAgent}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <AnimatePresence mode="wait">
          {/* ── Dashboard Overview ── */}
          {activePage === 'dashboard' && (
            <motion.main
              key="dashboard"
              variants={dashboardVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto"
            >
              <MetricsBar />
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 md:gap-5">
                <ClaudePanel />
                <div className="flex flex-col gap-4 md:gap-5">
                  <AgentFleet onSelectAgent={setActivePage} />
                  <ActivityLog />
                </div>
              </div>
            </motion.main>
          )}

          {/* ── Agent Fleet (dedicated page) ── */}
          {activePage === 'fleet' && (
            <motion.div key="fleet" {...pageVariants} className="flex-1 p-6 overflow-y-auto">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-white">Agent Fleet</h1>
                <p className="text-slate-500 text-sm mt-1">All {agents.length} agents in your network</p>
              </div>
              <AgentFleet onSelectAgent={setActivePage} expanded />
            </motion.div>
          )}

          {/* ── Goals ── */}
          {activePage === 'goals' && (
            <motion.div key="goals" {...pageVariants} className="flex-1 flex flex-col overflow-hidden">
              <GoalsPage />
            </motion.div>
          )}

          {/* ── Journal ── */}
          {activePage === 'journal' && (
            <motion.div key="journal" {...pageVariants} className="flex-1 flex flex-col overflow-hidden">
              <JournalPage />
            </motion.div>
          )}

          {/* ── Org Chart ── */}
          {activePage === 'orgchart' && (
            <motion.div key="orgchart" {...pageVariants} className="flex-1 flex flex-col overflow-hidden">
              <OrgChart
                onCreateAgent={handleCreateAgent}
                onEditAgent={handleEditAgent}
                refreshKey={orgRefreshKey}
              />
            </motion.div>
          )}

          {/* ── Crew Builder ── */}
          {activePage === 'crew' && (
            <motion.div key="crew" {...pageVariants} className="flex-1 flex overflow-hidden">
              <CrewBuilder />
            </motion.div>
          )}

          {/* ── Agent Chat ── */}
          {isAgentPage && (
            <motion.div
              key={activePage}
              {...pageVariants}
              className="flex-1 flex flex-col overflow-hidden p-4"
            >
              <AgentChatPanel agentId={activeAgent.id} />
            </motion.div>
          )}
        </AnimatePresence>

        {activePage === 'dashboard' && (
          <footer className="px-6 py-3 border-t border-indigo-500/10 flex items-center justify-between flex-shrink-0">
            <div className="text-[10px] text-slate-600 tracking-widest uppercase">
              AgentOS Mission Control · v2.0
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-600">
              <span>{agents.length} agents</span>
              <span>·</span>
              <span>Claude claude-sonnet-4-6</span>
              <span>·</span>
              <span>Next.js 14</span>
            </div>
          </footer>
        )}
      </div>

      {/* ── Agent Creator Modal ── */}
      <AnimatePresence>
        {showCreator && (
          <AgentCreator
            onClose={() => setShowCreator(false)}
            onCreated={handleAgentCreated}
            editAgent={editAgent}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
