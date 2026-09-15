import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { validate } from '../../middleware/validate.js';
import { unwrap } from '../../utils/db.js';
import { AppError } from '../../utils/AppError.js';
import { currentWeekNumber, extractPlainText, weekDueDate } from '../../utils/weeks.js';
import { findStudentIdsMatching } from '../../utils/students.js';
import {
  listEntriesQuerySchema,
  exportQuerySchema,
  idParamSchema,
  missedEntriesQuerySchema,
} from '../../schemas/admin.schema.js';

const ROSTER_SAFETY_CAP = 5000;
const ENTRY_METADATA_COLUMNS =
  'id, student_id, week_number, entry_date, word_count, status, submitted_at, updated_at, research_opt_out, student:students(id, name, email, student_number)';

export const entriesRouter = Router();

// An entry counts as a late submission once its submitted_at falls after
// the week's normal due date, i.e. it could only have gone in via a
// diary_late_access grant (or before that feature existed, a very late
// autosave/deadline edge case) — either way, admins reviewing submissions
// need to see it wasn't on time.
function withLateFlag(entries, courseStartDate) {
  return entries.map((e) => ({
    ...e,
    is_late:
      e.status === 'submitted' &&
      !!e.submitted_at &&
      new Date(e.submitted_at) > new Date(`${weekDueDate(courseStartDate, e.week_number)}T23:59:59`),
  }));
}

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

  const settings = unwrap(await supabaseAdmin.from('course_settings').select('course_start_date').eq('id', 1).single());

  res.json({ entries: withLateFlag(data, settings.course_start_date), total: count ?? data.length, page, pageSize });
});

// Weeks a student never submitted, once their deadline has passed — these
// have no diary_entries row at all, so they can't show up in the listing
// above. Synthesized here per active student x week instead.
entriesRouter.get('/entries/missed', validate(missedEntriesQuerySchema, 'query'), async (req, res) => {
  const { week, q, page, pageSize } = req.query;

  const settings = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  if (!settings.is_started) return res.json({ entries: [], total: 0, page, pageSize });

  const currentWeek = currentWeekNumber(settings);
  const weeksToCheck = week
    ? currentWeek > week
      ? [week]
      : []
    : Array.from({ length: currentWeek - 1 }, (_, i) => i + 1);
  if (weeksToCheck.length === 0) return res.json({ entries: [], total: 0, page, pageSize });

  const matchingIds = await findStudentIdsMatching(q);
  if (matchingIds && matchingIds.length === 0) return res.json({ entries: [], total: 0, page, pageSize });

  let studentsQuery = supabaseAdmin
    .from('students')
    .select('id, name, email, student_number')
    .eq('status', 'active')
    .order('name');
  if (matchingIds) studentsQuery = studentsQuery.in('id', matchingIds);
  const students = unwrap(await studentsQuery);
  if (students.length === 0) return res.json({ entries: [], total: 0, page, pageSize });

  const studentIds = students.map((s) => s.id);

  const [submittedRows, lateAccessRows] = await Promise.all([
    unwrap(
      await supabaseAdmin
        .from('diary_entries')
        .select('student_id, week_number')
        .in('student_id', studentIds)
        .in('week_number', weeksToCheck)
        .eq('status', 'submitted')
    ),
    unwrap(
      await supabaseAdmin
        .from('diary_late_access')
        .select('student_id, week_number')
        .in('student_id', studentIds)
        .in('week_number', weeksToCheck)
        .eq('allowed', true)
    ),
  ]);
  const submittedSet = new Set(submittedRows.map((r) => `${r.student_id}:${r.week_number}`));
  const lateAccessSet = new Set(lateAccessRows.map((r) => `${r.student_id}:${r.week_number}`));
  const studentById = new Map(students.map((s) => [s.id, s]));

  const missed = [];
  for (const studentId of studentIds) {
    for (const w of weeksToCheck) {
      const key = `${studentId}:${w}`;
      if (submittedSet.has(key)) continue;
      missed.push({ student_id: studentId, week_number: w, has_late_access: lateAccessSet.has(key), student: studentById.get(studentId) });
    }
  }
  missed.sort((a, b) => b.week_number - a.week_number || a.student.name.localeCompare(b.student.name));

  const total = missed.length;
  const start = (page - 1) * pageSize;
  res.json({ entries: missed.slice(start, start + pageSize), total, page, pageSize });
});

const ENTRY_FULL_COLUMNS =
  'id, student_id, week_number, entry_date, content, word_count, status, submitted_at, updated_at, research_opt_out, student:students(id, name, email, student_number)';

entriesRouter.get('/entries/:id', validate(idParamSchema, 'params'), async (req, res) => {
  const entry = unwrap(
    await supabaseAdmin.from('diary_entries').select(ENTRY_FULL_COLUMNS).eq('id', req.params.id).single(),
    'Entry not found'
  );
  const settings = unwrap(await supabaseAdmin.from('course_settings').select('course_start_date').eq('id', 1).single());
  res.json({ entry: withLateFlag([entry], settings.course_start_date)[0] });
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
