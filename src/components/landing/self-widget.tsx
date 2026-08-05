'use client'

import * as React from 'react'

declare global {
  interface Window {
    bml?: (...args: unknown[]) => void
    __bml_embed_loaded__?: boolean
  }
}

/**
 * ChatDock's own assistant — marketing pages only.
 *
 * Deliberately does NOT use `next/script`. Two behaviours make that unworkable
 * here, and both were observed rather than assumed:
 *
 * 1. `embed.min.js` appends its iframe straight to `document.body`, outside
 *    React's tree, and sets a `__bml_embed_loaded__` guard so it never boots
 *    twice. A client-side navigation therefore unmounts the component but
 *    leaves the widget on screen — the sales assistant following a signed-in
 *    customer into their dashboard.
 * 2. `next/script` injects a given `id` once per page load. Tearing the widget
 *    down and navigating back left the script already-loaded and the guard the
 *    only thing reset, so nothing re-mounted and the widget never returned.
 *
 * Owning the script element solves both: it is appended on mount, and on
 * unmount the embed is destroyed, the guard cleared and the tag removed, so a
 * return visit boots cleanly from scratch.
 */
export default function SelfWidget({ widgetKey }: { widgetKey: string }) {
  React.useEffect(() => {
    // Follows the app's own origin rather than hardcoding production, which
    // silently failed to load in local dev — and had it loaded, a developer's
    // page would have been driving the live widget.
    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

    const script = document.createElement('script')
    script.id = 'chatdock-self-widget'
    script.src = `${appOrigin}/embed.min.js`
    script.defer = true
    script.setAttribute('data-key', widgetKey)
    script.setAttribute('data-app-origin', appOrigin)
    script.setAttribute('data-margin', '24')
    script.setAttribute('data-size', 'md')
    document.body.appendChild(script)

    return () => {
      try {
        window.bml?.('destroy')
      } catch {
        /* the embed may not have finished booting; nothing to tear down */
      }
      // Both are required for a clean re-mount: the guard blocks a second boot,
      // and a stale tag would not re-execute on being re-appended.
      window.__bml_embed_loaded__ = undefined
      script.remove()
      document.querySelectorAll('iframe.bml-chat-frame').forEach((el) => el.remove())
    }
  }, [widgetKey])

  return null
}
