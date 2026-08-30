import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/people'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
      <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
    </div>
  )
}

// Plain, flat card: solid background, thin border, no blur/translucency/
// shadow. A subtle border-color shift on hover is enough affordance.
export function HoverCard({ className, children }: { className?: string; children: ReactNode }) {
  return <Card className={cn('transition-colors duration-150 hover:ring-primary/40', className)}>{children}</Card>
}

// Small round photo + name (+ optional role), used for board/leadership
// mentions. Falls back to initials automatically if the photo fails to load.
export function PersonChip({
  name,
  role,
  photo,
  size = 'default',
  className,
}: {
  name: string
  role?: string
  photo?: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const avatarSize = size === 'lg' ? 'size-20' : size === 'sm' ? 'size-8' : 'size-10'
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar className={cn(avatarSize, 'shrink-0')}>
        {photo && <AvatarImage src={photo} alt={name} />}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        {role && <p className="text-xs text-muted-foreground">{role}</p>}
      </div>
    </div>
  )
}
