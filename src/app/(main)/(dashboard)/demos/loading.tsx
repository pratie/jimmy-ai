import { CardGridSkeleton, PageHeaderSkeleton, PageSkeletonShell } from '@/components/dashboard/ui/page-skeleton'

export default function Loading() {
  return (
    <PageSkeletonShell>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={3} />
    </PageSkeletonShell>
  )
}
