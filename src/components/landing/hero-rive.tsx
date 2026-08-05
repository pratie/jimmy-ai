'use client'

import * as React from 'react'
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas'

/**
 * Rive rendering of the hero pipeline.
 *
 * Only mounted when `NEXT_PUBLIC_HERO_RIVE_SRC` is set — see `hero-stage.tsx`.
 * That gate matters: a `.riv` file is authored in Rive's editor and cannot be
 * generated from code, so without one this would ship a WASM runtime that draws
 * nothing. No asset, no import, no bytes.
 *
 * The animation is driven by the same beat sequence as the CSS hero rather than
 * running on its own clock, so both tell the identical story and the Rive
 * version cannot drift into showing a step the product does not have.
 *
 * ── Contract the .riv file must satisfy ────────────────────────────────────
 *   State machine:  "Pipeline"
 *   Number input:   "stage"   0–4, advanced by this component
 *   Trigger input:  "restart" fired when the loop wraps (optional)
 *
 * Stages, in order:
 *   0 URL entered · 1 pages discovered · 2 knowledge built ·
 *   3 assistant answering · 4 lead captured
 *
 * Anything missing is tolerated: a absent input is simply not driven, and a
 * failed load falls back to the CSS hero.
 */

const STATE_MACHINE = 'Pipeline'
const STAGE_COUNT = 5
const STAGE_MS = 2600

export default function HeroRive({
  src,
  onFail,
}: {
  src: string
  /** Called when the asset cannot load, so the caller can show the CSS hero. */
  onFail: () => void
}) {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: onFail,
  })

  const stage = useStateMachineInput(rive, STATE_MACHINE, 'stage', 0)

  React.useEffect(() => {
    if (!stage) return

    // Honour reduced motion by holding the final frame rather than looping.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage.value = STAGE_COUNT - 1
      rive?.pause()
      return
    }

    let current = 0
    const id = setInterval(() => {
      current = (current + 1) % STAGE_COUNT
      stage.value = current
    }, STAGE_MS)
    return () => clearInterval(id)
  }, [stage, rive])

  return (
    <RiveComponent
      className="h-[386px] w-full sm:h-[400px]"
      // The canvas is decorative relative to the copy beside it, which already
      // states everything this shows.
      aria-hidden="true"
    />
  )
}
