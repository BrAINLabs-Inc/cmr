import { Heart } from 'lucide-react'
import brainLabsIcon from '@/assets/brainlabs-icon.webp'

export function DevCredit() {
  return (
    <p className="mt-6 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
      Developed with
      <Heart className="size-3.5 fill-current text-red-500" />
      by
      <a
        href="https://brainlabsinc.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 font-medium text-foreground hover:underline"
      >
        <img src={brainLabsIcon} alt="" className="size-3.5 object-contain" />
        BrainLabs
      </a>
    </p>
  )
}
