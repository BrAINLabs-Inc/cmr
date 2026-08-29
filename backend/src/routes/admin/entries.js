import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { validate } from '../../middleware/validate.js';
import { unwrap } from '../../utils/db.js';
import { AppError } from '../../utils/AppError.js';
import { extractPlainText } from '../../utils/weeks.js';
import { findStudentIdsMatching } from '../../utils/students.js';
import { listEntriesQuerySchema, exportQuerySchema, idParamSchema } from '../../schemas/admin.schema.js';

const ROSTER_SAFETY_CAP = 5000;
const ENTRY_METADATA_COLUMNS =
  'id, student_id, week_number, entry_date, word_count, status, submitted_at, updated_at, research_opt_out, student:students(id, name, email, student_number)';

export const entriesRouter = Router();

entriesRouter.get('/entries', validate(listEntriesQuerySchema, 'query'), async (req, res) => {
  const { week, status, studentId, q, page, pageSize } = req.query;

  const matchingIds = await findStudentIdsMatching(q);
  if (matchingIds && matchingIds.length === 0) {
    return res.json({ entries: [], total: 0, page, pageSize });
  }

  let query = supabaseAdmin
    .from('diary_entries')
    .select(ENTRY_METADATA_COLUMNS, { count: 'exact' })
    .order('week_number', { ascending: false });

  if (week) query = query.eq('week_number', week);
  if (status) query = query.eq('status', status);
  if (studentId) query = query.eq('student_id', studentId);
  if (matchingIds) query = query.in('student_id', matchingIds);

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message);

  res.json({ entries: data, total: count ?? data.length, page, pageSize });
});

entriesRouter.get('/entries/:id', validate(idParamSchema, 'params'), async (req, res) => {
  const entry = unwrap(
    await supabaseAdmin.from('diary_entries').select(ENTRY_METADATA_COLUMNS).eq('id', req.params.id).single(),
    'Entry not found'
  );
  res.json({ entry });
});

function toCsv(rows) {
  const header = ['Student Number', 'Name', 'Email', 'Week', 'Entry Date', 'Status', 'Submitted Date', 'Word Count', 'Research Opt-Out', 'Diary Entry'];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [header.map(escape).join(',')];

  for (const row of rows) {
    lines.push(
      [
        row.student?.student_number,
        row.student?.name,
        row.student?.email,
        row.week_number,
        row.entry_date,
        row.status,
        row.submitted_at ?? '',
        row.word_count,
        row.research_opt_out ? 'Yes' : 'No',
        extractPlainText(row.content),
      ]
        .map(escape)
        .join(',')
    );
  }
  return lines.join('\r\n');
}

entriesRouter.get('/export.csv', validate(exportQuerySchema, 'query'), async (req, res) => {
  const { week, status, q, deidentified } = req.query;

  const matchingIds = await findStudentIdsMatching(q);
  if (matchingIds && matchingIds.length === 0) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="diary-entries-${Date.now()}.csv"`);
    return res.send(toCsv([]));
  }

  let query = supabaseAdmin
    .from('diary_entries')
    .select('*, student:students(id, name, email, student_number)')
    .order('week_number')
    .limit(ROSTER_SAFETY_CAP * 104);

  if (week) query = query.eq('week_number', week);
  if (status) query = query.eq('status', status);
  if (matchingIds) query = query.in('student_id', matchingIds);
  if (deidentified) query = query.eq('research_opt_out', false);

  const data = unwrap(await query);

  const rows = deidentified
    ? data.map((r) => ({
        ...r,
        student: { student_number: r.student?.id?.slice(0, 8), name: 'REDACTED', email: 'REDACTED' },
      }))
    : data;

  const csv = toCsv(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="diary-entries-${Date.now()}.csv"`);
  res.send(csv);
});
