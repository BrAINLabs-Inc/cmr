import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { PageLoading } from '@/components/PageLoading'

export function ProtectedRoute({ role }: { role: 'student' | 'admin' }) {
  const { loading, session, role: userRole } = useAuth()

  if (loading) return <PageLoading />
  if (!session) return <Navigate to="/login" replace />
  if (userRole !== role) return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />

  return <Outlet />
}
