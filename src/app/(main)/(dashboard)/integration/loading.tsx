import InfoBar from '@/components/infobar'
import { CardGridSkeleton, PageHeaderSkeleton, PageSkeletonShell } from '@/components/dashboard/ui/page-skeleton'

export default function Loading() {
  return (
    <>
      <InfoBar />
      <PageSkeletonShell>
        <PageHeaderSkeleton />
        <CardGridSkeleton count={2} />
      </PageSkeletonShell>
    </>
  )
}
