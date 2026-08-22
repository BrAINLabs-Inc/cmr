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

export type DiaryEntry = {
  id?: string
  student_id: string
  week_number: number
  entry_date: string
  content: string
  word_count: number
  status: 'draft' | 'submitted'
  submitted_at: string | null
  student?: Pick<Student, 'id' | 'name' | 'email' | 'student_number'>
}

export type WeekSummary = {
  weekNumber: number
  status: 'not_started' | 'draft' | 'submitted'
  submittedAt: string | null
  isCurrent: boolean
  isOpen: boolean
}

export type WeeksResponse = {
  currentWeek: number
  totalWeeks: number
  weeks: WeekSummary[]
}

export type WeeklyStats = {
  week: number
  totalStudents: number
  submitted: number
  pending: number
  submissionRate: number
}
