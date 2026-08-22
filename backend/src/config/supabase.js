import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Service-role client: bypasses RLS. Every request is authorized in
// middleware/auth.js before this client is used, so it is never exposed
// to the frontend directly.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
