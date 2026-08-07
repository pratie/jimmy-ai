import InfoBar from '@/components/infobar'
import { Skeleton } from '@/components/ui/skeleton'

/** Mirrors the inbox's two-column split so the panes do not jump into place. */
export default function Loading() {
  return (
    <>
      <InfoBar />
      <div className="min-h-0 flex-1 p-4 md:p-6">
        <div className="grid h-full gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-9 w-full rounded-lg" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg p-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-2.5 w-full" />
              </div>
            ))}
          </div>
          <div className="hidden rounded-xl border border-border bg-card p-6 lg:block">
            <Skeleton className="h-4 w-40" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-14 w-3/5 rounded-xl" />
              <Skeleton className="ml-auto h-14 w-2/5 rounded-xl" />
              <Skeleton className="h-14 w-1/2 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
