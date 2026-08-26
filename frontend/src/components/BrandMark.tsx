import cmrLogo from '@/assets/cmr-logo.png'

export function BrandMark() {
  return (
    <div className="mb-6 flex flex-col items-center gap-2 text-center">
      <img src={cmrLogo} alt="Centre for Meditation Research" className="size-16 rounded-full shadow-sm" />
      <span className="text-lg font-semibold tracking-tight">CMR Weekly Digital Diary</span>
      <span className="max-w-xs text-xs text-muted-foreground">
        Certificate Course on Translating the Science of Happiness and Meditation into Practice
      </span>
    </div>
  )
}
