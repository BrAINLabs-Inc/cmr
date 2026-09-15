import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ClipboardList, Download, Search } from 'lucide-react'
import { api, downloadExport } from '@/lib/api'
import type { ApplicationSummary } from '@/lib/types'
import { useAdminIntakes } from '@/hooks/use-admin-intakes'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { usePageClamp } from '@/hooks/use-page-clamp'
import { STATUS_LABEL, STATUS_VARIANT } from './applications/constants'
import { ApplicationDialog } from './applications/ApplicationDialog'
import { Pagination } from '@/components/Pagination'
import { TableSkeleton } from '@/components/Skeletons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const PAGE_SIZE = 20
const APPLICATIONS_QUERY_KEY = 'applications'

type ExportFormat = 'csv' | 'xlsx' | 'pdf'

const EXPORT_FORMATS: { format: ExportFormat; label: string }[] = [
  { format: 'csv', label: 'CSV' },
  { format: 'xlsx', label: 'Excel (.xlsx)' },
  { format: 'pdf', label: 'PDF' },
]

export function ApplicationsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(1)
  const [intakeId, setIntakeId] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: intakesData } = useAdminIntakes()

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (debouncedSearch) params.set('q', debouncedSearch)
  if (intakeId !== 'all') params.set('intakeId', intakeId)
  if (status !== 'all') params.set('status', status)

  const { data, isLoading } = useQuery({
    queryKey: [APPLICATIONS_QUERY_KEY, debouncedSearch, page, intakeId, status],
    queryFn: () => api.get<{ applications: ApplicationSummary[]; total: number }>(`/admin/applications?${params.toString()}`),
  })

  usePageClamp(page, setPage, data?.total, PAGE_SIZE)

  function handleFilterChange() {
    setPage(1)
  }

  function handleExport(format: ExportFormat) {
    const exportParams = new URLSearchParams()
    if (debouncedSearch) exportParams.set('q', debouncedSearch)
    if (intakeId !== 'all') exportParams.set('intakeId', intakeId)
    if (status !== 'all') exportParams.set('status', status)
    downloadExport(
      `/admin/applications/export.${format}?${exportParams.toString()}`,
      `applications-${Date.now()}.${format}`
    ).catch(() => toast.error('Could not export applications'))
  }

  function handleApplicationSaved() {
    queryClient.invalidateQueries({ queryKey: [APPLICATIONS_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['application', selectedId] })
    // Approving an application enrolls a new roster row; keep the Students
    // admin page in sync without a manual refresh.
    queryClient.invalidateQueries({ queryKey: ['students'] })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
            <p className="text-sm text-muted-foreground">
              {data ? `${data.total} application${data.total === 1 ? '' : 's'}` : 'Review submitted applications'}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="size-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {EXPORT_FORMATS.map(({ format, label }) => (
              <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or NIC…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              handleFilterChange()
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={intakeId}
          onValueChange={(v) => {
            setIntakeId(v)
            handleFilterChange()
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All intakes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All intakes</SelectItem>
            {intakesData?.intakes.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                Intake {i.intake_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            handleFilterChange()
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && (
            <TableSkeleton columns={['Name', 'Email', 'Intake', 'Submitted', 'Status', 'Student #']} />
          )}
          {data && data.applications.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No applications match your filters.</p>
          )}
          {data && data.applications.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Intake</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Student #</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.applications.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelectedId(a.id)}>
                    <TableCell className="font-medium">{a.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.email}</TableCell>
                    <TableCell>{a.intake ? `Intake ${a.intake.intake_number}` : '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(a.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.student?.student_number ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
        </CardContent>
      </Card>

      <ApplicationDialog
        id={selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onSaved={handleApplicationSaved}
      />
    </div>
  )
}
