import { Skeleton } from '@/components/ui/skeleton'

export function PageLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
