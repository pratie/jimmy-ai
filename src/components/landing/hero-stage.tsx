'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

import HeroPipeline from './hero-pipeline'

/**
 * Chooses how the hero pipeline is drawn.
 *
 * The CSS version is the default and the guaranteed one. A Rive rendering is
 * used only when `NEXT_PUBLIC_HERO_RIVE_SRC` points at a real `.riv` file.
 *
 * Two reasons it is gated rather than simply preferred:
 *
 * 1. `.riv` assets are authored in Rive's editor and cannot be produced from
 *    code. Importing the runtime unconditionally would add a WASM payload to
 *    every landing-page visit in exchange for a blank canvas.
 * 2. If the asset 404s, is corrupt, or the runtime fails on an old browser, the
 *    hero must still tell its story. `onFail` drops back to the CSS version,
 *    which costs nothing and always works.
 *
 * The dynamic import means the runtime is a separate chunk fetched only when
 * the env var is set — with it unset, nothing about the current page changes.
 */

const HeroRive = dynamic(() => import('./hero-rive'), {
  ssr: false,
  // While the chunk loads, show the CSS hero rather than a gap. Both occupy the
  // same fixed height, so the swap cannot shift the CTAs beside it.
  loading: () => <HeroPipeline />,
})

export default function HeroStage() {
  const src = process.env.NEXT_PUBLIC_HERO_RIVE_SRC
  const [failed, setFailed] = React.useState(false)

  if (!src || failed) return <HeroPipeline />

  return (
    <div className="w-full">
      <HeroRive src={src} onFail={() => setFailed(true)} />
    </div>
  )
}
