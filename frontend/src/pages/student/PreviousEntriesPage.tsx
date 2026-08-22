import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, History, PencilLine } from 'lucide-react'
import { api } from '@/lib/api'
import type { WeeksResponse } from '@/lib/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PreviousEntriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['weeks'],
    queryFn: () => api.get<WeeksResponse>('/diary/weeks'),
  })

  const openWeeks = data?.weeks.filter((w) => w.isOpen) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Previous Entries</h1>
          <p className="text-sm text-muted-foreground">Every week you've written or been asked to write.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Weeks</CardTitle>
          <CardDescription>Submitted entries are read-only; drafts and open weeks can still be written.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-64 w-full" />}
          {data && openWeeks.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No weeks have opened yet.</p>
          )}
          {data && openWeeks.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openWeeks.map((w) => (
                  <TableRow key={w.weekNumber}>
                    <TableCell className="font-medium">Week {w.weekNumber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {w.submittedAt ? new Date(w.submittedAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      {w.status === 'submitted' ? (
                        <Badge className="gap-1">
                          <CheckCircle2 className="size-3.5" />
                          Submitted
                        </Badge>
                      ) : w.status === 'draft' ? (
                        <Badge variant="secondary" className="gap-1">
                          <PencilLine className="size-3.5" />
                          Draft
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not submitted</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/diary/${w.weekNumber}`}>{w.status === 'submitted' ? 'View' : 'Write'}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
