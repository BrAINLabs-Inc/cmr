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
import sliitLogo from '@/assets/partners/sliit-logo.svg'
import imuLogo from '@/assets/partners/imu-university-logo.png'
import harvardLogo from '@/assets/partners/harvard-medical-school-shield.png'
import brainLabsLogo from '@/assets/brainlabs-logo.webp'

const COLLABORATING_PARTNERS = [
  { name: 'SLIIT', logo: sliitLogo, url: 'https://www.sliit.lk/' },
  { name: 'Brain Labs', logo: brainLabsLogo, url: 'https://brainlabsinc.org/' },
  { name: 'IMU Malaysia', logo: imuLogo },
  { name: 'Harvard Medical School', logo: harvardLogo },
]

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
            <PersonChip name={CMR_DEAN} role="Senior Advisory Board Member" photo={CMR_DEAN_PHOTO} />
          </div>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <a href="https://med.cmb.ac.lk/cmr/board-members/" target="_blank" rel="noopener noreferrer">
              Meet the Board
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>

        <div className="mt-10">
          <p className="text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Collaborating Partners
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            {COLLABORATING_PARTNERS.map((partner) => {
              const tile = (
                <div className="flex h-16 w-32 items-center justify-center rounded-lg border bg-white p-3 sm:w-36">
                  <img src={partner.logo} alt={partner.name} title={partner.name} className="max-h-full max-w-full object-contain" />
                </div>
              )
              return partner.url ? (
                <a key={partner.name} href={partner.url} target="_blank" rel="noopener noreferrer">
                  {tile}
                </a>
              ) : (
                <div key={partner.name}>{tile}</div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
