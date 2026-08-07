import InfoBar from '@/components/infobar'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <InfoBar />
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-4 px-5 py-5 md:px-8 md:py-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-2.5 w-72" />
            <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
          </div>
        ))}
      </div>
    </>
  )
}
