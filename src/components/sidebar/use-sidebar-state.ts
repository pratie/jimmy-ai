'use client'

import * as React from 'react'

const STORAGE_KEY = 'chatdock:sidebar-collapsed'
const MOBILE_QUERY = '(max-width: 767px)'

/**
 * Sidebar open/collapsed state.
 *
 * Two independent concerns, deliberately not merged:
 *
 * - `collapsed` — desktop only. A preference, so it persists across sessions;
 *   an operator who collapsed the rail once should not have to do it again on
 *   every page load.
 * - `mobileOpen` — an overlay drawer. Never persisted, because a drawer that
 *   was open when you left should not be open when you return.
 *
 * The initial read happens in a layout effect rather than useState's
 * initialiser: touching localStorage during render would make the server and
 * client markup disagree and produce a hydration mismatch.
 */
// React warns that a layout effect does nothing on the server, so on the server
// this is `useEffect` — which also does nothing there, but silently. In the
// browser it stays a layout effect, which is the point: the stored preference is
// applied before paint, so a collapsed rail never flashes open first.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

export function useSidebarState() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [hydrated, setHydrated] = React.useState(false)

  useIsomorphicLayoutEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === '1')
    setHydrated(true)

    const mq = window.matchMedia(MOBILE_QUERY)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }, [])

  // Cmd/Ctrl+B is the convention across editors and most dashboards, so it is
  // the shortcut people already try. Ignored while typing, so it cannot fire
  // from a search field or the client switcher's filter.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'b') return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [contenteditable="true"]')) return
      event.preventDefault()
      if (window.matchMedia(MOBILE_QUERY).matches) setMobileOpen((v) => !v)
      else toggleCollapsed()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleCollapsed])

  // Escape closes the drawer, and body scroll is locked while it is open so the
  // page behind cannot be scrolled by a stray swipe.
  React.useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  return {
    /** Desktop rail is collapsed. Always false until hydration, to match SSR. */
    collapsed: hydrated ? collapsed : false,
    toggleCollapsed,
    mobileOpen,
    setMobileOpen,
    isMobile,
    hydrated,
  }
}
