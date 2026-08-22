import { useState, type ComponentType } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock, LayoutDashboard, TrendingUp, Users } from 'lucide-react'
import { api } from '@/lib/api'
import type { WeeklyStats } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

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
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminDashboardPage() {
  const [week, setWeek] = useState<number | null>(null)

  const { data: settings } = useQuery({
    queryKey: ['course-settings'],
    queryFn: () => api.get<{ settings: { total_weeks: number } }>('/admin/course-settings'),
  })

  const { data: stats, isLoading } = useQuery({
    queryKey: ['weekly-stats', week],
    queryFn: () => api.get<WeeklyStats>(`/admin/stats/weekly${week ? `?week=${week}` : ''}`),
  })

  const totalWeeks = settings?.settings.total_weeks ?? 12

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="size-5 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Submission overview across the cohort.</p>
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
              accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Week {stats.week} progress</CardTitle>
              <CardDescription>
                {stats.submitted} of {stats.totalStudents} students have submitted so far.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={stats.submissionRate} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
