import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, Download, NotebookText, PencilLine } from 'lucide-react'
import { api, ApiError, downloadExport } from '@/lib/api'
import type { DiaryEntry } from '@/lib/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminEntriesPage() {
  const [week, setWeek] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [selected, setSelected] = useState<DiaryEntry | null>(null)

  const { data: settings } = useQuery({
    queryKey: ['course-settings'],
    queryFn: () => api.get<{ settings: { total_weeks: number } }>('/admin/course-settings'),
  })
  const totalWeeks = settings?.settings.total_weeks ?? 12

  const params = new URLSearchParams()
  if (week !== 'all') params.set('week', week)
  if (status !== 'all') params.set('status', status)

  const { data, isLoading } = useQuery({
    queryKey: ['entries', week, status],
    queryFn: () => api.get<{ entries: DiaryEntry[]; total: number }>(`/admin/entries?${params.toString()}`),
  })

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

      <div className="flex flex-wrap gap-3">
        <Select value={week} onValueChange={setWeek}>
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

        <Select value={status} onValueChange={setStatus}>
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
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((e) => (
                  <TableRow key={e.id}>
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
                    <TableCell className="text-muted-foreground">
                      {e.submitted_at ? new Date(e.submitted_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(e)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected?.student?.name} — Week {selected?.week_number}
            </DialogTitle>
          </DialogHeader>
          <p className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">{selected?.content}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
