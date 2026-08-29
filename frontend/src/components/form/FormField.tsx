import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FormFieldProps = {
  label: string
  htmlFor: string
  required?: boolean
  description?: string
  error?: string | null
  className?: string
  children: ReactNode
}

// Shared labeled-field wrapper for plain (non-react-hook-form) forms in this
// app — the "<Label> + control + optional hint" shell was previously
// duplicated across every admin/public form. Pass `error` (e.g. from
// useValidatedField) to show live validation feedback under the control.
export function FormField({ label, htmlFor, required, description, error, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        description && <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

type FormSectionProps = {
  title: string
  description?: string
  children: ReactNode
  columns?: 2 | 3
}

// Shared "titled group of fields on a grid" wrapper, used to break long
// admin forms into scannable, separator-divided sections.
export function FormSection({ title, description, children, columns = 3 }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className={cn('grid gap-4 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3')}>{children}</div>
    </div>
  )
}
