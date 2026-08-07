import {
  CardGridSkeleton,
  MetricsRowSkeleton,
  PageHeaderSkeleton,
  PageSkeletonShell,
} from '@/components/dashboard/ui/page-skeleton'

/** The overview aggregates five counts across every client, so it is the
 *  slowest page in the product to first paint. */
export default function Loading() {
  return (
    <PageSkeletonShell>
      <PageHeaderSkeleton />
      <MetricsRowSkeleton count={5} />
      <CardGridSkeleton count={3} />
    </PageSkeletonShell>
  )
}
