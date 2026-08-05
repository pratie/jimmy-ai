import { STATUS_META, type ClientStatus } from '@/lib/design-tokens'

/**
 * The single status vocabulary for clients and assistants.
 *
 * A dot plus a word, not a coloured pill alone — colour is never the only
 * carrier of meaning, so the badge still reads correctly in greyscale and for
 * anyone who cannot distinguish the hues.
 */
export default function StatusBadge({
  status,
  size = 'md',
}: {
  status: ClientStatus
  size?: 'sm' | 'md'
}) {
  const meta = STATUS_META[status]
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold ${
        size === 'sm' ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-[11.5px]'
      }`}
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.dot }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  )
}
