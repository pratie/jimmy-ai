/**
 * ChatDock dashboard design tokens.
 *
 * The dashboard previously reached straight for default Tailwind values —
 * slate-200 borders, indigo-50 tints, one heavy radius on every container — which
 * is what makes an interface read as generic. These are the deliberate values,
 * mirrored into `tailwind.config.ts` as `cd-*` utilities so components can use
 * them without importing anything.
 *
 * Every text colour here was measured against the surface it sits on. `muted` is
 * the lightest value permitted for body copy; `faint` is metadata only and never
 * carries meaning on its own.
 */

export const cd = {
  /** Application background — a cool off-white, so white surfaces read as raised. */
  canvas: '#F6F7F9',
  surface: '#FFFFFF',
  /** Inset wells: search bars, code blocks, empty slots. */
  sunken: '#F1F3F7',

  ink: '#0C1424', // headings                     17.0:1 on surface
  body: '#3D4A61', // body copy                     9.1:1
  muted: '#647087', // secondary — AA floor for text 5.3:1
  faint: '#8A94A6', // metadata only                 3.2:1

  line: '#E3E7EE',
  lineStrong: '#CBD2DE',

  /**
   * Reserved: primary action, active nav, focus, progress, selected data.
   *
   * This is the same purple as `--primary` and as the marketing site. It used
   * to be indigo-600, which meant the dashboard shipped a second, near-miss
   * brand colour — the kind of half-shade difference that reads as sloppy
   * rather than as a decision.
   */
  accent: '#5B5CE2',
  accentHover: '#4A4BD0',
  accentSoft: '#EEF0FF',
  accentLine: '#C7CBF5',

  success: '#0F7B55',
  successSoft: '#E7F6EF',
  warning: '#B45309',
  warningSoft: '#FEF5E7',
  danger: '#B42318',
  dangerSoft: '#FEECEB',

  /** Sidebar — deep ink, not pure black, so it sits with the accent. */
  navy: '#0E1524',
  navyRaised: '#18203214',
} as const

/** Radii. Deliberately three values, not one heavy default everywhere. */
export const radius = {
  control: '10px', // inputs, buttons
  card: '12px', // cards, panels
  panel: '14px', // page-level containers
} as const

/**
 * Elevation, used only where a surface genuinely floats above another —
 * dropdowns, drawers, popovers. Cards use border + background contrast instead,
 * which is what stops a page looking like a pile of floating rectangles.
 */
export const elevation = {
  dropdown: '0 8px 24px -8px rgba(12, 20, 36, 0.18)',
  drawer: '0 24px 60px -24px rgba(12, 20, 36, 0.35)',
} as const

/** Status vocabulary shared by every surface that renders a client or assistant. */
export type ClientStatus =
  | 'draft'
  | 'indexing'
  | 'ready_to_install'
  | 'live'
  | 'paused'
  | 'attention'
  | 'archived'

export const STATUS_META: Record<
  ClientStatus,
  { label: string; fg: string; bg: string; dot: string }
> = {
  draft: { label: 'Draft', fg: cd.muted, bg: cd.sunken, dot: cd.faint },
  indexing: { label: 'Indexing', fg: cd.accent, bg: cd.accentSoft, dot: cd.accent },
  ready_to_install: { label: 'Ready to install', fg: cd.warning, bg: cd.warningSoft, dot: cd.warning },
  live: { label: 'Live', fg: cd.success, bg: cd.successSoft, dot: cd.success },
  paused: { label: 'Paused', fg: cd.muted, bg: cd.sunken, dot: cd.faint },
  attention: { label: 'Attention needed', fg: cd.danger, bg: cd.dangerSoft, dot: cd.danger },
  archived: { label: 'Archived', fg: cd.faint, bg: cd.sunken, dot: cd.faint },
}

/**
 * Derives the single status that best describes a client right now.
 *
 * Order matters: a published assistant with no indexed content is *not* live in
 * any useful sense — it will decline every question — so that case resolves to
 * `attention` rather than looking healthy.
 */
export function deriveClientStatus(input: {
  assistantStatus: string | null
  knowledgeChunks: number
  syncing?: boolean
  archived?: boolean
}): ClientStatus {
  if (input.archived) return 'archived'
  if (input.syncing) return 'indexing'
  if (!input.assistantStatus) return 'draft'
  if (input.assistantStatus === 'published' && input.knowledgeChunks === 0) return 'attention'
  if (input.assistantStatus === 'published') return 'live'
  if (input.assistantStatus === 'paused') return 'paused'
  if (input.knowledgeChunks > 0) return 'ready_to_install'
  return 'draft'
}
