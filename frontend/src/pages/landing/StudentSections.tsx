import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { ArrowRight, BarChart3, Lock, PenLine, Save, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { HoverCard, SectionHeading } from './shared'

const FEATURES: { title: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  {
    title: 'A weekly space to reflect',
    description: "A dedicated page opens each week for free-form writing about your experiences, thoughts, and practice, with no rigid format required.",
    icon: PenLine,
  },
  {
    title: 'Never lose a draft',
    description: 'Your writing autosaves as you go, so a closed tab or a dropped connection never costs you your reflection.',
    icon: Save,
  },
  {
    title: 'Private by design',
    description: 'Entries are visible only to you and authorized CMR staff, never to other students, and never public.',
    icon: ShieldCheck,
  },
  {
    title: 'Track your journey',
    description: "See every week at a glance: what's open, what's submitted, and what still needs your attention.",
    icon: BarChart3,
  },
]

export function StudentFeaturesSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="For enrolled students"
          title="Your Weekly Digital Diary"
          description="Once you're part of the course, this portal is where you'll keep a private weekly reflection throughout the programme."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <HoverCard key={feature.title}>
              <CardContent className="flex gap-4 pt-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </HoverCard>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/login">
              <Lock className="size-4" />
              Sign in to your diary
            </Link>
          </Button>
          <Button size="lg" variant="ghost" asChild className="h-auto w-full py-2.5 whitespace-normal sm:w-auto sm:whitespace-nowrap">
            <Link to="/register">
              First time here? Create your account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function ConfidentialitySection() {
  return (
    <section className="relative overflow-hidden border-t py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex justify-center">
        <div className="aspect-square w-[28rem] rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <svg viewBox="0 0 64 64" className="mx-auto size-14 text-primary" aria-hidden>
          <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.1" />
          <path
            d="M32 14 L47 21 V31 C47 40 40.5 47.5 32 50 C23.5 47.5 17 40 17 31 V21 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M25 31.5 L30 36.5 L39.5 26.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Your entries are confidential</h2>
        <p className="mt-3 text-muted-foreground">
          Diary entries are only accessible to you and authorized CMR administrators or research personnel, never to
          other students, and never used or shared without appropriate consent.
        </p>
      </div>
    </section>
  )
}
