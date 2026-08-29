import type { ApplicationStatus } from '@/lib/types'

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
}

export const STATUS_VARIANT: Record<ApplicationStatus, 'default' | 'outline' | 'secondary'> = {
  submitted: 'outline',
  under_review: 'secondary',
  approved: 'default',
  rejected: 'outline',
  waitlisted: 'secondary',
}
