'use client'

import { cn } from '@/lib/utils'
import { useClerk } from '@clerk/nextjs'
import {
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  Inbox,
  LogOut,
  PlugZap,
  Settings,
  UsersRound,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import ClientSwitcher from './client-switcher'

type Workspace = {
  id: string
  name: string
  businessName: string | null
  logoUrl: string | null
  primaryColor: string | null
  workspaceType: string
}

type Props = {
  workspaces: Workspace[]
  organization: { id: string; name: string; organizationType: string } | null
  user?: { fullname: string; email: string | null } | null
  canCreateClient?: boolean
  canManageBilling?: boolean
}

/**
 * Agency navigation.
 *
 * Restructured around the agency workflow: a client switcher at the top, then
 * roster-wide surfaces, then organization-level ones. The previous sidebar
 * listed raw domains as buttons and pushed to `/settings/<first-label-of-domain>`,
 * which conflated "pick a client" with "edit a chatbot" and broke as soon as two
 * clients shared a first label.
 *
 * A direct-business organization sees no client vocabulary at all — no switcher,
 * no Clients entry — because it has exactly one workspace and never manages
 * anyone else's.
 */
const AGENCY_NAV = [
  { label: 'Overview', href: '/dashboard', icon: BarChart3 },
  { label: 'Clients', href: '/clients', icon: Building2, agencyOnly: true },
  { label: 'Inbox', href: '/conversation', icon: Inbox },
  { label: 'Leads', href: '/leads', icon: UsersRound },
  { label: 'Bookings', href: '/appointment', icon: CalendarDays },
]

const ORG_NAV = [
  { label: 'Integrations', href: '/integration', icon: PlugZap },
  { label: 'Billing', href: '/settings?tab=billing', icon: CreditCard, billingOnly: true },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const SideBar = ({
  workspaces,
  organization,
  user,
  canCreateClient = false,
  canManageBilling = false,
}: Props) => {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()

  const isDirectBusiness = organization?.organizationType === 'direct_business'

  // /clients/<id> is the only route that scopes the dashboard to one client.
  const activeWorkspaceId = React.useMemo(() => {
    const match = pathname.match(/^\/clients\/([0-9a-f-]{36})/i)
    return match?.[1] ?? null
  }, [pathname])

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    return base === '/dashboard' ? pathname === base : pathname.startsWith(base)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[72px] flex-col border-r border-white/10 bg-[#0b1020] text-white md:relative md:w-[268px] md:flex-none">
      <div className="flex h-16 items-center border-b border-white/10 px-4 md:px-5">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white p-1.5">
            <Image src="/images/chatdock-mark.png" alt="ChatDock" fill sizes="36px" className="object-contain p-1" />
          </div>
          <p className="hidden truncate text-sm font-black tracking-tight md:block">ChatDock</p>
        </Link>
      </div>

      {/* Client switcher — hidden on the icon rail, where it has no room */}
      <div className="hidden border-b border-white/10 px-3 py-3 md:block">
        <ClientSwitcher
          workspaces={workspaces}
          organizationName={organization?.name ?? 'Your agency'}
          isDirectBusiness={isDirectBusiness}
          activeWorkspaceId={activeWorkspaceId}
          canCreate={canCreateClient}
        />
      </div>

      <div className="chat-window flex-1 overflow-y-auto px-3 py-4 md:px-4">
        <nav className="space-y-1">
          {AGENCY_NAV.filter((i) => !(i.agencyOnly && isDirectBusiness)).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  'group flex h-11 items-center justify-center gap-3 rounded-xl text-sm font-bold transition md:justify-start md:px-3',
                  isActive(item.href)
                    ? 'bg-white text-[#0b1020] shadow-lg shadow-black/20'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="hidden md:block">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="my-4 h-px bg-white/10" />

        <nav className="space-y-1">
          {ORG_NAV.filter((i) => !(i.billingOnly && !canManageBilling)).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                className={cn(
                  'flex h-10 items-center justify-center gap-3 rounded-xl text-xs font-bold transition md:justify-start md:px-3',
                  isActive(item.href)
                    ? 'bg-white/15 text-white'
                    : 'text-white/45 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:block">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-3 md:p-4">
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/[0.06] p-2 md:justify-start">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7778ff] to-[#4f46e5] text-xs font-black">
            {user?.fullname?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate text-xs font-extrabold">{user?.fullname || 'ChatDock user'}</p>
            <p className="mt-0.5 truncate text-[10px] text-white/40">{user?.email || ''}</p>
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
