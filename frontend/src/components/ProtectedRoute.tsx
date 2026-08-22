import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute({ role }: { role: 'student' | 'admin' }) {
  const { loading, session, role: userRole } = useAuth()

  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (userRole !== role) return <Navigate to={userRole === 'admin' ? '/admin' : '/'} replace />

  return <Outlet />
}
