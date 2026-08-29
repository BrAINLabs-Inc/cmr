import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GraduationCap, Plus, Trash2 } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { Intake, IntakeStatus } from '@/lib/types'
import { INTAKE_STATUS_LABEL } from '@/lib/intakes'
import { ADMIN_INTAKES_QUERY_KEY, useAdminIntakes } from '@/hooks/use-admin-intakes'
import { IntakeDialog } from './intakes/IntakeDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ActionType = 'publish' | 'unpublish' | 'delete'
type PendingAction = { type: ActionType; intake: Intake }

const ACTION_COPY: Record<ActionType, { title: (n: number) => string; description: string; confirmLabel: string; destructive?: boolean }> = {
  publish: {
    title: (n) => `Publish Intake ${n}?`,
    description: 'This will unpublish the currently active intake and make this one live on the landing page.',
    confirmLabel: 'Publish',
  },
  unpublish: {
    title: (n) => `Unpublish Intake ${n}?`,
    description: 'It will stop showing on the public landing page and /apply until another intake is published.',
    confirmLabel: 'Unpublish',
  },
  delete: {
    title: (n) => `Delete Intake ${n}?`,
    description: 'This cannot be undone. Intakes with applications cannot be deleted.',
    confirmLabel: 'Delete',
    destructive: true,
  },
}

const STATUS_OPTIONS: IntakeStatus[] = ['upcoming', 'open', 'closed']

export function IntakesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Intake | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const { data, isLoading } = useAdminIntakes()

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ADMIN_INTAKES_QUERY_KEY })
  }

  function openCreateDialog() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEditDialog(intake: Intake) {
    setEditing(intake)
    setDialogOpen(true)
  }

  async function handleStatusChange(intake: Intake, status: IntakeStatus) {
    if (status === intake.status) return
    try {
      await api.patch(`/admin/intakes/${intake.id}`, { status })
      toast.success(`Intake ${intake.intake_number} marked ${INTAKE_STATUS_LABEL[status].toLowerCase()}`)
      invalidate()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update status')
    }
  }

  function handlePublishedChange(intake: Intake, nextPublished: boolean) {
    if (nextPublished === intake.is_published) return
    setPendingAction({ type: nextPublished ? 'publish' : 'unpublish', intake })
  }

  async function handleConfirmedAction() {
    if (!pendingAction) return
    const { type, intake } = pendingAction
    setActionLoading(true)
    try {
      if (type === 'delete') {
        await api.delete(`/admin/intakes/${intake.id}`)
        toast.success('Intake deleted')
      } else {
        await api.patch(`/admin/intakes/${intake.id}`, { isPublished: type === 'publish' })
        toast.success(type === 'publish' ? 'Intake published' : 'Intake unpublished')
      }
      invalidate()
      setPendingAction(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Could not ${type} intake`)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-5 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Intakes</h1>
            <p className="text-sm text-muted-foreground">Manage the intakes shown on the public landing page</p>
          </div>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          New Intake
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && <Skeleton className="h-64 w-full" />}
          {data && data.intakes.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No intakes yet. Create one to get started.</p>
          )}
          {data && data.intakes.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intake</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Closing Date</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.intakes.map((intake) => (
                  <TableRow key={intake.id}>
                    <TableCell className="font-medium">
                      {intake.intake_number} — {intake.course_title}
                    </TableCell>
                    <TableCell>
                      <Select value={intake.status} onValueChange={(v) => handleStatusChange(intake, v as IntakeStatus)}>
                        <SelectTrigger size="sm" className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {INTAKE_STATUS_LABEL[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={intake.is_published ? 'true' : 'false'}
                        onValueChange={(v) => handlePublishedChange(intake, v === 'true')}
                      >
                        <SelectTrigger size="sm" className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Published</SelectItem>
                          <SelectItem value="false">Not Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{intake.application_closing_date ?? '—'}</TableCell>
                    <TableCell>{intake.application_count ?? 0}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(intake)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setPendingAction({ type: 'delete', intake })}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <IntakeDialog
        key={editing?.id ?? 'new'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={invalidate}
      />

      {pendingAction && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setPendingAction(null)}
          title={ACTION_COPY[pendingAction.type].title(pendingAction.intake.intake_number)}
          description={ACTION_COPY[pendingAction.type].description}
          confirmLabel={ACTION_COPY[pendingAction.type].confirmLabel}
          destructive={ACTION_COPY[pendingAction.type].destructive}
          loading={actionLoading}
          onConfirm={handleConfirmedAction}
        />
      )}
    </div>
  )
}
