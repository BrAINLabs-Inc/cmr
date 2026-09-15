import { BadgeCheck, Brain, Calendar, CheckCircle2, Clock, GraduationCap, Heart, Palette, Scale, Sparkles } from 'lucide-react'
import type { PublicIntake } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CardContent } from '@/components/ui/card'
import { HoverCard, SectionHeading } from './shared'

const MODULE_ICONS = [Heart, Sparkles, Brain, Palette, GraduationCap, Scale]

export function ClosedNotice({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <section className="py-16">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="text-xl font-semibold">Applications are currently closed</h2>
        <p className="mt-2 text-muted-foreground">
          There is no open intake right now. Please check back soon, or reach out via the contact details below.
        </p>
      </div>
    </section>
  )
}

export function ModulesSection({ intake }: { intake: PublicIntake | null }) {
  if (!intake || intake.modules.length === 0) return null
  return (
    <section className="border-y bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Curriculum" title="Course Modules" description={`The course comprises ${intake.modules.length} modules.`} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {intake.modules.map((module, i) => {
            const Icon = MODULE_ICONS[i] ?? BadgeCheck
            return (
              <HoverCard key={module} className="relative overflow-visible">
                <div className="absolute -top-3 -left-3 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <CardContent className="flex gap-4 pt-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <p className="font-medium">{module}</p>
                </CardContent>
              </HoverCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function ObjectivesSection({ intake }: { intake: PublicIntake | null }) {
  if (!intake || intake.objectives.length === 0) return null
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="Why this course" title="General Objectives" />
        <div className="relative mt-10 space-y-6 pl-2">
          <div aria-hidden className="absolute top-1 bottom-1 left-[15px] w-px bg-border" />
          {intake.objectives.map((objective) => (
            <div key={objective} className="relative flex gap-4">
              <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
                <CheckCircle2 className="size-4" />
              </div>
              <span className="pt-1 text-muted-foreground">{objective}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EligibilityDurationSection({ intake }: { intake: PublicIntake | null }) {
  if (!intake) return null
  const hasEligibility = Boolean(intake.eligibility_text || intake.eligibility_special_category)
  const hasDuration = Boolean(intake.duration_text || intake.mode_text || intake.commencing_date)
  if (!hasEligibility && !hasDuration) return null

  return (
    <section className="border-y bg-muted/20 py-20">
      <div className={cn('mx-auto grid max-w-6xl gap-8 px-4 sm:px-6', hasEligibility && hasDuration ? 'lg:grid-cols-2' : 'max-w-3xl')}>
        {hasEligibility && (
          <HoverCard>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5 text-primary" />
                <h3 className="text-lg font-semibold">Who Can Apply?</h3>
              </div>
              {intake.eligibility_text && <p className="mt-4 text-sm text-muted-foreground">{intake.eligibility_text}</p>}
              {intake.eligibility_special_category && (
                <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">Special Category</p>
                  <p className="mt-1 text-muted-foreground">{intake.eligibility_special_category}</p>
                </div>
              )}
            </CardContent>
          </HoverCard>
        )}

        {hasDuration && (
          <HoverCard>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-primary" />
                <h3 className="text-lg font-semibold">Duration &amp; Mode</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {intake.duration_text && <li>{intake.duration_text}</li>}
                {intake.mode_text && <li>{intake.mode_text}</li>}
              </ul>
              {intake.commencing_date && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
                  <Calendar className="size-4 shrink-0 text-primary" />
                  <span>
                    Commencing <span className="font-medium text-foreground">{intake.commencing_date}</span>
                  </span>
                </div>
              )}
            </CardContent>
          </HoverCard>
        )}
      </div>
    </section>
  )
}
