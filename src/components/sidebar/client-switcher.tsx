'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronsUpDown, Plus, Search } from 'lucide-react'

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
  organizationName: string
  /** `direct_business` organizations own exactly one workspace. */
  isDirectBusiness: boolean
  activeWorkspaceId?: string | null
  canCreate: boolean
}

/**
 * Switches the dashboard between clients.
 *
 * Hidden entirely for a direct-business organization: that customer has one
 * workspace and no concept of "clients", so a switcher offering a single
 * unchangeable option is pure confusion. Per the brief, they get the same
 * architecture without the agency machinery.
 */
export default function ClientSwitcher({
  workspaces,
  organizationName,
  isDirectBusiness,
  activeWorkspaceId,
  canCreate,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const rootRef = React.useRef<HTMLDivElement>(null)

  const active = workspaces.find((w) => w.id === activeWorkspaceId) ?? null

  // Prospect demos are not clients — counting them here would overstate the
  // roster on the one surface an owner glances at most.
  const realClientCount = workspaces.filter((w) => w.workspaceType !== 'prospect_demo').length

  React.useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return workspaces
    return workspaces.filter((w) =>
      `${w.businessName ?? ''} ${w.name}`.toLowerCase().includes(q)
    )
  }, [workspaces, query])

  const go = (id: string) => {
    setOpen(false)
    setQuery('')
    router.push(`/clients/${id}`)
  }

  const label = (w: Workspace) => w.businessName || w.name
  const initials = (w: Workspace) =>
    label(w).split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  if (isDirectBusiness) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.06] px-3 py-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#5B5CE2] text-[10px] font-bold">
          {organizationName.slice(0, 2).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{organizationName}</span>
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center gap-2.5 rounded-lg bg-white/[0.06] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2]"
      >
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[10px] font-bold"
          style={{ backgroundColor: active?.primaryColor ?? '#5B5CE2' }}
        >
          {active ? initials(active) : <Building2 className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-tight">
            {active ? label(active) : 'All clients'}
          </span>
          <span className="block truncate text-[10.5px] text-white/45">
            {active
              ? active.workspaceType === 'prospect_demo'
                ? 'Prospect demo'
                : 'Client workspace'
              : `${realClientCount} active client${realClientCount === 1 ? '' : 's'}`}
          </span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-white/40" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-white/10 bg-[#141a2e] shadow-2xl"
        >
          {workspaces.length > 6 && (
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-white/35" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clients…"
                aria-label="Search clients"
                className="w-full bg-transparent text-[12.5px] text-white outline-none placeholder:text-white/30"
              />
            </div>
          )}

          <div className="max-h-64 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                router.push('/clients')
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] text-white/70 hover:bg-white/[0.06]"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-white/10">
                <Building2 className="h-3 w-3" />
              </span>
              All clients
              {!active && <Check className="ml-auto h-3.5 w-3.5 text-[#5B5CE2]" />}
            </button>

            {filtered.map((w) => (
              <button
                key={w.id}
                type="button"
                role="option"
                aria-selected={w.id === activeWorkspaceId}
                onClick={() => go(w.id)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06]"
              >
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded text-[9px] font-bold"
                  style={{ backgroundColor: w.primaryColor ?? '#5B5CE2' }}
                >
                  {initials(w)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px]">{label(w)}</span>
                {w.workspaceType === 'prospect_demo' && (
                  <span className="shrink-0 rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                    DEMO
                  </span>
                )}
                {w.id === activeWorkspaceId && <Check className="h-3.5 w-3.5 shrink-0 text-[#5B5CE2]" />}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-[12px] text-white/35">No matching client</p>
            )}
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                router.push('/clients?new=1')
              }}
              className="flex w-full items-center gap-2.5 border-t border-white/10 px-3 py-2.5 text-left text-[12.5px] font-medium text-[#9b9cff] hover:bg-white/[0.06]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add a client
            </button>
          )}
        </div>
      )}
    </div>
  )
}
