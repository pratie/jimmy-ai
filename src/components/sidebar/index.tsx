'use client'

import { useAgent } from '@/context/agent-context'
import { cn } from '@/lib/utils'
import { useClerk } from '@clerk/nextjs'
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Inbox,
  Layers3,
  LogOut,
  PlugZap,
  Settings,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  domains:
    | { id: string; name: string; icon: string | null }[]
    | null
    | undefined
  user?: { fullname: string; email: string | null } | null
}

const primaryNavigation = [
  { label: 'Overview', href: '/dashboard', icon: BarChart3 },
  { label: 'Inbox', href: '/conversation', icon: Inbox },
  { label: 'Leads', href: '/email-marketing', icon: UsersRound },
  { label: 'Bookings', href: '/appointment', icon: CalendarDays },
]

const secondaryNavigation = [
  { label: 'Integrations', href: '/integration', icon: PlugZap },
  { label: 'Agency settings', href: '/settings', icon: Settings },
]

function workspaceName(domain: string) {
  return domain.replace(/^www\./, '').split('.')[0].replace(/[-_]/g, ' ')
}

const SideBar = ({ domains, user }: Props) => {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()
  const { activeAgent, selectAgent, clearAgent } = useAgent()

  const chooseWorkspace = (domain: NonNullable<Props['domains']>[number]) => {
    selectAgent(domain)
    router.push(`/settings/${domain.name.split('.')[0]}`)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[72px] flex-col border-r border-white/10 bg-[#0b1020] text-white md:relative md:w-[268px] md:flex-none">
      <div className="flex h-20 items-center border-b border-white/10 px-4 md:px-5">
        <Link href="/dashboard" onClick={clearAgent} className="flex items-center gap-3 overflow-hidden">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_8px_30px_rgba(91,92,226,0.35)]">
            <Image src="/images/chatdock-mark.png" alt="ChatDock" fill sizes="40px" className="object-contain p-1" />
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-black tracking-tight">ChatDock</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Agency OS</p>
          </div>
        </Link>
      </div>

      <div className="chat-window flex-1 overflow-y-auto px-3 py-5 md:px-4">
        <p className="mb-2 hidden px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/35 md:block">Operate</p>
        <nav className="space-y-1">
          {primaryNavigation.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex h-11 items-center justify-center gap-3 rounded-xl text-sm font-bold transition md:justify-start md:px-3',
                  active
                    ? 'bg-white text-[#0b1020] shadow-lg shadow-black/20'
                    : 'text-white/58 hover:bg-white/8 hover:text-white'
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="hidden md:block">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="my-5 h-px bg-white/10" />

        <div className="mb-2 hidden items-center justify-between px-3 md:flex">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Client workspaces</p>
          <Link href="/dashboard" className="text-white/35 transition hover:text-white" title="Manage workspaces">
            <Layers3 className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-1">
          {(domains || []).slice(0, 6).map((domain) => {
            const selected = activeAgent?.id === domain.id
            const name = workspaceName(domain.name)
            return (
              <button
                key={domain.id}
                onClick={() => chooseWorkspace(domain)}
                title={domain.name}
                className={cn(
                  'group flex h-11 w-full items-center justify-center gap-3 rounded-xl text-left transition md:justify-start md:px-2.5',
                  selected ? 'bg-[#5b5ce2]/20 text-white' : 'text-white/55 hover:bg-white/8 hover:text-white'
                )}
              >
                <span className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black uppercase',
                  selected ? 'bg-[#7778ff] text-white' : 'bg-white/10 text-white/70 group-hover:bg-white/15'
                )}>
                  {name.slice(0, 2)}
                </span>
                <span className="hidden min-w-0 flex-1 truncate text-xs font-bold capitalize md:block">{name}</span>
                <ChevronRight className="hidden h-3.5 w-3.5 text-white/25 md:block" />
              </button>
            )
          })}

          {!domains?.length && (
            <Link href="/dashboard" className="flex h-11 items-center justify-center rounded-xl border border-dashed border-white/15 text-white/45 hover:border-white/30 hover:text-white md:gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden text-xs font-bold md:block">Create first agent</span>
            </Link>
          )}
        </div>

        <div className="my-5 h-px bg-white/10" />

        <nav className="space-y-1">
          {secondaryNavigation.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={cn(
                'flex h-10 items-center justify-center gap-3 rounded-xl text-xs font-bold transition md:justify-start md:px-3',
                active ? 'bg-white/12 text-white' : 'text-white/45 hover:bg-white/8 hover:text-white'
              )}>
                <Icon className="h-4 w-4" />
                <span className="hidden md:block">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-3 md:p-4">
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/[0.06] p-2 md:justify-start">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7778ff] to-[#4f46e5] text-xs font-black shadow-lg">
            {user?.fullname?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate text-xs font-extrabold">{user?.fullname || 'ChatDock user'}</p>
            <p className="mt-0.5 truncate text-[10px] text-white/40">{user?.email || 'Agency owner'}</p>
          </div>
          <button
            onClick={() => signOut(() => router.push('/'))}
            className="hidden rounded-lg p-2 text-white/35 transition hover:bg-white/10 hover:text-white md:block"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default SideBar
