import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from './AppError.js';

// At most one intake is published at a time (enforced by the partial unique
// index idx_intakes_published), so this is always a single-row lookup.
export async function getPublishedIntake(columns = '*') {
  const { data, error } = await supabaseAdmin.from('intakes').select(columns).eq('is_published', true).maybeSingle();
  if (error) throw new AppError(500, error.message);
  return data;
}
