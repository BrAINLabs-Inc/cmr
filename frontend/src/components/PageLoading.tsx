import { Skeleton } from '@/components/ui/skeleton'
import { StatCardSkeleton } from '@/components/Skeletons'

// Generic route-level fallback (shown very briefly while a lazy page
// chunk loads). Shaped like the icon+title header and stat-card row that
// most admin/student pages open with, rather than one flat block.
export function PageLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-64" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
