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
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlugZap,
  Sparkles,
  Settings,
  UsersRound,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import ClientSwitcher from './client-switcher'
import { useSidebarState } from './use-sidebar-state'

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
 * Three layouts from one component:
 *
 * - desktop expanded — 268px, full labels
 * - desktop collapsed — 68px icon rail with hover tooltips, persisted
 * - mobile — an overlay drawer, never a squeezed rail, because 68px of icons
 *   on a phone is neither navigable nor dismissible
 *
 * A direct-business organization sees no client vocabulary at all — no
 * switcher, no Clients entry — because it has exactly one workspace and never
 * manages anyone else's.
 */
const AGENCY_NAV = [
  { label: 'Overview', href: '/dashboard', icon: BarChart3 },
  { label: 'Clients', href: '/clients', icon: Building2, agencyOnly: true },
  // Agency-only for the same reason as Clients: a direct business has its own
  // one workspace and no prospects to pitch.
  { label: 'Demos', href: '/demos', icon: Sparkles, agencyOnly: true },
  { label: 'Inbox', href: '/conversation', icon: Inbox },
  { label: 'Leads', href: '/leads', icon: UsersRound },
  { label: 'Bookings', href: '/appointment', icon: CalendarDays },
]

const ORG_NAV = [
  { label: 'Integrations', href: '/integration', icon: PlugZap },
  { label: 'Billing', href: '/settings?tab=billing', icon: CreditCard, billingOnly: true },
  { label: 'Settings', href: '/settings', icon: Settings },
]

/** Label shown beside a collapsed icon. Rendered on hover and on focus, so it
 *  is reachable by keyboard rather than mouse only. */
function RailTooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-[6px] bg-sidebar-muted px-2 py-1 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
    >
      {label}
    </span>
  )
}

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
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, isMobile } = useSidebarState()

  const isDirectBusiness = organization?.organizationType === 'direct_business'

  // On mobile the drawer is always full width; only desktop collapses.
  const rail = collapsed && !isMobile

  // Navigating should dismiss the drawer, or the destination arrives hidden
  // behind it.
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname, setMobileOpen])

  const activeWorkspaceId = React.useMemo(() => {
    const match = pathname.match(/^\/clients\/([0-9a-f-]{36})/i)
    return match?.[1] ?? null
  }, [pathname])

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    return base === '/dashboard' ? pathname === base : pathname.startsWith(base)
  }

  const navLink = (item: { label: string; href: string; icon: React.ElementType }, small = false) => {
    const Icon = item.icon
    const active = isActive(item.href)
    return (
      <Link
        key={item.label}
        href={item.href}
        aria-label={rail ? item.label : undefined}
        className={cn(
          'group relative flex h-9 items-center gap-2.5 rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent',
          rail ? 'justify-center px-0' : 'px-2.5',
          small ? 'text-[13px]' : 'text-[13.5px]',
          active
            ? 'bg-white/[0.09] font-semibold text-white'
            : cn('font-medium hover:bg-white/[0.05]', small ? 'text-white/45 hover:text-white/80' : 'text-white/55 hover:text-white/90')
        )}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-sidebar-accent"
            aria-hidden="true"
          />
        )}
        <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
        {/* Labels unmount when collapsed rather than being hidden, so the rail
            has nothing to wrap or truncate mid-transition. */}
        {!rail && <span className="truncate">{item.label}</span>}
        {rail && <RailTooltip label={item.label} />}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile trigger. Lives outside the drawer so it stays reachable when
          the drawer is closed — the dashboard pages own their headers now, so
          there is no shell chrome to host it. */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        className="fixed left-3 top-3 z-40 grid h-10 w-10 place-items-center rounded-[10px] border border-border bg-card shadow-sm md:hidden"
      >
        <Menu className="h-[18px] w-[18px] text-foreground" />
      </button>

      {/* Scrim. Fades rather than appearing, so the drawer reads as sliding
          over the page instead of the page being replaced. */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground',
          'transition-[width,transform] duration-200 ease-out motion-reduce:transition-none',
          'md:relative md:flex-none md:translate-x-0',
          rail ? 'md:w-[68px]' : 'md:w-[268px]',
          // Mobile: full-height drawer, off-canvas until opened.
          'w-[268px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-white/10',
            rail ? 'justify-center px-2' : 'justify-between px-4 md:px-5'
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white p-1.5">
              <Image src="/images/chatdock-mark.png" alt="ChatDock" fill sizes="36px" className="object-contain p-1" />
            </div>
            {!rail && <p className="truncate text-sm font-semibold tracking-tight">ChatDock</p>}
          </Link>

          {!rail && (
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Collapse sidebar  ⌘B"
              aria-label="Collapse sidebar"
              className="hidden shrink-0 rounded-[7px] p-1.5 text-white/35 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent md:block"
            >
              <PanelLeftClose className="h-[17px] w-[17px]" />
            </button>
          )}
        </div>

        {/* Expand control gets its own row when collapsed — putting it beside a
            27px logo made both targets too small to hit reliably. */}
        {rail && (
          <div className="hidden justify-center border-b border-white/10 py-2 md:flex">
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Expand sidebar  ⌘B"
              aria-label="Expand sidebar"
              className="group relative grid h-8 w-8 place-items-center rounded-[7px] text-white/40 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent"
            >
              <PanelLeftOpen className="h-[17px] w-[17px]" />
              <RailTooltip label="Expand sidebar" />
            </button>
          </div>
        )}

        {/* Organization and client are two different concepts, so they get two
            different blocks. Collapsed, both reduce to the org monogram — a
            switcher is not usable at 68px, and the active client is already
            named in the page's own context header. */}
        <div className="border-b border-white/10 px-3 py-3">
          {rail ? (
            <div className="group relative flex justify-center">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-white/10 text-[11px] font-bold">
                {(organization?.name ?? 'CD').slice(0, 2).toUpperCase()}
              </span>
              <RailTooltip label={organization?.name ?? 'ChatDock'} />
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className={cn('chat-window flex-1 overflow-y-auto py-4', rail ? 'px-2.5' : 'px-3 md:px-4')}>
          <nav className="space-y-1">
            {AGENCY_NAV.filter((i) => !(i.agencyOnly && isDirectBusiness)).map((i) => navLink(i))}
          </nav>

          <div className="my-4 h-px bg-white/10" />

          <nav className="space-y-1">
            {ORG_NAV.filter((i) => !(i.billingOnly && !canManageBilling)).map((i) => navLink(i, true))}
          </nav>
        </div>

        <div className={cn('border-t border-white/10 p-2.5 md:p-3', rail && 'md:px-2')}>
          <div className={cn('flex items-center gap-2.5 rounded-[10px] py-1.5', rail ? 'justify-center px-0' : 'px-1.5')}>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
            >
              {user?.fullname?.charAt(0).toUpperCase() || 'C'}
            </div>
            {!rail && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium leading-tight">
                    {user?.fullname || 'ChatDock user'}
                  </p>
                  {/* Rendered only when present — an empty <p> still claims a
                      line and left the name looking oddly off-centre. */}
                  {user?.email && (
                    <p className="truncate text-[10.5px] text-white/40">{user.email}</p>
                  )}
                </div>
                <button
                  onClick={() => signOut(() => router.push('/'))}
                  className="shrink-0 rounded-[7px] p-1.5 text-white/35 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-[15px] w-[15px]" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default SideBar
