import { supabaseAdmin } from '../config/supabase.js';
import { escapeLikeValue } from './text.js';
import { unwrap } from './db.js';

export function nameEmailIdSearchFilter(q) {
  const safe = escapeLikeValue(q.replace(/[,()]/g, ' ').trim());
  const needle = `%${safe}%`;
  return `name.ilike.${needle},email.ilike.${needle},student_number.ilike.${needle}`;
}

// Diary entries and checkins don't carry a student's name/email of their
// own, so list/export endpoints that search by them first resolve the
// search term to a set of student ids here, then filter by student_id.
export async function findStudentIdsMatching(q) {
  if (!q) return null;
  const matches = unwrap(await supabaseAdmin.from('students').select('id').or(nameEmailIdSearchFilter(q)));
  return matches.map((s) => s.id);
}
