import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import {
  CMR_ABOUT_PARAGRAPHS,
  CMR_DEAN,
  CMR_DEAN_PHOTO,
  CMR_DIRECTOR,
  CMR_DIRECTOR_PHOTO,
  CMR_MISSION,
} from '@/lib/cmr-org-info'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { HoverCard, PersonChip, SectionHeading } from './shared'

export function AboutSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading eyebrow="About us" title="Centre for Meditation Research" />

        <HoverCard className="mt-10 border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground sm:text-base">{CMR_MISSION}</p>
          </CardContent>
        </HoverCard>

        <div className="mt-8 space-y-4 text-sm text-muted-foreground sm:text-base">
          {CMR_ABOUT_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <PersonChip name={CMR_DIRECTOR} role="Director" photo={CMR_DIRECTOR_PHOTO} />
            <PersonChip name={CMR_DEAN} role="Dean, Faculty of Medicine" photo={CMR_DEAN_PHOTO} />
          </div>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/board-members">
              Meet the Board
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
