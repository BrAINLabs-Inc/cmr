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
  student?: Pick<Student, 'id' | 'name' | 'email' | 'student_number'>
}

export type WeekSummary = {
  weekNumber: number
  status: 'not_started' | 'draft' | 'submitted'
  submittedAt: string | null
  isCurrent: boolean
  isOpen: boolean
  isLocked: boolean
  dueDate: string
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
