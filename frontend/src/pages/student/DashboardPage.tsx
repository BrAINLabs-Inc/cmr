import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, Circle, PencilLine, Sparkles, Timer } from 'lucide-react'
import { api } from '@/lib/api'
import type { Student, WeekSummary, WeeksResponse } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const WRITING_ILLUSTRATION = '/vectors/writing.webp'

const STATUS_META = {
  submitted: { icon: CheckCircle2, label: 'Submitted', className: 'text-emerald-600 dark:text-emerald-400' },
  draft: { icon: PencilLine, label: 'Draft saved', className: 'text-amber-600 dark:text-amber-400' },
  not_started: { icon: Circle, label: 'Not submitted', className: 'text-muted-foreground' },
} as const

function daysRemaining(dueDate: string) {
  const due = new Date(`${dueDate}T23:59:59`)
  const ms = due.getTime() - Date.now()
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}

function WeekRow({ week }: { week: WeekSummary }) {
  const meta = week.isLocked
    ? { icon: AlertTriangle, label: 'Missed', className: 'text-destructive' }
    : STATUS_META[week.status]
  return (
    <Link
      to={`/diary/${week.weekNumber}`}
      className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-accent/50"
    >
      <div className="flex items-center gap-3">
        <meta.icon className={`size-5 ${meta.className}`} />
        <span className="font-medium">Week {week.weekNumber}</span>
        {week.isCurrent && (
          <Badge variant="outline" className="border-primary/40 text-primary">
            Current
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{meta.label}</span>
        <Button variant="ghost" size="sm" asChild>
          <span>{week.status === 'submitted' || week.isLocked ? 'View' : 'Write'}</span>
        </Button>
      </div>
    </Link>
  )
}

export function DashboardPage() {
  const { profile } = useAuth()
  const student = profile as Student
  const { data, isLoading } = useQuery({
    queryKey: ['weeks'],
    queryFn: () => api.get<WeeksResponse>('/diary/weeks'),
  })

  const openWeeks = data?.weeks.filter((w) => w.isOpen) ?? []
  const submittedCount = openWeeks.filter((w) => w.status === 'submitted').length
  const currentWeek = data?.weeks.find((w) => w.isCurrent)
  const remaining = currentWeek ? daysRemaining(currentWeek.dueDate) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {student?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-muted-foreground">Here's where your weekly reflection stands.</p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="overflow-hidden border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between gap-4">
              <div className="space-y-3">
                <CardDescription>This week</CardDescription>
                <CardTitle className="text-2xl">Week {data?.currentWeek}</CardTitle>
                <p className="text-sm text-muted-foreground">Write your diary for this week.</p>
                {currentWeek && currentWeek.status !== 'submitted' && remaining !== null && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Timer className="size-3.5" />
                    Due {new Date(`${currentWeek.dueDate}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    {' · '}
                    {remaining > 0 ? `${remaining} day${remaining === 1 ? '' : 's'} remaining` : 'Due today'}
                  </p>
                )}
                {currentWeek && (
                  <Button asChild className="whitespace-normal text-left">
                    <Link to={`/diary/${data?.currentWeek}`}>
                      {currentWeek.status === 'submitted'
                        ? 'View This Week’s Diary'
                        : currentWeek.status === 'draft'
                          ? 'Continue This Week’s Diary'
                          : "Write This Week's Diary"}
                    </Link>
                  </Button>
                )}
              </div>
              <img
                src={WRITING_ILLUSTRATION}
                alt=""
                className="hidden h-24 w-24 shrink-0 object-contain lg:block"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Weeks completed</CardDescription>
              <CardTitle className="text-2xl">
                {submittedCount} <span className="text-base font-normal text-muted-foreground">/ {openWeeks.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={openWeeks.length ? (submittedCount / openWeeks.length) * 100 : 0} />
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Diary</CardTitle>
          <CardDescription>Every week opens once the course reaches it. Write, save a draft, or review what you submitted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <Skeleton className="h-40 w-full" />}
          {openWeeks.map((w) => (
            <WeekRow key={w.weekNumber} week={w} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
