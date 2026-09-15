import type { JSONContent } from '@tiptap/core'

export type Student = {
  id: string
  student_number: string
  name: string
  email: string
  status: 'active' | 'inactive'
  auth_user_id: string | null
  research_opt_out: boolean
  created_at: string
}

export type Admin = {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'research'
  auth_user_id: string | null
  created_at: string
}

export type MoodFeeling = 'very_good' | 'good' | 'okay' | 'not_great' | 'difficult'
export type GoalOutcome = 'not_started' | 'partially_achieved' | 'achieved' | 'exceeded'

export type DiaryCheckin = {
  meditation?: {
    practiced?: boolean
    minutes?: number
    sessions?: number
    type?: string
    reflection?: string
  }
  mood?: {
    feeling?: MoodFeeling
    happiness?: number
    stress?: number
    calmness?: number
    sleepQuality?: number
    wellbeing?: number
  }
  gratitude?: string[]
  noticed?: string
  goal?: {
    intention?: string
    outcome?: GoalOutcome
  }
}

export type DiaryEntry = {
  id?: string
  student_id: string
  week_number: number
  entry_date: string
  content?: JSONContent
  word_count: number
  status: 'draft' | 'submitted'
  submitted_at: string | null
  updated_at?: string
  research_opt_out?: boolean
  is_late?: boolean
  student?: Pick<Student, 'id' | 'name' | 'email' | 'student_number'>
}

// A week an active student never submitted, once its deadline has passed.
// Has no diary_entries row, so it's a synthesized entry rather than a real one.
export type MissedEntry = {
  student_id: string
  week_number: number
  has_late_access: boolean
  student: Pick<Student, 'id' | 'name' | 'email' | 'student_number'>
}

export type WeekSummary = {
  weekNumber: number
  status: 'not_started' | 'draft' | 'submitted'
  submittedAt: string | null
  wordCount: number
  isCurrent: boolean
  isOpen: boolean
  isLocked: boolean
  hasLateAccess?: boolean
  dueDate: string
}

export type WeeksResponse = {
  diaryStarted: boolean
  currentWeek: number
  totalWeeks: number
  weeks: WeekSummary[]
}

export type LateAccessGrant = {
  id: string
  week_number: number
  allowed: boolean
  note: string | null
  updated_at: string
}

export type WeeklyStats = {
  week: number
  totalStudents: number
  submitted: number
  pending: number
  submissionRate: number
}

export type MeditationStats = {
  meditation: {
    totalSessions: number
    totalMinutes: number
    currentStreak: number
    averageWeeklyMinutes: number
  }
  checkinStreak: number
}

export type CheckinWeekSummary = {
  weekNumber: number
  hasData: boolean
  isCurrent: boolean
}

export type CheckinWeeksResponse = {
  currentWeek: number
  weeks: CheckinWeekSummary[]
}

export type CheckinResponse = {
  checkin: DiaryCheckin
  updatedAt: string | null
  currentWeek: number
  isEditable: boolean
}

export type AdminCheckin = {
  id: string
  student_id: string
  week_number: number
  checkin: DiaryCheckin
  created_at: string
  updated_at: string
  student?: Pick<Student, 'id' | 'name' | 'email' | 'student_number'>
}

export type CheckinCohortStats = {
  week: number
  totalStudents: number
  checkedIn: number
  meditated: number
  checkinRate: number
  meditationRate: number
  moodCounts: Record<MoodFeeling, number>
}

export type IntakeStatus = 'upcoming' | 'open' | 'closed'

export type PublicIntake = {
  id: string
  intake_number: number
  course_title: string
  status: IntakeStatus
  application_closing_date: string | null
  closing_date_note: string | null
  commencing_date: string | null
  duration_text: string | null
  mode_text: string | null
  lecture_schedule_text: string | null
  modules: string[]
  objectives: string[]
  eligibility_text: string | null
  eligibility_special_category: string | null
  fee_course: string | null
  fee_application_local: string | null
  fee_application_foreign: string | null
  fee_registration_local: string | null
  fee_registration_foreign: string | null
  payment_online_portal_url: string | null
  payment_bank_name: string | null
  payment_account_holder_name: string | null
  payment_reference_code: string | null
  contact_email: string | null
  contact_website_url: string | null
  academic_programme_url: string | null
  funded_by: string | null
}

export type Intake = PublicIntake & {
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  application_count?: number
}

export type EducationQualification = 'undergraduate' | 'bachelor' | 'master' | 'mphil' | 'phd' | 'other'
export type HowHeard = 'social_media' | 'website' | 'friends' | 'other'
export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted'

export type ApplicationFileRef = {
  path: string
  filename: string
  mimeType: string
  sizeBytes: number
  url?: string | null
}

export type ApplicationSummary = {
  id: string
  intake_id: string
  full_name: string
  email: string
  phone_number: string
  nic_or_passport: string
  status: ApplicationStatus
  submitted_at: string
  intake?: Pick<Intake, 'id' | 'intake_number' | 'course_title'>
  student?: { student_number: string } | null
}

export type ApplicationDetail = ApplicationSummary & {
  title: string | null
  name_with_initials: string
  residential_address: string
  date_of_birth: string
  gender: 'male' | 'female' | 'prefer_not_to_say'
  whatsapp_number: string | null
  current_occupation: string
  education_qualification: EducationQualification
  education_qualification_other: string | null
  degree_name: string
  degree_documents: ApplicationFileRef[]
  reason_for_joining: string | null
  has_meditation_experience: boolean | null
  how_heard: HowHeard
  how_heard_other: string | null
  payment_slip: ApplicationFileRef
  admin_notes: string | null
  enrolled_student_id: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  reviewer?: { id: string; name: string | null; email: string } | null
  student?: { id: string; student_number: string; name: string } | null
}
