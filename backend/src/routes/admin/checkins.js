import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { validate } from '../../middleware/validate.js';
import { AppError } from '../../utils/AppError.js';
import { findStudentIdsMatching } from '../../utils/students.js';
import { listCheckinsQuerySchema } from '../../schemas/admin.schema.js';

const CHECKIN_COLUMNS = 'id, student_id, week_number, checkin, created_at, updated_at, student:students(id, name, email, student_number)';

export const checkinsRouter = Router();

checkinsRouter.get('/checkins', validate(listCheckinsQuerySchema, 'query'), async (req, res) => {
  const { week, q, page, pageSize } = req.query;

  const matchingIds = await findStudentIdsMatching(q);
  if (matchingIds && matchingIds.length === 0) {
    return res.json({ checkins: [], total: 0, page, pageSize });
  }

  let query = supabaseAdmin
    .from('weekly_checkins')
    .select(CHECKIN_COLUMNS, { count: 'exact' })
    .order('week_number', { ascending: false });

  if (week) query = query.eq('week_number', week);
  if (matchingIds) query = query.in('student_id', matchingIds);

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message);

  res.json({ checkins: data, total: count ?? data.length, page, pageSize });
});
