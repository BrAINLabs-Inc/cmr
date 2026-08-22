import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set (see .env.example)')
}

// Used only for Supabase Auth (sign in / sign up / session). All other data
// access goes through the Express API, which enforces authorization itself.
export const supabase = createClient(url, anonKey)
