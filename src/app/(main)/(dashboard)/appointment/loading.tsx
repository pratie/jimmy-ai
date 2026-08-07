import InfoBar from '@/components/infobar'
import { MetricsRowSkeleton, PageSkeletonShell, TableSkeleton } from '@/components/dashboard/ui/page-skeleton'

export default function Loading() {
  return (
    <>
      <InfoBar />
      <PageSkeletonShell>
        <MetricsRowSkeleton count={3} />
        <TableSkeleton rows={6} />
      </PageSkeletonShell>
    </>
  )
}
