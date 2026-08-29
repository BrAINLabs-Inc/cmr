import {
  CalendarRange,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  History,
  LayoutDashboard,
  NotebookPen,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'

export type NavItem = {
  title: string
  url: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

export const studentNav: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, end: true },
  { title: 'Previous Entries', url: '/previous', icon: History },
  { title: 'Weekly Check-in', url: '/checkin', icon: HeartHandshake },
  { title: 'Help & Guidelines', url: '/help', icon: CircleHelp },
]

export const adminNav: NavItem[] = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, end: true },
  { title: 'Students', url: '/admin/students', icon: Users },
  { title: 'Diary Entries', url: '/admin/entries', icon: NotebookPen },
  { title: 'Check-ins', url: '/admin/checkins', icon: HeartHandshake },
  { title: 'Intakes', url: '/admin/intakes', icon: GraduationCap },
  { title: 'Applications', url: '/admin/applications', icon: ClipboardList },
  { title: 'Course Settings', url: '/admin/settings', icon: CalendarRange },
]
