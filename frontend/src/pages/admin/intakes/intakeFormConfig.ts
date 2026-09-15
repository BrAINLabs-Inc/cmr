import type { Intake, IntakeStatus } from '@/lib/types'

export type IntakeForm = {
  intakeNumber: string
  courseTitle: string
  status: IntakeStatus
  applicationClosingDate: string
  closingDateNote: string
  commencingDate: string
  durationText: string
  modeText: string
  lectureScheduleText: string
  modules: string
  objectives: string
  eligibilityText: string
  eligibilitySpecialCategory: string
  feeCourse: string
  feeApplicationLocal: string
  feeApplicationForeign: string
  feeRegistrationLocal: string
  feeRegistrationForeign: string
  paymentOnlinePortalUrl: string
  paymentBankName: string
  paymentAccountHolderName: string
  paymentReferenceCode: string
  contactEmail: string
  contactWebsiteUrl: string
  academicProgrammeUrl: string
  fundedBy: string
}

export const EMPTY_INTAKE_FORM: IntakeForm = {
  intakeNumber: '',
  courseTitle: '',
  status: 'upcoming',
  applicationClosingDate: '',
  closingDateNote: '',
  commencingDate: '',
  durationText: '',
  modeText: '',
  lectureScheduleText: '',
  modules: '',
  objectives: '',
  eligibilityText: '',
  eligibilitySpecialCategory: '',
  feeCourse: '',
  feeApplicationLocal: '',
  feeApplicationForeign: '',
  feeRegistrationLocal: '',
  feeRegistrationForeign: '',
  paymentOnlinePortalUrl: '',
  paymentBankName: '',
  paymentAccountHolderName: '',
  paymentReferenceCode: '',
  contactEmail: '',
  contactWebsiteUrl: '',
  academicProgrammeUrl: '',
  fundedBy: '',
}

export function intakeToForm(intake: Intake): IntakeForm {
  return {
    intakeNumber: String(intake.intake_number),
    courseTitle: intake.course_title ?? '',
    status: intake.status,
    applicationClosingDate: intake.application_closing_date ?? '',
    closingDateNote: intake.closing_date_note ?? '',
    commencingDate: intake.commencing_date ?? '',
    durationText: intake.duration_text ?? '',
    modeText: intake.mode_text ?? '',
    lectureScheduleText: intake.lecture_schedule_text ?? '',
    modules: (intake.modules ?? []).join('\n'),
    objectives: (intake.objectives ?? []).join('\n'),
    eligibilityText: intake.eligibility_text ?? '',
    eligibilitySpecialCategory: intake.eligibility_special_category ?? '',
    feeCourse: intake.fee_course ?? '',
    feeApplicationLocal: intake.fee_application_local ?? '',
    feeApplicationForeign: intake.fee_application_foreign ?? '',
    feeRegistrationLocal: intake.fee_registration_local ?? '',
    feeRegistrationForeign: intake.fee_registration_foreign ?? '',
    paymentOnlinePortalUrl: intake.payment_online_portal_url ?? '',
    paymentBankName: intake.payment_bank_name ?? '',
    paymentAccountHolderName: intake.payment_account_holder_name ?? '',
    paymentReferenceCode: intake.payment_reference_code ?? '',
    contactEmail: intake.contact_email ?? '',
    contactWebsiteUrl: intake.contact_website_url ?? '',
    academicProgrammeUrl: intake.academic_programme_url ?? '',
    fundedBy: intake.funded_by ?? '',
  }
}

export function intakeFormToPayload(form: IntakeForm) {
  return {
    intakeNumber: Number(form.intakeNumber),
    courseTitle: form.courseTitle || undefined,
    status: form.status,
    applicationClosingDate: form.applicationClosingDate || undefined,
    closingDateNote: form.closingDateNote || undefined,
    commencingDate: form.commencingDate || undefined,
    durationText: form.durationText || undefined,
    modeText: form.modeText || undefined,
    lectureScheduleText: form.lectureScheduleText || undefined,
    modules: form.modules.split('\n').map((s) => s.trim()).filter(Boolean),
    objectives: form.objectives.split('\n').map((s) => s.trim()).filter(Boolean),
    eligibilityText: form.eligibilityText || undefined,
    eligibilitySpecialCategory: form.eligibilitySpecialCategory || undefined,
    feeCourse: form.feeCourse || undefined,
    feeApplicationLocal: form.feeApplicationLocal || undefined,
    feeApplicationForeign: form.feeApplicationForeign || undefined,
    feeRegistrationLocal: form.feeRegistrationLocal || undefined,
    feeRegistrationForeign: form.feeRegistrationForeign || undefined,
    paymentOnlinePortalUrl: form.paymentOnlinePortalUrl || undefined,
    paymentBankName: form.paymentBankName || undefined,
    paymentAccountHolderName: form.paymentAccountHolderName || undefined,
    paymentReferenceCode: form.paymentReferenceCode || undefined,
    contactEmail: form.contactEmail || undefined,
    contactWebsiteUrl: form.contactWebsiteUrl || undefined,
    academicProgrammeUrl: form.academicProgrammeUrl || undefined,
    fundedBy: form.fundedBy || undefined,
  }
}

type IntakeFieldType = 'text' | 'number' | 'date' | 'email' | 'url' | 'textarea' | 'select'

export type IntakeFieldConfig = {
  key: keyof IntakeForm
  label: string
  type: IntakeFieldType
  placeholder?: string
  required?: boolean
  span?: string
  rows?: number
  options?: { value: string; label: string }[]
}

export type IntakeFormSection = {
  title: string
  description?: string
  fields: IntakeFieldConfig[]
}

// Single source of truth for the intake form's layout: add a field here
// and it appears in the right section with the right control, instead of
// duplicating a labeled-input block by hand.
export const INTAKE_FORM_SECTIONS: IntakeFormSection[] = [
  {
    title: 'Overview',
    description: 'Identity and application window for this intake.',
    fields: [
      { key: 'intakeNumber', label: 'Intake Number', type: 'number', required: true },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ],
      },
      { key: 'applicationClosingDate', label: 'Application Closing Date', type: 'date', span: 'sm:col-span-2 lg:col-span-1' },
      { key: 'courseTitle', label: 'Course Title', type: 'text', span: 'sm:col-span-2 lg:col-span-3' },
      { key: 'closingDateNote', label: 'Closing Date Note', type: 'text', placeholder: 'e.g. EXTENDED' },
      { key: 'commencingDate', label: 'Commencing Date', type: 'date' },
      { key: 'durationText', label: 'Duration', type: 'text' },
      { key: 'modeText', label: 'Mode', type: 'text' },
      { key: 'lectureScheduleText', label: 'Lecture Schedule', type: 'text' },
    ],
  },
  {
    title: 'Curriculum',
    description: 'Shown on the landing page as the module list and objectives.',
    fields: [
      { key: 'modules', label: 'Modules (one per line)', type: 'textarea', rows: 6, span: 'sm:col-span-2 lg:col-span-1' },
      { key: 'objectives', label: 'Objectives (one per line)', type: 'textarea', rows: 6, span: 'sm:col-span-2 lg:col-span-2' },
    ],
  },
  {
    title: 'Eligibility',
    fields: [
      { key: 'eligibilityText', label: 'Who Can Apply', type: 'textarea', rows: 3, span: 'sm:col-span-2 lg:col-span-2' },
      { key: 'eligibilitySpecialCategory', label: 'Special Category', type: 'textarea', rows: 3 },
    ],
  },
  {
    title: 'Fees',
    fields: [
      { key: 'feeCourse', label: 'Course Fee', type: 'text' },
      { key: 'feeApplicationLocal', label: 'Application Fee (Local)', type: 'text' },
      { key: 'feeApplicationForeign', label: 'Application Fee (Foreign)', type: 'text' },
      { key: 'feeRegistrationLocal', label: 'Registration Fee (Local)', type: 'text' },
      { key: 'feeRegistrationForeign', label: 'Registration Fee (Foreign)', type: 'text' },
    ],
  },
  {
    title: 'Payment Instructions',
    description: 'Shown to applicants on the /apply form.',
    fields: [
      { key: 'paymentOnlinePortalUrl', label: 'Online Payment Portal URL', type: 'url' },
      { key: 'paymentBankName', label: 'Bank Name', type: 'text' },
      { key: 'paymentReferenceCode', label: 'Reference / Account Code', type: 'text' },
      { key: 'paymentAccountHolderName', label: 'Account Holder Name', type: 'text' },
    ],
  },
  {
    title: 'Contact & Links',
    fields: [
      { key: 'contactEmail', label: 'Contact Email', type: 'email' },
      { key: 'fundedBy', label: 'Funded By', type: 'text' },
      { key: 'contactWebsiteUrl', label: 'Website URL', type: 'url' },
      { key: 'academicProgrammeUrl', label: 'Academic Programme URL', type: 'url' },
    ],
  },
]
