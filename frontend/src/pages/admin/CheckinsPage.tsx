import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Flower2, HeartHandshake, Search } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdminCheckin, CheckinCohortStats, MoodFeeling } from '@/lib/types'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { MOOD_LABELS, moodClassName, moodIcon } from '@/lib/mood'
import { cn } from '@/lib/utils'
import { Pagination } from '@/components/Pagination'
import { WeeklyCheckin } from '@/components/WeeklyCheckin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

function CohortSnapshot() {
  const { data, isLoading } = useQuery({
    queryKey: ['checkin-cohort-stats'],
    queryFn: () => api.get<CheckinCohortStats>('/admin/stats/checkins'),
  })

  if (isLoading || !data) return <Skeleton className="h-32 w-full" />

  const tiles = [
    { label: `Checked in (Week ${data.week})`, value: `${data.checkedIn}/${data.totalStudents}`, sub: `${data.checkinRate}%` },
    { label: 'Meditated this week', value: `${data.meditated}/${data.totalStudents}`, sub: `${data.meditationRate}%` },
  ]
  const topMood = Object.entries(data.moodCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <HeartHandshake className="size-4 text-primary" />
          <CardTitle className="text-base">Cohort Well-being: Week {data.week}</CardTitle>
        </div>
        <CardDescription>How the cohort is doing this week, from optional check-ins.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-xl font-semibold tabular-nums">
                {t.value} <span className="text-sm font-normal text-muted-foreground">({t.sub})</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.label}</p>
            </div>
          ))}
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            {topMood && topMood[1] > 0 ? (
              (() => {
                const feeling = topMood[0] as MoodFeeling
                const MoodIcon = moodIcon(feeling)
                return (
                  <p className="flex items-center gap-1.5 text-xl font-semibold">
                    <MoodIcon className={cn('size-5', moodClassName(feeling))} />
                    {MOOD_LABELS[feeling]}
                  </p>
                )
              })()
            ) : (
              <p className="text-xl font-semibold">-</p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">Most common mood</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const PAGE_SIZE = 20

export function CheckinsPage() {
  const [week, setWeek] = useState<string>('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminCheckin | null>(null)

  const { data: settings } = useQuery({
    queryKey: ['course-settings'],
    queryFn: () => api.get<{ settings: { total_weeks: number } }>('/admin/course-settings'),
  })
  const totalWeeks = settings?.settings.total_weeks ?? 12

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (week !== 'all') params.set('week', week)
  if (debouncedSearch) params.set('q', debouncedSearch)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-checkins', week, debouncedSearch, page],
    queryFn: () => api.get<{ checkins: AdminCheckin[]; total: number }>(`/admin/checkins?${params.toString()}`),
  })

  function updateFilter(setter: (v: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <HeartHandshake className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Weekly Check-ins</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} check-in${data.total === 1 ? '' : 's'} matching your filters` : 'Meditation, mood, and reflection logs'}
          </p>
        </div>
      </div>

      <CohortSnapshot />

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or student ID…"
            value={search}
            onChange={(e) => updateFilter(setSearch, e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={week} onValueChange={(v) => updateFilter(setWeek, v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All weeks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All weeks</SelectItem>
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
              <SelectItem key={w} value={String(w)}>
                Week {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && <Skeleton className="h-64 w-full" />}
          {data && data.checkins.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No check-ins match your filters.</p>
          )}
          {data && data.checkins.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Meditation</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.checkins.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-muted-foreground">{c.student?.student_number}</TableCell>
                    <TableCell className="font-medium">{c.student?.name}</TableCell>
                    <TableCell>Week {c.week_number}</TableCell>
                    <TableCell>
                      {c.checkin.meditation?.practiced ? (
                        <Badge className="gap-1">
                          <Flower2 className="size-3.5" />
                          {c.checkin.meditation.minutes ?? 0} min
                        </Badge>
                      ) : c.checkin.meditation?.practiced === false ? (
                        <Badge variant="outline">No</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.checkin.mood?.feeling ? (
                        <Badge variant="secondary" className="gap-1">
                          {(() => {
                            const MoodIcon = moodIcon(c.checkin.mood?.feeling)
                            return <MoodIcon className={cn('size-3.5', moodClassName(c.checkin.mood?.feeling))} />
                          })()}
                          {MOOD_LABELS[c.checkin.mood.feeling]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.student?.name}, Week {selected?.week_number}
              {selected?.checkin.meditation?.practiced && (
                <Badge className="gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Meditated
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selected && <WeeklyCheckin value={selected.checkin} onChange={() => {}} disabled />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
