import InfoBar from '@/components/infobar'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <InfoBar />
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-4 px-5 py-5 md:px-8 md:py-6">
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-2.5 w-64" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <Skeleton className="h-[420px] w-full rounded-xl" />
        </div>
      </div>
    </>
  )
}
