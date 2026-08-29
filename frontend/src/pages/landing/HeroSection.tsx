import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock, Flower2, Leaf, MapPin, Wallet, Wind } from 'lucide-react'
import type { PublicIntake } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { HoverCard } from './shared'

const HOME_ILLUSTRATION = '/vectors/home1.webp'

function facts(intake: PublicIntake) {
  return [
    { label: 'Duration', value: intake.duration_text ?? '—', icon: Clock },
    { label: 'Mode', value: intake.mode_text ?? '—', icon: MapPin },
    { label: 'Course Fee', value: intake.fee_course ?? '—', icon: Wallet },
    { label: 'Lectures', value: intake.lecture_schedule_text ?? '—', icon: Calendar },
  ]
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
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.35]" />
        <div className="absolute -top-40 left-[8%] aspect-square w-[36rem] rounded-full bg-primary/20 opacity-70 blur-3xl" />
        <div className="absolute top-10 right-[4%] aspect-square w-[26rem] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          {intakeLoading && <Skeleton className="mx-auto h-6 w-48 lg:mx-0" />}
          {!intakeLoading && intake && (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <Badge className="gap-1.5 rounded-full px-3 py-1">
                <span className="size-1.5 rounded-full bg-primary-foreground" />
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
          <svg aria-hidden viewBox="0 0 200 12" className="mx-auto mt-3 h-3 w-40 text-primary/40 lg:mx-0" preserveAspectRatio="none">
            <path d="M2,8 C40,0 70,10 100,6 C130,2 160,10 198,4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-muted-foreground sm:text-lg lg:mx-0">
            Centre for Meditation Research · Faculty of Medicine · University of Colombo
          </p>
          {intake?.funded_by && <p className="mt-2 text-sm text-muted-foreground">Funded by {intake.funded_by}</p>}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Button size="lg" asChild>
              <Link to="/apply">
                {intake && intake.status === 'open' ? 'Apply Now' : 'Applications Closed'}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Already enrolled? Sign in to your diary</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden className="pointer-events-none absolute inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />

          <img src={HOME_ILLUSTRATION} alt="" className="mx-auto w-full max-w-md" />

          <div
            aria-hidden
            className="animate-float absolute top-2 -left-2 flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-background/90 text-primary shadow-sm backdrop-blur sm:-left-6"
            style={{ animationDelay: '0s', animationDuration: '6s' }}
          >
            <Flower2 className="size-6" />
          </div>
          <div
            aria-hidden
            className="animate-float absolute top-8 right-2 flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-background/90 text-primary shadow-sm backdrop-blur sm:right-0"
            style={{ animationDelay: '1.1s', animationDuration: '7s' }}
          >
            <Leaf className="size-5" />
          </div>
          <div
            aria-hidden
            className="animate-float absolute bottom-4 left-6 flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-background/90 text-primary shadow-sm backdrop-blur sm:left-10"
            style={{ animationDelay: '0.6s', animationDuration: '6.5s' }}
          >
            <Wind className="size-6" />
          </div>
        </div>
      </div>

      {intake && (
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts(intake).map((fact) => (
              <HoverCard key={fact.label}>
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
