import { useState, type ComponentType, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ClipboardList, Lock, Mail, MailCheck, UserCheck, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { PublicIntake } from '@/lib/types'
import { CMR_EMAIL } from '@/lib/cmr-org-info'
import { cn } from '@/lib/utils'
import { ApplyForm } from './apply/ApplyForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import cmrLogo from '@/assets/cmr-logo.png'

const APPLICATION_ILLUSTRATION = '/vectors/application.webp'

const NEXT_STEPS: { title: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  { title: 'Initial review', description: 'Our team checks your application and documents for completeness.', icon: ClipboardList },
  { title: 'Interview', description: "You'll be contacted to schedule an interview if shortlisted.", icon: UserCheck },
  { title: 'Outcome', description: "We'll email you the result once selection is complete.", icon: MailCheck },
]

// Shared shell for the "closed" and "submitted" states: an illustration
// panel beside the message, echoing the split-screen auth pages rather
// than a bare centered card. `tone` mutes and grays the artwork for the
// closed state so it doesn't read as identically upbeat as a success page.
function StatusSplitCard({ tone = 'success', children }: { tone?: 'success' | 'closed'; children: ReactNode }) {
  const isClosed = tone === 'closed'
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="grid md:grid-cols-2">
        <div
          className={cn(
            'relative hidden items-center justify-center overflow-hidden p-6 md:flex',
            isClosed ? 'bg-amber-500/5' : 'bg-primary/5'
          )}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"
          />
          <div
            aria-hidden
            className={cn('absolute inset-6 -z-10 rounded-full blur-3xl', isClosed ? 'bg-amber-500/10' : 'bg-primary/10')}
          />
          <div className="relative">
            <img
              src={APPLICATION_ILLUSTRATION}
              alt=""
              className={cn('w-full max-w-[480px] object-contain', isClosed && 'opacity-75 grayscale')}
            />
            {isClosed && (
              <span className="absolute -right-1 -bottom-1 flex size-12 items-center justify-center rounded-full border-4 border-card bg-amber-500 text-white shadow-sm">
                <Lock className="size-5" />
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-5 px-6 py-10 sm:px-10 sm:py-14">{children}</div>
      </div>
    </div>
  )
}

export function ApplyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-intake'],
    queryFn: () => api.get<{ intake: PublicIntake | null }>('/public/intake'),
  })

  const intake = data?.intake ?? null
  const isOpen = intake?.status === 'open'

  const [submitted, setSubmitted] = useState<string | null>(null)

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={cmrLogo} alt="Centre for Meditation Research" className="size-8 rounded-full" />
            <span className="text-sm font-semibold tracking-tight sm:text-base">Centre for Meditation Research</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        {isLoading && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-40" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-xl border bg-card p-4">
                <Skeleton className="h-5 w-40" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
            <Skeleton className="h-10 w-40" />
          </div>
        )}

        {!isLoading && !isOpen && !submitted && (
          <StatusSplitCard tone="closed">
            <Badge variant="outline" className="w-fit gap-1.5 rounded-full px-3 py-1 text-amber-700 dark:text-amber-400">
              <XCircle className="size-3.5" />
              Applications Closed
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Applications are currently closed</h1>
            <p className="text-sm text-muted-foreground">
              There is no open intake accepting applications right now. Please check back soon, or reach out below and
              we'll let you know as soon as the next intake opens.
            </p>

            <a
              href={`mailto:${CMR_EMAIL}`}
              className="flex items-center gap-2.5 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="size-4" />
              </span>
              <span>
                Want to be notified about the next intake? Email us at{' '}
                <span className="font-medium text-foreground">{CMR_EMAIL}</span>
              </span>
            </a>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/">Back to home</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://med.cmb.ac.lk/cmr/contacts-2/" target="_blank" rel="noopener noreferrer">
                  Contact us
                </a>
              </Button>
            </div>
          </StatusSplitCard>
        )}

        {!isLoading && isOpen && intake && !submitted && <ApplyForm intake={intake} onSubmitted={setSubmitted} />}

        {submitted && (
          <StatusSplitCard>
            <Badge className="w-fit gap-1.5 rounded-full px-3 py-1">
              <CheckCircle2 className="size-3.5" />
              Application Submitted
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Thank you, your application is in</h1>
            <p className="text-sm text-muted-foreground">
              We've received your application and will be in touch after reviewing it. Please keep your reference
              number for any follow-up with CMR.
            </p>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Your reference number</p>
              <p className="mt-1 font-mono text-lg font-semibold text-foreground">{submitted}</p>
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">What happens next</p>
              {NEXT_STEPS.map((step) => (
                <div key={step.title} className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" asChild>
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </StatusSplitCard>
        )}
      </main>
    </div>
  )
}
