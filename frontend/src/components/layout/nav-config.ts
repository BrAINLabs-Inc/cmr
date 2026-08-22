import { History, LayoutDashboard, NotebookPen, Users } from 'lucide-react'
import type { ComponentType } from 'react'

export type NavItem = {
  title: string
  url: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

export const studentNav: NavItem[] = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, end: true },
  { title: 'Previous Entries', url: '/previous', icon: History },
]

export const adminNav: NavItem[] = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, end: true },
  { title: 'Students', url: '/admin/students', icon: Users },
  { title: 'Diary Entries', url: '/admin/entries', icon: NotebookPen },
]
