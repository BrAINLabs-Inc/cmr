import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import type { Admin, Student } from '@/lib/types'
import { AuthContext, type AuthState } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<'student' | 'admin' | null>(null)
  const [profile, setProfile] = useState<Student | Admin | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      const me = await api.get<{ role: 'student' | 'admin'; profile: Student | Admin }>('/auth/me')
      setRole(me.role)
      setProfile(me.profile)
    } catch {
      setRole(null)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) await loadProfile()
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        await loadProfile()
      } else {
        setRole(null)
        setProfile(null)
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value: AuthState = { loading, session, role, profile, refreshProfile: loadProfile, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
