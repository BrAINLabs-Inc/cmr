import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  Hash,
  IdCard,
  Mail,
  NotebookText,
  PencilLine,
  Search,
  User,
} from 'lucide-react'
import { api, ApiError, downloadExport } from '@/lib/api'
import type { DiaryEntry } from '@/lib/types'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { Pagination } from '@/components/Pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-'
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function MetaRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-medium">{value}</span>
    </div>
  )
}

const PAGE_SIZE = 20

export function AdminEntriesPage() {
  const [week, setWeek] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<DiaryEntry | null>(null)

  const { data: settings } = useQuery({
    queryKey: ['course-settings'],
    queryFn: () => api.get<{ settings: { total_weeks: number } }>('/admin/course-settings'),
  })
  const totalWeeks = settings?.settings.total_weeks ?? 12

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (week !== 'all') params.set('week', week)
  if (status !== 'all') params.set('status', status)
  if (debouncedSearch) params.set('q', debouncedSearch)

  const { data, isLoading } = useQuery({
    queryKey: ['entries', week, status, debouncedSearch, page],
    queryFn: () => api.get<{ entries: DiaryEntry[]; total: number }>(`/admin/entries?${params.toString()}`),
  })

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <NotebookText className="size-5 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Diary Entries</h1>
            <p className="text-sm text-muted-foreground">
              {data ? `${data.total} entr${data.total === 1 ? 'y' : 'ies'} matching your filters` : 'Browse and export submissions'}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
        <NotebookText className="mt-0.5 size-4 shrink-0" />
        <p>Diary content is confidential to each student. This view shows submission status, word count, and timestamps only.</p>
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
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && <Skeleton className="h-64 w-full" />}
          {data && data.entries.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No entries match your filters.</p>
          )}
          {data && data.entries.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
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
                    <TableCell className="text-muted-foreground">{e.student?.email}</TableCell>
                    <TableCell>Week {e.week_number}</TableCell>
                    <TableCell>
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

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {selected?.student?.name}, Week {selected?.week_number}
            </DialogTitle>
          </DialogHeader>
          <div className="divide-y">
            <MetaRow icon={IdCard} label="Student ID" value={selected?.student?.student_number ?? '-'} />
            <MetaRow icon={Mail} label="Email" value={selected?.student?.email ?? '-'} />
            <MetaRow
              icon={selected?.status === 'submitted' ? CheckCircle2 : PencilLine}
              label="Status"
              value={selected?.status === 'submitted' ? 'Submitted' : 'Draft'}
            />
            <MetaRow icon={Hash} label="Word count" value={String(selected?.word_count ?? 0)} />
            <MetaRow icon={CalendarClock} label="Submitted" value={formatDateTime(selected?.submitted_at)} />
            <MetaRow icon={Clock} label="Last saved" value={formatDateTime(selected?.updated_at)} />
            <MetaRow icon={User} label="Entry date" value={formatDate(selected?.entry_date)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
