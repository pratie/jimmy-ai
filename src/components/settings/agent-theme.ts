/**
 * The widget theme an agency edits, plus the colour maths the editor needs.
 *
 * Split out of `test-and-customise` so the live test panel can be its own
 * component without either file importing the other's runtime values.
 */

export type Theme = {
  primary: string
  surface: string
  text: string
  headerBg: string
  headerText: string
  userBubbleBg: string
  userBubbleText: string
  botBubbleBg: string
  botBubbleText: string
  inputBg: string
  inputBorder: string
  accent: string
  radius: number
  shadow: 'none' | 'sm'
}

export const DEFAULT_THEME: Theme = {
  primary: '#1DA1F2',
  surface: '#FFFFFF',
  text: '#111827',
  headerBg: '#FFFFFF',
  headerText: '#111827',
  userBubbleBg: '#1DA1F2',
  userBubbleText: '#FFFFFF',
  botBubbleBg: '#F3F4F6',
  botBubbleText: '#111827',
  inputBg: '#FFFFFF',
  inputBorder: '#D1D5DB',
  accent: '#1DA1F2',
  radius: 10,
  shadow: 'sm',
}

export const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function toRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ]
}

/** Relative luminance, WCAG definition. */
export function luminance(hex: string): number {
  const channels = toRgb(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** Black or white, whichever stays readable on `hex`. The agency picks one
 *  brand colour; making them separately pick legible text on top of it is the
 *  kind of decision software should make for them. */
export function readableOn(hex: string): string {
  return luminance(hex) > 0.5 ? '#111827' : '#FFFFFF'
}

/** `hex` blended toward white by `amount` (0–1) — used for the tinted bubble
 *  style, so the assistant's own bubbles can carry the brand without shouting. */
function tint(hex: string, amount: number): string {
  const [r, g, b] = toRgb(hex)
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount)
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

export type BubbleStyle = 'light' | 'tinted' | 'dark'

export const BUBBLE_STYLES: { key: BubbleStyle; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'tinted', label: 'Tinted' },
  { key: 'dark', label: 'Dark' },
]

export function bubbleColors(
  style: BubbleStyle,
  brand: string
): Pick<Theme, 'botBubbleBg' | 'botBubbleText'> {
  if (style === 'dark') return { botBubbleBg: '#1E293B', botBubbleText: '#FFFFFF' }
  if (style === 'tinted') {
    const bg = HEX.test(brand) ? tint(brand, 0.88) : '#F3F4F6'
    return { botBubbleBg: bg, botBubbleText: '#111827' }
  }
  return { botBubbleBg: '#F1F5F9', botBubbleText: '#111827' }
}

/** Which of the three presets the current colours correspond to, so reopening
 *  the panel shows the choice that is actually in effect rather than a default. */
export function detectBubbleStyle(theme: Theme): BubbleStyle {
  if (luminance(theme.botBubbleBg) < 0.4) return 'dark'
  if (
    theme.botBubbleBg.toLowerCase() ===
    bubbleColors('tinted', theme.primary).botBubbleBg.toLowerCase()
  )
    return 'tinted'
  return 'light'
}
