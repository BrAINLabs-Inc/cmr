import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PageLoading } from '@/components/PageLoading'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

const DashboardPage = lazy(() => import('@/pages/student/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const DiaryWritePage = lazy(() => import('@/pages/student/DiaryWritePage').then((m) => ({ default: m.DiaryWritePage })))
const PreviousEntriesPage = lazy(() =>
  import('@/pages/student/PreviousEntriesPage').then((m) => ({ default: m.PreviousEntriesPage }))
)
const HelpPage = lazy(() => import('@/pages/student/HelpPage').then((m) => ({ default: m.HelpPage })))
const CheckinPage = lazy(() => import('@/pages/student/CheckinPage').then((m) => ({ default: m.CheckinPage })))
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const AdminStudentsPage = lazy(() =>
  import('@/pages/admin/AdminStudentsPage').then((m) => ({ default: m.AdminStudentsPage }))
)
const AdminEntriesPage = lazy(() =>
  import('@/pages/admin/AdminEntriesPage').then((m) => ({ default: m.AdminEntriesPage }))
)
const AdminCheckinsPage = lazy(() =>
  import('@/pages/admin/AdminCheckinsPage').then((m) => ({ default: m.AdminCheckinsPage }))
)
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
)

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute role="student" />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/diary/:week" element={<DiaryWritePage />} />
            <Route path="/previous" element={<PreviousEntriesPage />} />
            <Route path="/checkin" element={<CheckinPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<AppShell />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/entries" element={<AdminEntriesPage />} />
            <Route path="/admin/checkins" element={<AdminCheckinsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
