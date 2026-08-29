import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type { Intake } from '@/lib/types'
import { FormField, FormSection } from '@/components/form/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  EMPTY_INTAKE_FORM,
  INTAKE_FORM_SECTIONS,
  intakeFormToPayload,
  intakeToForm,
  type IntakeFieldConfig,
  type IntakeForm,
} from './intakeFormConfig'

const FORM_ID = 'intake-form'

function IntakeFormControl({
  field,
  value,
  onChange,
}: {
  field: IntakeFieldConfig
  value: string
  onChange: (value: string) => void
}) {
  if (field.type === 'textarea') {
    return (
      <Textarea
        id={field.key}
        rows={field.rows ?? 3}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={field.key} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      id={field.key}
      type={field.type}
      required={field.required}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function IntakeDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Intake | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<IntakeForm>(EMPTY_INTAKE_FORM)
  const [submitting, setSubmitting] = useState(false)

  // Re-sync the form to the intake being edited whenever the dialog opens.
  // This can't live in onOpenChange: that only fires on Radix-initiated
  // close events (Escape, overlay click), never when the parent opens the
  // dialog by flipping the `open` prop — which is how every "Edit" click
  // here actually opens it, so the form used to keep stale data instead of
  // the row that was just clicked.
  useEffect(() => {
    if (open) setForm(editing ? intakeToForm(editing) : EMPTY_INTAKE_FORM)
  }, [open, editing])

  function setField<K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = intakeFormToPayload(form)
      if (editing) {
        await api.patch(`/admin/intakes/${editing.id}`, payload)
        toast.success('Intake updated')
      } else {
        await api.post('/admin/intakes', payload)
        toast.success('Intake created')
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save intake')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[min(96vw,64rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none sm:w-[min(92vw,64rem)]">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>{editing ? `Edit Intake ${editing.intake_number}` : 'New Intake'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Update this intake’s marketing content and application window.'
              : 'Set up a new intake to appear on the landing page once published.'}
          </DialogDescription>
        </DialogHeader>

        <form id={FORM_ID} className="flex-1 space-y-8 overflow-y-auto px-6 py-6" onSubmit={handleSubmit}>
          {INTAKE_FORM_SECTIONS.map((section, index) => (
            <div key={section.title} className="space-y-8">
              {index > 0 && <Separator />}
              <FormSection title={section.title} description={section.description}>
                {section.fields.map((field) => (
                  <FormField key={field.key} label={field.label} htmlFor={field.key} required={field.required} className={field.span}>
                    <IntakeFormControl field={field} value={form[field.key]} onChange={(v) => setField(field.key, v)} />
                  </FormField>
                ))}
              </FormSection>
            </div>
          ))}
        </form>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t px-6 py-4">
          <Button type="submit" form={FORM_ID} disabled={submitting}>
            {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Intake'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
