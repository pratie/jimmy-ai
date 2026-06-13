import React, { useState } from 'react'
import { LogOut, Menu, User, ArrowLeft, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
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

type Props = {
  onExpand(): void
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

const MaxMenu = ({ current, domains, onExpand, onSignOut, user }: Props) => {
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
    <div className="py-4 px-5 flex flex-col h-full text-sidebar-foreground font-heading">
      {/* Sidebar Header Section */}
      <div className="flex justify-between items-center mb-6 border-b border-sidebar-border/30 pb-4">
        <div className="flex items-center gap-3 animate-fade-in opacity-0 delay-300 fill-mode-forwards">
          <div className="relative w-7 h-7">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-base font-extrabold tracking-tight">ChatDock AI</span>
        </div>
        <Menu
          className="cursor-pointer animate-fade-in opacity-0 delay-300 fill-mode-forwards text-sidebar-foreground/70 hover:text-sidebar-foreground w-5 h-5"
          onClick={onExpand}
        />
      </div>

      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-4">
        {/* Navigation Actions */}
        <div className="flex flex-col">
          {activeAgent ? (
            <>
              {/* Back to Agents Link */}
              <button
                onClick={handleBackToAgents}
                className="flex items-center gap-2 px-2.5 py-2.5 w-full text-xs font-bold text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-muted rounded-xl transition-all border-l-2 border-l-transparent hover:border-l-primary text-left mb-4 border-b border-sidebar-border/30 pb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Agents
              </button>

              {/* Scoped Agent Context Menu */}
              <p className="text-[10px] text-sidebar-foreground/40 mb-3 mt-2 font-bold tracking-[0.12em] uppercase">Agent Console</p>
              <div className="flex flex-col gap-1">
                {agentMenuItems.map((menu, key) => (
                  <MenuItem
                    size="max"
                    {...menu}
                    key={key}
                    current={current}
                  />
                ))}
              </div>
              
              {/* Add Custom Menu Mock */}
              <button className="flex items-center gap-2 px-2 py-2 rounded-lg my-1 transition-all border border-transparent text-sidebar-foreground/40 hover:text-primary hover:bg-primary/5 text-sm font-semibold mt-2">
                <Plus className="w-4 h-4" />
                Add Custom Menu
              </button>
            </>
          ) : (
            <>
              {/* Global Catalog Sidebar Menu */}
              <p className="text-[10px] text-sidebar-foreground/40 mb-3 mt-2 font-bold tracking-[0.12em] uppercase">Catalog</p>
              <MenuItem
                size="max"
                label="Agents"
                icon={<DashboardIcon />}
                path="dashboard"
                current={current}
              />
            </>
          )}
        </div>

        {/* Bottom Panel Wrapper */}
        <div className="flex flex-col gap-3">
          {activeAgent && (
            <button
              onClick={handleBackToAgents}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg w-full text-xs font-bold text-sidebar-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent text-left"
            >
              <LogOut className="w-3.5 h-3.5 rotate-180" />
              Exit Preview
            </button>
          )}
          
          {user && (
            <div className="relative border-t border-sidebar-border/40 pt-3">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 px-2 py-1.5 w-full rounded-xl transition-all border border-transparent text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-muted/60"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
                  {user.fullname.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden flex-1 text-left">
                  <p className="text-xs font-bold text-sidebar-foreground truncate leading-none">
                    {user.fullname}
                  </p>
                  <p className="text-[10px] text-sidebar-foreground/50 truncate mt-1">
                    {user.email}
                  </p>
                </div>
              </button>
              {showDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-sidebar/90 backdrop-blur-xl border border-sidebar-border/50 rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-sidebar-border/30 bg-sidebar-muted/10">
                    <p className="text-xs font-bold text-sidebar-foreground">{user.fullname}</p>
                    <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">{user.email}</p>
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

export default MaxMenu
