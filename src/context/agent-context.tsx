'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Agent = {
  id: string
  name: string
  icon: string | null
}

type AgentContextType = {
  activeAgent: Agent | null
  selectAgent: (agent: Agent | null) => void
  clearAgent: () => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatdock_active_agent')
      if (saved) {
        try {
          setActiveAgent(JSON.parse(saved))
        } catch (e) {
          console.error('[AgentProvider] Error parsing active agent', e)
        }
      }
      setMounted(true)
    }
  }, [])

  const selectAgent = (agent: Agent | null) => {
    setActiveAgent(agent)
    if (typeof window !== 'undefined') {
      if (agent) {
        localStorage.setItem('chatdock_active_agent', JSON.stringify(agent))
      } else {
        localStorage.removeItem('chatdock_active_agent')
      }
    }
  }

  const clearAgent = () => {
    selectAgent(null)
  }

  return (
    <AgentContext.Provider value={{ activeAgent: mounted ? activeAgent : null, selectAgent, clearAgent }}>
      {children}
    </AgentContext.Provider>
  )
}

export const useAgent = () => {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}
