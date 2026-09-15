import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Flame,
  HeartHandshake,
  History,
  PencilLine,
  Sparkles,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { api } from '@/lib/api'
import type { MeditationStats, Student, WeekSummary, WeeksResponse } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCardSkeleton } from '@/components/Skeletons'

const WRITING_ILLUSTRATION = '/vectors/writing.webp'
const RECENT_WEEKS_LIMIT = 6

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

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function diaryStreak(weeks: WeekSummary[], currentWeek: number) {
  let streak = 0
  for (let w = currentWeek; w >= 1; w--) {
    const week = weeks.find((x) => x.weekNumber === w)
    if (week?.status === 'submitted') {
      streak += 1
      continue
    }
    if (w === currentWeek) continue
    break
  }
  return streak
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

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Flame
  label: string
  value: string
  accent: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', accent)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl leading-none font-semibold tabular-nums">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function weekTimelineStatus(week: WeekSummary) {
  if (week.status === 'submitted') return { label: 'Submitted', className: 'bg-emerald-500' }
  if (week.isLocked) return { label: 'Missed', className: 'bg-destructive/70' }
  if (week.status === 'draft') return { label: 'Draft', className: 'bg-amber-500' }
  if (week.isCurrent) return { label: 'Current', className: 'bg-primary' }
  return { label: 'Not started', className: 'bg-muted' }
}

function WeekTimeline({ weeks }: { weeks: WeekSummary[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {weeks.map((w) => {
        const meta = weekTimelineStatus(w)
        return (
          <Link
            key={w.weekNumber}
            to={`/diary/${w.weekNumber}`}
            title={`Week ${w.weekNumber}: ${meta.label}`}
            aria-label={`Week ${w.weekNumber}: ${meta.label}`}
            className={cn(
              'size-5 rounded-[6px] transition-transform hover:scale-110',
              meta.className,
              w.isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
          />
        )
      })}
    </div>
  )
}

function QuickLink({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string
  icon: typeof Flame
  title: string
  description: string
}) {
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function DashboardPage() {
  const { profile } = useAuth()
  const student = profile as Student
  const { data, isLoading } = useQuery({
    queryKey: ['weeks'],
    queryFn: () => api.get<WeeksResponse>('/diary/weeks'),
    // Week status can change out-of-band (admin starts the diary, grants
    // late access, or the week rolls over), so always refetch on visit.
    staleTime: 0,
  })
  const { data: checkinStats } = useQuery({
    queryKey: ['checkin-stats'],
    queryFn: () => api.get<MeditationStats>('/checkin/stats'),
  })

  const openWeeks = data?.weeks.filter((w) => w.isOpen) ?? []
  const submittedCount = openWeeks.filter((w) => w.status === 'submitted').length
  const currentWeek = data?.weeks.find((w) => w.isCurrent)
  const remaining = currentWeek ? daysRemaining(currentWeek.dueDate) : null
  const totalWords = openWeeks.reduce((sum, w) => sum + w.wordCount, 0)
  const streak = data ? diaryStreak(openWeeks, data.currentWeek) : 0
  const submissionRate = openWeeks.length ? Math.round((submittedCount / openWeeks.length) * 100) : 0
  const recentWeeks = [...openWeeks].reverse().slice(0, RECENT_WEEKS_LIMIT)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {student?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground">Here's where your weekly reflection stands.</p>
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-8 w-36" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full rounded-full" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCardSkeleton compact />
            <StatCardSkeleton compact />
            <StatCardSkeleton compact />
            <StatCardSkeleton compact />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1 h-3 w-64" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 24 }).map((_, i) => (
                  <Skeleton key={i} className="size-5 rounded-[6px]" />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCardSkeleton compact />
            <StatCardSkeleton compact />
          </div>
        </>
      ) : (
        <>
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
                <Progress value={submissionRate} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              icon={Flame}
              label="Reflection streak"
              value={`${streak} wk`}
              accent="bg-primary/10 text-primary"
            />
            <StatTile
              icon={TrendingUp}
              label="Words written"
              value={totalWords.toLocaleString()}
              accent="bg-sky-500/10 text-sky-600 dark:text-sky-400"
            />
            <StatTile
              icon={HeartHandshake}
              label="Check-in streak"
              value={`${checkinStats?.checkinStreak ?? 0} wk`}
              accent="bg-rose-500/10 text-rose-600 dark:text-rose-400"
            />
            <StatTile
              icon={CheckCircle2}
              label="Submission rate"
              value={`${submissionRate}%`}
              accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your Journey</CardTitle>
              <CardDescription>Every open week, at a glance. Click any square to jump in.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeekTimeline weeks={openWeeks} />
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px] bg-emerald-500" /> Submitted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px] bg-amber-500" /> Draft
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px] bg-destructive/70" /> Missed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px] bg-primary" /> Current
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px] bg-muted" /> Not started
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <QuickLink
              to="/checkin"
              icon={HeartHandshake}
              title="Weekly Check-in"
              description="Meditation, mood, and gratitude"
            />
            <QuickLink to="/previous" icon={History} title="Previous Entries" description="Browse your full history" />
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Weeks</CardTitle>
          <CardDescription>Every week opens once the course reaches it. Write, save a draft, or review what you submitted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          {recentWeeks.map((w) => (
            <WeekRow key={w.weekNumber} week={w} />
          ))}
          {openWeeks.length > RECENT_WEEKS_LIMIT && (
            <Button variant="ghost" asChild className="w-full">
              <Link to="/previous">View all {openWeeks.length} weeks</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
