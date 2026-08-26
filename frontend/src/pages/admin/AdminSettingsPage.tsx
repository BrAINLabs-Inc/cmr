import { useEffect, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CalendarRange, CheckCircle2 } from 'lucide-react'
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

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'long' })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarRange className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Course Settings</h1>
          <p className="text-sm text-muted-foreground">
            Set the current intake's start and end dates. Weekly diary periods are calculated from them
            automatically. When this intake finishes, come back and roll the dates forward to open the next one.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full max-w-xl" />
      ) : (
        <>
          {data?.settings && (
            <Card className="max-w-xl border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <CardContent className="flex items-start gap-3 pt-6">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Currently configured{data.settings.intake_label ? `: ${data.settings.intake_label}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    {formatDate(data.settings.course_start_date)} – {formatDate(data.settings.course_end_date)} ·{' '}
                    {data.settings.total_weeks} week{data.settings.total_weeks === 1 ? '' : 's'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-base">Course Duration</CardTitle>
              <CardDescription>
                Each diary week runs 7 days from the start date. The total number of weeks is derived from these two
                dates. Students can never write beyond today's week or past the end date.
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
        </>
      )}
    </div>
  )
}
