import type { Intake, IntakeStatus } from '@/lib/types'

export function findPublishedIntake(intakes: Intake[] | undefined): Intake | undefined {
  return intakes?.find((intake) => intake.is_published)
}

export const INTAKE_STATUS_LABEL: Record<IntakeStatus, string> = {
  upcoming: 'Upcoming',
  open: 'Open',
  closed: 'Closed',
}
