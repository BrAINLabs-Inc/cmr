import { useEffect, type ReactNode, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExternalLink, FileText, UserCheck } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { ApplicationDetail, ApplicationFileRef, ApplicationStatus } from '@/lib/types'
import { STATUS_LABEL } from './constants'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet'

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">{children}</div>
    </section>
  )
}

function DocumentLink({ file, label }: { file: ApplicationFileRef; label: string }) {
  return (
    <a
      href={file.url ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted"
    >
      <FileText className="size-4 shrink-0 text-primary" />
      <span className="min-w-0 flex-1 truncate">
        <span className="text-muted-foreground">{label}: </span>
        {file.filename}
      </span>
      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
    </a>
  )
}

function educationQualificationValue(application: ApplicationDetail) {
  return application.education_qualification === 'other'
    ? application.education_qualification_other
    : application.education_qualification
}

function howHeardValue(application: ApplicationDetail) {
  return application.how_heard === 'other' ? application.how_heard_other : application.how_heard
}

function meditationExperienceValue(application: ApplicationDetail) {
  if (application.has_meditation_experience === null || application.has_meditation_experience === undefined) return null
  return application.has_meditation_experience ? 'Yes' : 'No'
}

export function ApplicationDetailSheet({
  id,
  onOpenChange,
  onSaved,
}: {
  id: string | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.get<{ application: ApplicationDetail }>(`/admin/applications/${id}`),
    enabled: Boolean(id),
  })

  const application = data?.application

  useEffect(() => {
    if (application) {
      setStatus(application.status)
      setAdminNotes(application.admin_notes ?? '')
    }
  }, [application?.id])

  async function handleSave() {
    if (!id) return
    setSaving(true)
    try {
      await api.patch(`/admin/applications/${id}`, { status: status || undefined, adminNotes })
      toast.success('Application updated')
      onSaved()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update application')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={Boolean(id)}
      onOpenChange={(open) => {
        if (!open) setStatus('')
        onOpenChange(open)
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-3xl">
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>{application ? application.full_name : 'Application'}</SheetTitle>
          {application?.intake && (
            <SheetDescription>
              Intake {application.intake.intake_number} — {application.intake.course_title}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {isLoading && <Skeleton className="h-64 w-full" />}

          {application && (
            <>
              <DetailSection title="Personal Information">
                <DetailRow label="Title" value={application.title} />
                <DetailRow label="Full Name" value={application.full_name} />
                <DetailRow label="Name with Initials" value={application.name_with_initials} />
                <DetailRow label="Date of Birth" value={application.date_of_birth} />
                <DetailRow label="Gender" value={application.gender.replace(/_/g, ' ')} />
                <DetailRow label="NIC/Passport" value={application.nic_or_passport} />
                <DetailRow label="Email" value={application.email} />
                <DetailRow label="Phone" value={application.phone_number} />
                <DetailRow label="WhatsApp" value={application.whatsapp_number} />
                <DetailRow label="Address" value={application.residential_address} />
              </DetailSection>

              <Separator />

              <DetailSection title="Other Information">
                <DetailRow label="Occupation" value={application.current_occupation} />
                <DetailRow label="Education Qualification" value={educationQualificationValue(application)} />
                <DetailRow label="Degree" value={application.degree_name} />
                <DetailRow label="Meditation Experience" value={meditationExperienceValue(application)} />
                <DetailRow label="How Heard" value={howHeardValue(application)} />
                <div className="col-span-2 sm:col-span-3">
                  <DetailRow label="Reason for Joining" value={application.reason_for_joining} />
                </div>
              </DetailSection>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Documents</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {application.degree_documents.map((doc, i) => (
                    <DocumentLink key={doc.path ?? i} file={doc} label={`Document ${i + 1}`} />
                  ))}
                  <DocumentLink file={application.payment_slip} label="Payment Slip" />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <h3 className="text-sm font-semibold">Review</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="review-status">Status</Label>
                    <Select value={status || application.status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
                      <SelectTrigger id="review-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {application.reviewer && (
                    <div className="space-y-2">
                      <Label>Last Reviewed By</Label>
                      <p className="text-sm text-muted-foreground">
                        {application.reviewer.name ?? application.reviewer.email}
                        {application.reviewed_at && ` · ${new Date(application.reviewed_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  )}
                </div>

                {application.student ? (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
                    <UserCheck className="size-4 shrink-0" />
                    <span>
                      Enrolled on the student roster as <span className="font-medium">{application.student.student_number}</span>.
                    </span>
                  </div>
                ) : (
                  (status || application.status) === 'approved' && (
                    <p className="text-xs text-muted-foreground">Saving will enroll this applicant onto the student roster.</p>
                  )
                )}

                <div className="space-y-2">
                  <Label htmlFor="review-notes">Admin Notes</Label>
                  <Textarea id="review-notes" rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
                </div>
              </section>
            </>
          )}
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end border-t px-6 py-4">
          <Button onClick={handleSave} disabled={saving || !application}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
