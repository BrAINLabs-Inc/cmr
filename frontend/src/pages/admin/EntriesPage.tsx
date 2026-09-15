import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  FileX,
  Hash,
  IdCard,
  Mail,
  NotebookText,
  PencilLine,
  Search,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react'
import { api, ApiError, downloadExport } from '@/lib/api'
import type { DiaryEntry, MissedEntry } from '@/lib/types'
import { hasTiptapText } from '@/lib/tiptap'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { usePageClamp } from '@/hooks/use-page-clamp'
import { Pagination } from '@/components/Pagination'
import { TableSkeleton } from '@/components/Skeletons'
import { DiaryEditor } from '@/components/DiaryEditor'
import { MetaTile } from '@/components/MetaTile'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

function LateBadge() {
  return (
    <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
      <AlertTriangle className="size-3.5" />
      Late
    </Badge>
  )
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not yet'
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not yet'
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

const PAGE_SIZE = 20

export function EntriesPage() {
  const [week, setWeek] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<DiaryEntry | null>(null)
  const queryClient = useQueryClient()

  const isMissedView = status === 'missed'

  const { data: settings } = useQuery({
    queryKey: ['course-settings'],
    queryFn: () => api.get<{ settings: { total_weeks: number } }>('/admin/course-settings'),
  })
  const totalWeeks = settings?.settings.total_weeks ?? 12

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (week !== 'all') params.set('week', week)
  if (status !== 'all' && !isMissedView) params.set('status', status)
  if (debouncedSearch) params.set('q', debouncedSearch)

  const { data, isLoading } = useQuery({
    queryKey: ['entries', week, status, debouncedSearch, page],
    queryFn: () => api.get<{ entries: DiaryEntry[]; total: number }>(`/admin/entries?${params.toString()}`),
    enabled: !isMissedView,
  })

  const { data: missedData, isLoading: missedLoading } = useQuery({
    queryKey: ['entries-missed', week, debouncedSearch, page],
    queryFn: () => api.get<{ entries: MissedEntry[]; total: number }>(`/admin/entries/missed?${params.toString()}`),
    enabled: isMissedView,
  })

  const { data: entryDetail, isLoading: entryLoading } = useQuery({
    queryKey: ['entry', selected?.id],
    queryFn: () => api.get<{ entry: DiaryEntry }>(`/admin/entries/${selected?.id}`),
    enabled: !!selected?.id,
  })

  usePageClamp(page, setPage, isMissedView ? missedData?.total : data?.total, PAGE_SIZE)

  function updateFilter(setter: (v: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  async function handleExport() {
    try {
      await downloadExport(`/admin/export.csv?${params.toString()}`, `diary-entries-${Date.now()}.csv`)
      toast.success('Export started')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Export failed')
    }
  }

  async function grantLateAccess(m: MissedEntry) {
    try {
      await api.put(`/admin/students/${m.student_id}/late-access/${m.week_number}`, { allowed: true })
      toast.success(`Week ${m.week_number} reopened for ${m.student.name}`)
      queryClient.invalidateQueries({ queryKey: ['entries-missed'] })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not grant late access')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <NotebookText className="size-5 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Diary Entries</h1>
            <p className="text-sm text-muted-foreground">
              {isMissedView
                ? missedData
                  ? `${missedData.total} missed week${missedData.total === 1 ? '' : 's'} matching your filters`
                  : 'Weeks students never submitted'
                : data
                  ? `${data.total} entr${data.total === 1 ? 'y' : 'ies'} matching your filters`
                  : 'Browse and export submissions'}
            </p>
          </div>
        </div>
        {!isMissedView && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
        <NotebookText className="mt-0.5 size-4 shrink-0" />
        <p>Diary content is sensitive. Open Details only when reviewing a specific entry, and handle what you read there with care.</p>
      </div>

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

        <Select value={status} onValueChange={(v) => updateFilter(setStatus, v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isMissedView ? (
        <Card>
          <CardContent className="pt-6">
            {missedLoading && <TableSkeleton columns={['Student ID', 'Student', 'Week', 'Status', 'Action']} />}
            {missedData && missedData.entries.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No missed weeks match your filters. Everyone's caught up.
              </p>
            )}
            {missedData && missedData.entries.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Week</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missedData.entries.map((m) => (
                    <TableRow key={`${m.student_id}-${m.week_number}`}>
                      <TableCell className="text-muted-foreground">{m.student.student_number}</TableCell>
                      <TableCell className="font-medium">{m.student.name}</TableCell>
                      <TableCell>Week {m.week_number}</TableCell>
                      <TableCell>
                        {m.has_late_access ? (
                          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                            <ShieldCheck className="size-3.5" />
                            Late access granted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 border-destructive/30 text-destructive">
                            <XCircle className="size-3.5" />
                            Unable to submit
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!m.has_late_access && (
                          <Button variant="ghost" size="sm" onClick={() => grantLateAccess(m)}>
                            Allow late submit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {missedData && <Pagination page={page} pageSize={PAGE_SIZE} total={missedData.total} onPageChange={setPage} />}
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardContent className="pt-6">
          {isLoading && (
            <TableSkeleton columns={['Student ID', 'Student', 'Week', 'Status', 'Words', 'Submitted', 'Action']} />
          )}
          {data && data.entries.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No entries match your filters.</p>
          )}
          {data && data.entries.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-muted-foreground">{e.student?.student_number}</TableCell>
                    <TableCell className="font-medium">{e.student?.name}</TableCell>
                    <TableCell>Week {e.week_number}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {e.status === 'submitted' ? (
                          <Badge className="gap-1">
                            <CheckCircle2 className="size-3.5" />
                            Submitted
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <PencilLine className="size-3.5" />
                            Draft
                          </Badge>
                        )}
                        {e.is_late && <LateBadge />}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{e.word_count}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.submitted_at ? new Date(e.submitted_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(e)}>
                        Details
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
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="flex h-[88vh] w-[min(96vw,80rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none sm:w-[min(92vw,80rem)]">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="flex flex-wrap items-center gap-2 text-lg">
              {selected?.student?.name}
              <Badge variant="outline" className="border-primary/30 font-normal text-primary">
                Week {selected?.week_number}
              </Badge>
              {selected?.status === 'submitted' ? (
                <Badge className="gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Submitted
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <PencilLine className="size-3.5" />
                  Draft
                </Badge>
              )}
              {selected?.is_late && <LateBadge />}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <MetaTile icon={IdCard} label="Student ID" value={selected?.student?.student_number ?? '-'} />
              <MetaTile icon={Mail} label="Email" value={selected?.student?.email ?? '-'} />
              <MetaTile icon={Hash} label="Word count" value={String(selected?.word_count ?? 0)} />
              <MetaTile icon={CalendarClock} label="Submitted" value={formatDateTime(selected?.submitted_at)} />
              <MetaTile icon={Clock} label="Last saved" value={formatDateTime(selected?.updated_at)} />
              <MetaTile icon={User} label="Entry date" value={formatDate(selected?.entry_date)} />
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <NotebookText className="size-4 text-muted-foreground" />
                Diary entry
              </p>

              {entryLoading && (
                <div className="space-y-2 rounded-xl border p-5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}

              {entryDetail && hasTiptapText(entryDetail.entry.content) && (
                <div className="rounded-xl border bg-muted/10 p-5">
                  <DiaryEditor
                    key={selected?.id}
                    initialContent={entryDetail.entry.content ?? { type: 'doc', content: [] }}
                    editable={false}
                    onUpdate={() => {}}
                  />
                </div>
              )}

              {entryDetail && !hasTiptapText(entryDetail.entry.content) && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-14 text-center">
                  <FileX className="size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">No content</p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    {selected?.status === 'submitted'
                      ? 'This entry was submitted without any written content.'
                      : "This student hasn't written anything for this week yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
