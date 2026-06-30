'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Sidebar, { type PageId } from '@/components/Sidebar'
import AgentChatPanel from '@/components/AgentChatPanel'
import GoalsPage from '@/components/GoalsPage'
import JournalPage from '@/components/JournalPage'
import OrgChart from '@/components/OrgChart'
import CrewBuilder from '@/components/CrewBuilder'
import AgentCreator from '@/components/AgentCreator'
import MemoryPanel from '@/components/MemoryPanel'
import AgentFleet from '@/components/AgentFleet'
import MissionControl from '@/components/MissionControl'
import { getAllAgents, type AgentConfig } from '@/lib/agents'

const pageVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
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

  const isAgentPage = !!activeAgent

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        activeAgent={activePage}
        onSelect={setActivePage}
        onCreateAgent={handleCreateAgent}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <AnimatePresence mode="wait">

          {/* ── Mission Control (dashboard) ── */}
          {activePage === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden min-h-0"
            >
              <MissionControl onOpenAgent={setActivePage} onCreateAgent={handleCreateAgent} />
            </motion.div>
          )}

          {/* ── Agent Fleet ── */}
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

          {/* ── Memory ── */}
          {activePage === 'memory' && (
            <motion.div key="memory" {...pageVariants} className="flex-1 flex flex-col overflow-hidden">
              <MemoryPanel />
            </motion.div>
          )}

          {/* ── Agent deep-dive chat ── */}
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
      </div>

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
