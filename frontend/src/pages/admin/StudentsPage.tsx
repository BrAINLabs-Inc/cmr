import { useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { LateAccessGrant, Student } from '@/lib/types'
import { Pagination } from '@/components/Pagination'
import { TableSkeleton } from '@/components/Skeletons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { usePageClamp } from '@/hooks/use-page-clamp'

const PAGE_SIZE = 20

export function StudentsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [lateAccessStudent, setLateAccessStudent] = useState<Student | null>(null)
  const queryClient = useQueryClient()

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (debouncedSearch) params.set('q', debouncedSearch)

  const { data, isLoading } = useQuery({
    queryKey: ['students', debouncedSearch, page],
    queryFn: () => api.get<{ students: Student[]; total: number }>(`/admin/students?${params.toString()}`),
  })

  usePageClamp(page, setPage, data?.total, PAGE_SIZE)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  async function toggleStatus(student: Student) {
    const nextStatus = student.status === 'active' ? 'inactive' : 'active'
    try {
      await api.patch(`/admin/students/${student.id}`, { status: nextStatus })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update student')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
            <p className="text-sm text-muted-foreground">
              {data ? `${data.total} student${data.total === 1 ? '' : 's'} on the roster` : 'Manage the course roster'}
            </p>
          </div>
        </div>
        <AddStudentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ['students'] })}
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or student ID…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && <TableSkeleton columns={['Student ID', 'Name', 'Email', 'Status', 'Action']} />}
          {data && data.students.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {search ? 'No students match your search.' : 'No students on the roster yet. Add one to get started.'}
            </p>
          )}
          {data && data.students.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student_number}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'active' ? 'default' : 'outline'}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${s.name}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setLateAccessStudent(s)}>
                            <CalendarClock className="size-4" />
                            Late Access
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {s.status === 'active' ? (
                            <DropdownMenuItem variant="destructive" onClick={() => toggleStatus(s)}>
                              <UserX className="size-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => toggleStatus(s)}>
                              <UserCheck className="size-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
        </CardContent>
      </Card>

      <LateAccessDialog student={lateAccessStudent} onOpenChange={(open) => !open && setLateAccessStudent(null)} />
    </div>
  )
}

function LateAccessDialog({
  student,
  onOpenChange,
}: {
  student: Student | null
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-weeks', student?.id],
    queryFn: () => api.get<{ pendingWeeks: number[] }>(`/admin/students/${student?.id}/pending-weeks`),
    enabled: !!student?.id,
  })

  const { data: grantsData, isLoading: grantsLoading } = useQuery({
    queryKey: ['late-access', student?.id],
    queryFn: () => api.get<{ grants: LateAccessGrant[] }>(`/admin/students/${student?.id}/late-access`),
    enabled: !!student?.id,
  })

  const grantsByWeek = new Map((grantsData?.grants ?? []).map((g) => [g.week_number, g]))
  const missedWeeks = (pendingData?.pendingWeeks ?? []).filter((w) => !grantsByWeek.get(w)?.allowed)
  const allowedWeeks = (grantsData?.grants ?? []).filter((g) => g.allowed)

  async function setAllowed(week: number, allowed: boolean) {
    if (!student) return
    try {
      await api.put(`/admin/students/${student.id}/late-access/${week}`, { allowed })
      toast.success(allowed ? `Week ${week} reopened for late submission` : `Week ${week} late access revoked`)
      queryClient.invalidateQueries({ queryKey: ['late-access', student.id] })
      queryClient.invalidateQueries({ queryKey: ['pending-weeks', student.id] })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update late access')
    }
  }

  const loading = pendingLoading || grantsLoading

  return (
    <Dialog open={!!student} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] w-[min(96vw,64rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none sm:w-[min(92vw,64rem)]">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarClock className="size-5 text-primary" />
            Late Diary Access for {student?.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Grant access to write and submit a specific missed week late, for example after the student has emailed
            an excuse. Revoke it again at any time.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <ShieldCheck className="size-3.5" />
                Allowed late
              </p>

              {loading && (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </div>
              )}

              {!loading && allowedWeeks.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed py-10 text-center">
                  <ShieldCheck className="size-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No late access granted yet.</p>
                </div>
              )}

              {!loading &&
                allowedWeeks.map((g) => (
                  <div
                    key={g.week_number}
                    className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">Week {g.week_number}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-primary" />
                        Reopened for late submission
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setAllowed(g.week_number, false)}>
                      Revoke
                    </Button>
                  </div>
                ))}
            </section>

            <section className="space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <Clock3 className="size-3.5" />
                Missed weeks
              </p>

              {loading && (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </div>
              )}

              {!loading && missedWeeks.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed py-10 text-center">
                  <CheckCircle2 className="size-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No missed weeks pending.</p>
                </div>
              )}

              {!loading &&
                missedWeeks.map((week) => (
                  <div key={week} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <p className="text-sm font-medium">Week {week}</p>
                    <Button size="sm" onClick={() => setAllowed(week, true)}>
                      Allow late submit
                    </Button>
                  </div>
                ))}
            </section>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddStudentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [studentNumber, setStudentNumber] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/admin/students', { studentNumber, name, email })
      toast.success('Student added')
      setStudentNumber('')
      setName('')
      setEmail('')
      onOpenChange(false)
      onCreated()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not add student')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="studentNumber">Student ID</Label>
            <Input id="studentNumber" required value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
