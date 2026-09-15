import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react'
import type { PublicIntake } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { HoverCard } from './shared'

const HOME_ILLUSTRATION = '/vectors/home1.webp'

function facts(intake: PublicIntake) {
  return [
    { label: 'Duration', value: intake.duration_text ?? '-', icon: Clock },
    { label: 'Mode', value: intake.mode_text ?? '-', icon: MapPin },
    { label: 'Lectures', value: intake.lecture_schedule_text ?? '-', icon: Calendar },
  ]
}

// Calm, meditation-evoking backdrop for the hero only: a soft two-tone
// gradient wash, a faint dot-grid that fades toward the edges (a common
// refined editorial/SaaS texture, kept subtle here rather than full-bleed),
// and concentric "ripple" rings. Deliberately not the colourful blurred
// blobs used elsewhere before (read as generic AI-template). No blur
// filters, no shadows; flat vector shapes and low opacity throughout.
function MindfulnessBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-emerald-500/[0.05]" />
      <div
        className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
      />
      <svg className="absolute -top-16 -right-16 size-[30rem] text-primary/[0.09] sm:-top-24 sm:-right-24 sm:size-[36rem]" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="35" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="99" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute -bottom-24 -left-20 size-80 text-emerald-600/[0.08] dark:text-emerald-400/[0.08]" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="99" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}

export function HeroSection({
  intake,
  intakeLoading,
  courseTitle,
}: {
  intake: PublicIntake | null
  intakeLoading: boolean
  courseTitle: string
}) {
  return (
    <section className="relative overflow-hidden border-b bg-muted/20">
      <MindfulnessBackdrop />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          {intakeLoading && <Skeleton className="mx-auto h-6 w-48 lg:mx-0" />}
          {!intakeLoading && intake && (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <Badge className="rounded-full px-3 py-1">
                {intake.intake_number} Intake · {intake.status === 'open' ? 'Now On' : intake.status === 'upcoming' ? 'Upcoming' : 'Closed'}
              </Badge>
              {intake.application_closing_date && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-amber-700 dark:text-amber-400">
                  {intake.closing_date_note ? `Closing Date ${intake.closing_date_note}: ` : 'Closes: '}
                  {intake.application_closing_date}
                </Badge>
              )}
            </div>
          )}
          {!intakeLoading && !intake && (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Applications currently closed
              </Badge>
            </div>
          )}

          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Certificate Course</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{courseTitle}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-muted-foreground sm:text-lg lg:mx-0">
            Centre for Meditation Research · Faculty of Medicine · University of Colombo
          </p>
          {intake?.funded_by && <p className="mt-2 text-sm text-muted-foreground">Funded by {intake.funded_by}</p>}

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/apply">
                {intake && intake.status === 'open' ? 'Apply Now' : 'Applications Closed'}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-auto w-full py-2.5 whitespace-normal sm:w-auto sm:whitespace-nowrap">
              <Link to="/login">Already enrolled? Sign in to your diary</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <img src={HOME_ILLUSTRATION} alt="" className="mx-auto w-full max-w-md" />
        </div>
      </div>

      {intake && (
        <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {facts(intake).map((fact) => (
              <HoverCard key={fact.label} className="bg-background">
                <CardContent className="flex flex-col items-center gap-2.5 pt-6 text-center">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <fact.icon className="size-5" />
                  </div>
                  <p className="text-sm font-medium">{fact.value}</p>
                  <p className="text-xs text-muted-foreground">{fact.label}</p>
                </CardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
