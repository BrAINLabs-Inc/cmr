import { useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, UserPlus, Users } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { Student } from '@/lib/types'
import { Pagination } from '@/components/Pagination'
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
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

const PAGE_SIZE = 20

export function StudentsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (debouncedSearch) params.set('q', debouncedSearch)

  const { data, isLoading } = useQuery({
    queryKey: ['students', debouncedSearch, page],
    queryFn: () => api.get<{ students: Student[]; total: number }>(`/admin/students?${params.toString()}`),
  })

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
          {isLoading && <Skeleton className="h-64 w-full" />}
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
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(s)}>
                        {s.status === 'active' ? 'Deactivate' : 'Activate'}
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
    </div>
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
