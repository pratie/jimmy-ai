import InfoBar from '@/components/infobar'
import { Skeleton } from '@/components/ui/skeleton'

/** Mirrors the workspace: a column of collapsed sections on the left, the live
 *  test chat pinned on the right. */
export default function Loading() {
  return (
    <>
      <InfoBar />
      <div className="w-full flex-1 h-0 overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-5 py-7 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-6 w-56 rounded-lg" />
              <Skeleton className="h-3.5 w-72 rounded" />
            </div>
            <Skeleton className="h-10 w-56 rounded-xl" />
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:items-start">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[60px] w-full rounded-xl" />
              <Skeleton className="h-[220px] w-full rounded-xl" />
              <Skeleton className="h-[60px] w-full rounded-xl" />
              <Skeleton className="h-[60px] w-full rounded-xl" />
              <Skeleton className="h-[60px] w-full rounded-xl" />
            </div>
            <Skeleton className="hidden h-[calc(100vh-100px)] w-full rounded-2xl lg:block" />
          </div>
        </div>
      </div>
    </>
  )
}
