import InfoBar from '@/components/infobar'
import { PageHeaderSkeleton, PageSkeletonShell, TableSkeleton } from '@/components/dashboard/ui/page-skeleton'

export default function Loading() {
  return (
    <>
      <InfoBar />
      <PageSkeletonShell>
        <PageHeaderSkeleton />
        <TableSkeleton rows={8} />
      </PageSkeletonShell>
    </>
  )
}
