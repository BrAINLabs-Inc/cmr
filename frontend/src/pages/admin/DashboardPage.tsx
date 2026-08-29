import { useState, type ComponentType } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, CheckCircle2, Clock, Flower2, HeartHandshake, LayoutDashboard, TrendingUp, Users } from 'lucide-react'
import { api } from '@/lib/api'
import type { Admin, CheckinCohortStats, MoodFeeling, WeeklyStats } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { MOOD_LABELS, moodClassName, moodIcon } from '@/lib/mood'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

type CourseSettings = {
  total_weeks: number
  intake: { intake_number: number } | null
}

type StatsOverview = {
  currentWeek: number
  totalStudents: number
  weeks: { week: number; submitted: number; submissionRate: number }[]
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', accent)}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function WeeklyTrendChart({ overview }: { overview: StatsOverview }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const weeks = overview.weeks
  const showEveryLabel = weeks.length <= 15
  const labelStep = Math.max(1, Math.ceil(weeks.length / 15))

  if (weeks.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No weeks have opened yet.</p>
  }

  return (
    <div>
      <div className="relative h-44 pl-9 sm:h-52">
        <div className="absolute inset-y-0 left-9 right-0 flex flex-col justify-between">
          {[100, 75, 50, 25, 0].map((v) => (
            <div key={v} className="relative h-px w-full bg-border">
              <span className="absolute -left-9 -top-2 w-7 text-right text-[10px] tabular-nums text-muted-foreground">
                {v}%
              </span>
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-9 right-0 flex items-end gap-1">
          {weeks.map((w) => {
            const isCurrent = w.week === overview.currentWeek
            const isHovered = hovered === w.week
            return (
              <div
                key={w.week}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setHovered(w.week)}
                onMouseLeave={() => setHovered(null)}
              >
                {isHovered && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md">
                    <span className="font-medium">Week {w.week}:</span> {w.submitted}/{overview.totalStudents}{' '}
                    submitted ({w.submissionRate}%)
                  </div>
                )}
                <div
                  className={cn(
                    'w-full rounded-t-sm transition-colors',
                    isCurrent ? 'bg-primary' : isHovered ? 'bg-primary/60' : 'bg-primary/25'
                  )}
                  style={{ height: `${Math.max(w.submissionRate, 2)}%` }}
                />
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-1.5 flex gap-1 pl-9">
        {weeks.map((w) => (
          <div key={w.week} className="flex-1 text-center text-[10px] text-muted-foreground tabular-nums">
            {showEveryLabel || w.week % labelStep === 0 || w.week === overview.currentWeek ? w.week : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { profile } = useAuth()
  const admin = profile as Admin
  const [week, setWeek] = useState<number | null>(null)

  const { data: settings } = useQuery({
    queryKey: ['course-settings'],
    queryFn: () => api.get<{ settings: CourseSettings }>('/admin/course-settings'),
  })

  const { data: stats, isLoading } = useQuery({
    queryKey: ['weekly-stats', week],
    queryFn: () => api.get<WeeklyStats>(`/admin/stats/weekly${week ? `?week=${week}` : ''}`),
  })

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['stats-overview'],
    queryFn: () => api.get<StatsOverview>('/admin/stats/overview'),
  })

  const { data: checkinStats, isLoading: checkinStatsLoading } = useQuery({
    queryKey: ['checkin-cohort-stats'],
    queryFn: () => api.get<CheckinCohortStats>('/admin/stats/checkins'),
  })

  const totalWeeks = settings?.settings.total_weeks ?? 12

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="size-5 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground">
              Submission overview across the cohort
              {settings?.settings.intake ? ` (Intake ${settings.settings.intake.intake_number})` : ''}.
            </p>
          </div>
        </div>
        <Select value={String(stats?.week ?? '')} onValueChange={(v) => setWeek(Number(v))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
              <SelectItem key={w} value={String(w)}>
                Week {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading || !stats ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Total Students"
              value={stats.totalStudents}
              icon={Users}
              accent="bg-sky-500/10 text-sky-600 dark:text-sky-400"
            />
            <StatCard
              label={`Submitted (Week ${stats.week})`}
              value={stats.submitted}
              icon={CheckCircle2}
              accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={Clock}
              accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
            <StatCard
              label="Submission Rate"
              value={`${stats.submissionRate}%`}
              icon={TrendingUp}
              accent="bg-primary/10 text-primary"
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <CardTitle className="text-base">Submission rate by week</CardTitle>
              </div>
              <CardDescription>Percentage of active students submitted, week over week.</CardDescription>
            </CardHeader>
            <CardContent>
              {overviewLoading || !overview ? (
                <Skeleton className="h-52 w-full" />
              ) : (
                <WeeklyTrendChart overview={overview} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <HeartHandshake className="size-4 text-primary" />
                <CardTitle className="text-base">Cohort Well-being</CardTitle>
              </div>
              <CardDescription>Optional weekly check-ins: meditation and mood, cohort-wide.</CardDescription>
            </CardHeader>
            <CardContent>
              {checkinStatsLoading || !checkinStats ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border bg-muted/30 px-4 py-3">
                    <p className="text-xl font-semibold tabular-nums">
                      {checkinStats.checkedIn}/{checkinStats.totalStudents}{' '}
                      <span className="text-sm font-normal text-muted-foreground">({checkinStats.checkinRate}%)</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Checked in this week</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xl font-semibold tabular-nums">
                      <Flower2 className="size-4 text-primary" />
                      {checkinStats.meditated}/{checkinStats.totalStudents}{' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({checkinStats.meditationRate}%)
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">Meditated this week</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-4 py-3">
                    {(() => {
                      const top = Object.entries(checkinStats.moodCounts).sort((a, b) => b[1] - a[1])[0]
                      if (!top || top[1] === 0) return <p className="text-xl font-semibold">-</p>
                      const feeling = top[0] as MoodFeeling
                      const MoodIcon = moodIcon(feeling)
                      return (
                        <p className="flex items-center gap-1.5 text-xl font-semibold">
                          <MoodIcon className={cn('size-5', moodClassName(feeling))} />
                          {MOOD_LABELS[feeling]}
                        </p>
                      )
                    })()}
                    <p className="mt-0.5 text-xs text-muted-foreground">Most common mood</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
