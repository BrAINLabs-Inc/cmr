import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Admin, Student } from '@/lib/types'

export type AuthState = {
  loading: boolean
  session: Session | null
  role: 'student' | 'admin' | null
  profile: Student | Admin | null
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | undefined>(undefined)
