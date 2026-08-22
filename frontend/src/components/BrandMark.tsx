import { BookHeart } from 'lucide-react'

export function BrandMark() {
  return (
    <div className="mb-6 flex flex-col items-center gap-2 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <BookHeart className="size-5" />
      </div>
      <span className="text-lg font-semibold tracking-tight">CMR Weekly Digital Diary</span>
    </div>
  )
}
