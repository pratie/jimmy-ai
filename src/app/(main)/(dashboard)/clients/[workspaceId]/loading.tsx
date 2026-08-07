import {
  MetricsRowSkeleton,
  PageHeaderSkeleton,
  PageSkeletonShell,
  TableSkeleton,
} from '@/components/dashboard/ui/page-skeleton'

export default function Loading() {
  return (
    <PageSkeletonShell>
      <PageHeaderSkeleton />
      <MetricsRowSkeleton count={4} />
      <TableSkeleton rows={5} />
    </PageSkeletonShell>
  )
}
