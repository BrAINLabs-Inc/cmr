import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PageLoading } from '@/components/PageLoading'
import { LandingPage } from '@/pages/landing/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ApplyPage } from '@/pages/ApplyPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'

const BoardMembersPage = lazy(() => import('@/pages/landing/BoardMembersPage').then((m) => ({ default: m.BoardMembersPage })))
const ResearchPage = lazy(() => import('@/pages/landing/ResearchPage').then((m) => ({ default: m.ResearchPage })))
const ServicesPage = lazy(() => import('@/pages/landing/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const ArchivesPage = lazy(() => import('@/pages/landing/ArchivesPage').then((m) => ({ default: m.ArchivesPage })))
const ContactPage = lazy(() => import('@/pages/landing/ContactPage').then((m) => ({ default: m.ContactPage })))

const DashboardPage = lazy(() => import('@/pages/student/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const DiaryWritePage = lazy(() => import('@/pages/student/DiaryWritePage').then((m) => ({ default: m.DiaryWritePage })))
const PreviousEntriesPage = lazy(() =>
  import('@/pages/student/PreviousEntriesPage').then((m) => ({ default: m.PreviousEntriesPage }))
)
const HelpPage = lazy(() => import('@/pages/student/HelpPage').then((m) => ({ default: m.HelpPage })))
const CheckinPage = lazy(() => import('@/pages/student/CheckinPage').then((m) => ({ default: m.CheckinPage })))
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const AdminStudentsPage = lazy(() => import('@/pages/admin/StudentsPage').then((m) => ({ default: m.StudentsPage })))
const AdminEntriesPage = lazy(() => import('@/pages/admin/EntriesPage').then((m) => ({ default: m.EntriesPage })))
const AdminCheckinsPage = lazy(() => import('@/pages/admin/CheckinsPage').then((m) => ({ default: m.CheckinsPage })))
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const AdminIntakesPage = lazy(() => import('@/pages/admin/IntakesPage').then((m) => ({ default: m.IntakesPage })))
const AdminApplicationsPage = lazy(() =>
  import('@/pages/admin/ApplicationsPage').then((m) => ({ default: m.ApplicationsPage }))
)

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/board-members" element={<BoardMembersPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/archives" element={<ArchivesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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
            <Route path="/admin/intakes" element={<AdminIntakesPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
