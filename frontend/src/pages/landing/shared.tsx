import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
      <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
    </div>
  )
}

export function WaveDivider({ flip }: { flip?: boolean }) {
  return (
    <div aria-hidden className={cn('relative h-12 w-full overflow-hidden bg-background sm:h-16', flip && 'bg-muted')}>
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className={cn('absolute inset-0 h-full w-full text-muted', flip && 'text-background')}
      >
        <path d="M0,40 C280,95 520,10 760,35 C1020,62 1200,12 1440,45 L1440,100 L0,100 Z" fill="currentColor" />
      </svg>
    </div>
  )
}

export function HoverCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Card className={cn('transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5', className)}>
      {children}
    </Card>
  )
}
