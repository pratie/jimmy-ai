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

      {/* Organization and client are two different concepts, so they get two
          different blocks. Collapsing them into one control made "all clients"
          and "which agency" indistinguishable. */}
      <div className="hidden border-b border-white/10 px-3 py-3 md:block">
        <div className="flex items-center gap-2.5 px-1 pb-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-white/10 text-[11px] font-bold">
            {(organization?.name ?? 'CD').slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold leading-tight">
              {organization?.name ?? 'ChatDock'}
            </span>
            <span className="block text-[10.5px] text-white/40">
              {isDirectBusiness ? 'Business workspace' : 'Agency workspace'}
            </span>
          </span>
        </div>
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
                  'group relative flex h-9 items-center justify-center gap-2.5 rounded-[8px] text-[13.5px] transition-colors md:justify-start md:px-2.5',
                  isActive(item.href)
                    ? 'bg-white/[0.09] font-semibold text-white'
                    : 'font-medium text-white/55 hover:bg-white/[0.05] hover:text-white/90'
                )}
              >
                {isActive(item.href) && (
                  <span
                    className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full"
                    style={{ backgroundColor: '#7B7CF0' }}
                    aria-hidden="true"
                  />
                )}
                <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
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
                  'relative flex h-9 items-center justify-center gap-2.5 rounded-[8px] text-[13px] transition-colors md:justify-start md:px-2.5',
                  isActive(item.href)
                    ? 'bg-white/[0.09] font-semibold text-white'
                    : 'font-medium text-white/45 hover:bg-white/[0.05] hover:text-white/80'
                )}
              >
                {isActive(item.href) && (
                  <span
                    className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full"
                    style={{ backgroundColor: '#7B7CF0' }}
                    aria-hidden="true"
                  />
                )}
                <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
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
