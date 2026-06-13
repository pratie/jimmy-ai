import React, { useState } from 'react'
import { LogOut, User, Menu, ArrowLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import MenuItem from './menu-item'
import { useAgent } from '@/context/agent-context'

// Import custom icons
import DashboardIcon from '@/icons/dashboard-icon'
import ChatIcon from '@/icons/chat-icon'
import HelpDeskIcon from '@/icons/help-desk-icon'
import StarIcon from '@/icons/star-icon'
import EmailIcon from '@/icons/email-icon'
import CalIcon from '@/icons/cal-icon'
import SettingsIcon from '@/icons/settings-icon'

type MinMenuProps = {
  onShrink(): void
  current: string
  onSignOut(): void
  domains:
    | {
        id: string
        name: string
        icon: string | null
      }[]
    | null
    | undefined
  user?: {
    fullname: string
    email: string | null
  } | null
}

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  domains,
  user,
}: MinMenuProps) => {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const { activeAgent, clearAgent } = useAgent()

  const handleBackToAgents = () => {
    clearAgent()
    router.push('/dashboard')
  }

  // Scoped menu items for the active agent context
  const agentMenuItems = [
    {
      label: 'Analytics',
      icon: <DashboardIcon />,
      path: 'dashboard'
    },
    {
      label: 'Conversations',
      icon: <ChatIcon />,
      path: 'conversation'
    },
    {
      label: 'Knowledge Base',
      icon: <HelpDeskIcon />,
      path: activeAgent ? `settings/${activeAgent.name.split('.')[0]}?tab=knowledge` : 'dashboard'
    },
    {
      label: 'Topics',
      icon: <StarIcon />,
      path: activeAgent ? `settings/${activeAgent.name.split('.')[0]}?tab=behavior` : 'dashboard'
    },
    {
      label: 'Leads',
      icon: <EmailIcon />,
      path: 'email-marketing'
    },
    {
      label: 'Campaigns',
      icon: <CalIcon />,
      path: 'appointment'
    },
    {
      label: 'Agent Settings',
      icon: <SettingsIcon />,
      path: activeAgent ? `settings/${activeAgent.name.split('.')[0]}?tab=domain` : 'dashboard'
    }
  ]

  return (
    <div className="p-3 flex flex-col items-center h-full text-sidebar-foreground font-heading">
      <button
        onClick={onShrink}
        className="animate-fade-in opacity-0 delay-300 fill-mode-forwards cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl bg-sidebar-muted/40 hover:bg-sidebar-muted/80 transition-all"
        title="Expand Sidebar"
      >
        <Menu className="w-5 h-5 text-sidebar-foreground" />
      </button>

      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-6 items-center">
        {/* Navigation list */}
        <div className="flex flex-col items-center gap-1">
          {activeAgent ? (
            <>
              {/* Back to Agents button */}
              <button
                onClick={handleBackToAgents}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-sidebar-muted/30 ring-1 ring-sidebar-border/20 hover:bg-sidebar-muted/70 hover:ring-primary/30 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-all mb-4"
                title="Back to Agents"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Scoped Icons */}
              {agentMenuItems.map((menu, key) => (
                <MenuItem
                  size="min"
                  {...menu}
                  key={key}
                  current={current}
                />
              ))}

              {/* Add Custom Menu Icon */}
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sidebar-foreground/30 hover:text-primary hover:bg-primary/5 transition-all mt-2"
                title="Add Custom Menu"
              >
                <Plus className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Global Catalog Item */}
              <MenuItem
                size="min"
                icon={<DashboardIcon />}
                path="dashboard"
                current={current}
                label="Agents"
              />
            </>
          )}
        </div>

        {/* Bottom items */}
        <div className="flex flex-col items-center gap-3">
          {activeAgent && (
            <button
              onClick={handleBackToAgents}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sidebar-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
              title="Exit Preview"
            >
              <LogOut className="w-4 h-4 rotate-180" />
            </button>
          )}

          {user && (
            <div className="relative border-t border-sidebar-border/40 pt-3">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 hover:ring-primary/40 hover:bg-primary/15 transition-all text-xs font-bold"
                title={user.fullname}
              >
                {user.fullname.charAt(0).toUpperCase()}
              </button>
              {showDropdown && (
                <div className="absolute bottom-full left-full ml-2 mb-0 bg-sidebar/90 backdrop-blur-xl border border-sidebar-border/50 rounded-xl shadow-2xl overflow-hidden w-48 z-50">
                  <div className="px-4 py-3 border-b border-sidebar-border/30 bg-sidebar-muted/10">
                    <p className="text-xs font-bold text-sidebar-foreground truncate">{user.fullname}</p>
                    <p className="text-[10px] text-sidebar-foreground/50 truncate mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onSignOut()
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-sidebar-muted/60 transition-all text-left font-semibold text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  >
                    <LogOut className="w-3.5 h-3.5 text-sidebar-foreground/50" />
                    <span className="text-xs">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
