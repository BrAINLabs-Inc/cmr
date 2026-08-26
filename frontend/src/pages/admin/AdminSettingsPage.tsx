import { useEffect, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, CalendarClock, CalendarRange, GraduationCap, Hourglass } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type CourseSettings = {
  course_start_date: string
  course_end_date: string
  total_weeks: number
  intake_label: string | null
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_WEEK = 7 * MS_PER_DAY

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'long' })
}

function daysUntil(value: string) {
  const target = new Date(`${value}T23:59:59`).getTime()
  return Math.ceil((target - Date.now()) / MS_PER_DAY)
}

export function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['course-settings'],
    queryFn: () => api.get<{ settings: CourseSettings }>('/admin/course-settings'),
  })

  const [intakeLabel, setIntakeLabel] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data?.settings) {
      setIntakeLabel(data.settings.intake_label ?? '')
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
        intakeLabel: intakeLabel.trim(),
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

  const remaining = data?.settings ? daysUntil(data.settings.course_end_date) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarRange className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Course Settings</h1>
          <p className="text-sm text-muted-foreground">
            Set the current intake's start and end dates. Weekly diary periods are calculated automatically.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          {data?.settings && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Current intake</p>
                    <p className="truncate text-lg font-semibold">{data.settings.intake_label || 'Unlabeled'}</p>
                  </div>
                </div>

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
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarClock className="size-4 text-primary" />
                <CardTitle className="text-base">Course Duration</CardTitle>
              </div>
              <CardDescription>
                Each diary week runs 7 days from the start date. The total number of weeks is derived from these
                two dates. Students can never write beyond today's week or past the end date.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="intakeLabel">Intake Label</Label>
                  <Input
                    id="intakeLabel"
                    placeholder="e.g. 03rd Intake"
                    value={intakeLabel}
                    onChange={(e) => setIntakeLabel(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    A name for the cohort these dates belong to, so it's clear which intake is currently configured.
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
      )}
    </div>
  )
}
