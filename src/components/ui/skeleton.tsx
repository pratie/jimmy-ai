import { cn } from '@/lib/utils'

/**
 * A placeholder block for content that has not arrived yet.
 *
 * Deliberately unlabelled and low-contrast: a skeleton's job is to hold the
 * layout still so the page does not jump when data lands, not to draw the eye.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export { Skeleton }
