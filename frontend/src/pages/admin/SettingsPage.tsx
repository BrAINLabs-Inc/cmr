import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  GraduationCap,
  Hourglass,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { Intake } from '@/lib/types'
import { useAdminIntakes } from '@/hooks/use-admin-intakes'
import { INTAKE_STATUS_LABEL } from '@/lib/intakes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

type CourseSettings = {
  course_start_date: string
  course_end_date: string
  total_weeks: number
  intake_id: string | null
  intake: Pick<Intake, 'id' | 'intake_number' | 'course_title' | 'status'> | null
  is_started: boolean
  started_at: string | null
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_WEEK = 7 * MS_PER_DAY
const NO_INTAKE_VALUE = 'none'

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'long' })
}

function daysUntil(value: string) {
  const target = new Date(`${value}T23:59:59`).getTime()
  return Math.ceil((target - Date.now()) / MS_PER_DAY)
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['course-settings'],
    queryFn: () => api.get<{ settings: CourseSettings }>('/admin/course-settings'),
  })
  const { data: intakesData } = useAdminIntakes()

  const [intakeId, setIntakeId] = useState<string>(NO_INTAKE_VALUE)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [togglingStart, setTogglingStart] = useState(false)

  useEffect(() => {
    if (data?.settings) {
      setIntakeId(data.settings.intake_id ?? NO_INTAKE_VALUE)
      setStartDate(data.settings.course_start_date)
      setEndDate(data.settings.course_end_date)
    }
  }, [data])

  const previewWeeks =
    startDate && endDate && endDate >= startDate
      ? Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / MS_PER_WEEK) + 1
      : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/admin/course-settings', {
        courseStartDate: startDate,
        courseEndDate: endDate,
        intakeId: intakeId === NO_INTAKE_VALUE ? null : intakeId,
      })
      toast.success('Course settings updated')
      queryClient.invalidateQueries({ queryKey: ['course-settings'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-stats'] })
      queryClient.invalidateQueries({ queryKey: ['weeks'] })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update course settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStart(nextStarted: boolean) {
    setTogglingStart(true)
    try {
      await api.post(`/admin/course-settings/${nextStarted ? 'start' : 'pause'}`)
      toast.success(nextStarted ? 'Diary approved and started' : 'Diary paused')
      queryClient.invalidateQueries({ queryKey: ['course-settings'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-stats'] })
      queryClient.invalidateQueries({ queryKey: ['weeks'] })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update diary status')
    } finally {
      setTogglingStart(false)
    }
  }

  const remaining = data?.settings ? daysUntil(data.settings.course_end_date) : null
  const linkedIntake = data?.settings.intake ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarRange className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Course Settings</h1>
          <p className="text-sm text-muted-foreground">
            Set the diary window for the intake currently being evaluated. Weekly diary periods are calculated
            automatically from these dates.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center gap-3">
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-8 w-full rounded-md" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="mt-1 h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
              <Skeleton className="h-11 w-full rounded-lg" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-32" />
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.settings && (
            <Card
              className={
                data.settings.is_started
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-amber-500/20 bg-amber-500/5'
              }
            >
              <CardContent className="flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-xl',
                      data.settings.is_started
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {data.settings.is_started ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {data.settings.is_started ? 'Diary is live for students' : 'Diary has not started yet'}
                    </p>
                    <p className="mt-0.5 max-w-md text-xs text-muted-foreground">
                      {data.settings.is_started
                        ? `Approved${data.settings.started_at ? ` on ${formatDate(data.settings.started_at.slice(0, 10))}` : ''}. Students can write into the current week.`
                        : "Students see nothing until you approve the start (e.g. once Module 3 actually begins). Editing the dates or intake below will reset this and require approving again."}
                    </p>
                  </div>
                </div>
                <Button
                  variant={data.settings.is_started ? 'outline' : 'default'}
                  disabled={togglingStart}
                  onClick={() => handleToggleStart(!data.settings.is_started)}
                >
                  {data.settings.is_started ? <PauseCircle className="size-4" /> : <PlayCircle className="size-4" />}
                  {togglingStart ? 'Updating…' : data.settings.is_started ? 'Pause Diary' : 'Approve & Start Diary'}
                </Button>
              </CardContent>
            </Card>
          )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          {data?.settings && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Evaluating</p>
                    {linkedIntake ? (
                      <p className="truncate text-lg font-semibold">
                        Intake {linkedIntake.intake_number}
                        <Badge variant="outline" className="ml-2 align-middle text-xs">
                          {INTAKE_STATUS_LABEL[linkedIntake.status]}
                        </Badge>
                      </p>
                    ) : (
                      <p className="truncate text-lg font-semibold text-muted-foreground">No intake linked</p>
                    )}
                  </div>
                </div>

                {linkedIntake && <p className="truncate text-sm text-muted-foreground">{linkedIntake.course_title}</p>}

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Start</span>
                    <span className="font-medium">{formatDate(data.settings.course_start_date)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">End</span>
                    <span className="font-medium">{formatDate(data.settings.course_end_date)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {data.settings.total_weeks} week{data.settings.total_weeks === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Hourglass className="size-3.5" />
                      Time remaining
                    </span>
                    <span className="font-medium">
                      {remaining !== null && remaining > 0 ? `${remaining} days` : 'Ended'}
                    </span>
                  </div>
                </div>

                {remaining !== null && remaining <= 14 && remaining > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    <span>This intake wraps up soon. Come back to open the next one when it does.</span>
                  </div>
                )}
                {remaining !== null && remaining <= 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    <span>This intake has ended. Update the dates below to open the next one.</span>
                  </div>
                )}

                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/admin/intakes">
                    Manage Intakes
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarClock className="size-4 text-primary" />
                <CardTitle className="text-base">Diary Evaluation Window</CardTitle>
              </div>
              <CardDescription>
                Each diary week runs 7 days from the start date. The total number of weeks is derived from these two
                dates. Students can never write beyond today's week or past the end date. Link the intake whose
                enrolled students are doing this diary; its marketing content and application window are managed
                separately under <Link to="/admin/intakes" className="underline underline-offset-2">Intakes</Link>.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="intakeId">Intake</Label>
                  <Select value={intakeId} onValueChange={setIntakeId}>
                    <SelectTrigger id="intakeId" className="w-full">
                      <SelectValue placeholder="No intake linked" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_INTAKE_VALUE}>No intake linked</SelectItem>
                      {intakesData?.intakes.map((intake) => (
                        <SelectItem key={intake.id} value={intake.id}>
                          Intake {intake.intake_number} · {intake.course_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Which intake's roster is currently being evaluated through the weekly diary.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      required
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
                  {previewWeeks ? (
                    <span>
                      This spans <span className="font-semibold">{previewWeeks}</span>{' '}
                      week{previewWeeks === 1 ? '' : 's'} of diary entries.
                    </span>
                  ) : (
                    <span>Pick an end date on or after the start date to preview the week count.</span>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={saving || !previewWeeks}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        </div>
      )}
    </div>
  )
}
