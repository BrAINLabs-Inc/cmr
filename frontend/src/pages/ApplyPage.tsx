import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { PublicIntake } from '@/lib/types'
import { ApplyForm } from './apply/ApplyForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import cmrLogo from '@/assets/cmr-logo.png'

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
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={cmrLogo} alt="Centre for Meditation Research" className="size-8 rounded-full" />
            <span className="text-sm font-semibold tracking-tight sm:text-base">Centre for Meditation Research</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {!isLoading && !isOpen && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <h1 className="text-xl font-semibold">Applications are currently closed</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                There is no open intake accepting applications right now. Please check back soon, or contact CMR for
                more information.
              </p>
              <Button variant="outline" asChild className="mt-2">
                <Link to="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && isOpen && intake && !submitted && <ApplyForm intake={intake} onSubmitted={setSubmitted} />}

        {submitted && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <CheckCircle2 className="size-12 text-primary" />
              <h1 className="text-xl font-semibold">Application received</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                Your reference number is <span className="font-mono font-semibold text-foreground">{submitted}</span>.
                Please keep it for any follow-up with CMR. We'll be in touch after reviewing your application.
              </p>
              <Button variant="outline" asChild className="mt-2">
                <Link to="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
