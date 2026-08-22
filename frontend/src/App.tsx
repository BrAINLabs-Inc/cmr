import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PageLoading } from '@/components/PageLoading'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

const DashboardPage = lazy(() => import('@/pages/student/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const DiaryWritePage = lazy(() => import('@/pages/student/DiaryWritePage').then((m) => ({ default: m.DiaryWritePage })))
const PreviousEntriesPage = lazy(() =>
  import('@/pages/student/PreviousEntriesPage').then((m) => ({ default: m.PreviousEntriesPage }))
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const AdminStudentsPage = lazy(() =>
  import('@/pages/admin/AdminStudentsPage').then((m) => ({ default: m.AdminStudentsPage }))
)
const AdminEntriesPage = lazy(() =>
  import('@/pages/admin/AdminEntriesPage').then((m) => ({ default: m.AdminEntriesPage }))
)

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute role="student" />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/diary/:week" element={<DiaryWritePage />} />
            <Route path="/previous" element={<PreviousEntriesPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<AppShell />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/entries" element={<AdminEntriesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
