import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { currentWeekNumber } from '../utils/weeks.js';
import { unwrap } from '../utils/db.js';
import { AppError } from '../utils/AppError.js';
import {
  listStudentsQuerySchema,
  createStudentSchema,
  bulkCreateStudentsSchema,
  patchStudentSchema,
  idParamSchema,
  listEntriesQuerySchema,
  exportQuerySchema,
  weeklyStatsQuerySchema,
  courseSettingsPatchSchema,
} from '../schemas/admin.schema.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

// A course cohort is at most a few hundred students; capping the roster
// read at 5000 is a safety net against unbounded queries, not a real limit.
const ROSTER_SAFETY_CAP = 5000;

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

adminRouter.get('/students', validate(listStudentsQuerySchema, 'query'), async (req, res) => {
  const { q, status, page, pageSize } = req.query;

  let query = supabaseAdmin.from('students').select('*').order('name').limit(ROSTER_SAFETY_CAP);
  if (status) query = query.eq('status', status);

  let students = unwrap(await query);

  if (q) {
    const needle = q.toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(needle) ||
        s.email.toLowerCase().includes(needle) ||
        s.student_number.toLowerCase().includes(needle)
    );
  }

  const total = students.length;
  const start = (page - 1) * pageSize;
  const page_ = students.slice(start, start + pageSize);

  res.json({ students: page_, total, page, pageSize });
});

adminRouter.post('/students', validate(createStudentSchema), async (req, res) => {
  const { studentNumber, name, email } = req.body;

  const student = unwrap(
    await supabaseAdmin.from('students').insert({ student_number: studentNumber, name, email }).select('*').single()
  );
  res.status(201).json({ student });
});

adminRouter.post('/students/bulk', validate(bulkCreateStudentsSchema), async (req, res) => {
  const rows = req.body.students.map((s) => ({
    student_number: s.studentNumber,
    name: s.name,
    email: s.email,
  }));

  const students = unwrap(await supabaseAdmin.from('students').insert(rows).select('*'));
  res.status(201).json({ students });
});

adminRouter.patch(
  '/students/:id',
  validate(idParamSchema, 'params'),
  validate(patchStudentSchema),
  async (req, res) => {
    const { status, name, email, studentNumber } = req.body;
    const patch = {};
    if (status) patch.status = status;
    if (name) patch.name = name;
    if (email) patch.email = email;
    if (studentNumber) patch.student_number = studentNumber;

    const student = unwrap(
      await supabaseAdmin.from('students').update(patch).eq('id', req.params.id).select('*').single(),
      'Student not found'
    );
    res.json({ student });
  }
);

// ---------------------------------------------------------------------------
// Diary entries
// ---------------------------------------------------------------------------

adminRouter.get('/entries', validate(listEntriesQuerySchema, 'query'), async (req, res) => {
  const { week, status, studentId, page, pageSize } = req.query;

  let query = supabaseAdmin
    .from('diary_entries')
    .select('*, student:students(id, name, email, student_number)', { count: 'exact' })
    .order('week_number', { ascending: false });

  if (week) query = query.eq('week_number', week);
  if (status) query = query.eq('status', status);
  if (studentId) query = query.eq('student_id', studentId);

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message);

  res.json({ entries: data, total: count ?? data.length, page, pageSize });
});

adminRouter.get('/entries/:id', validate(idParamSchema, 'params'), async (req, res) => {
  const entry = unwrap(
    await supabaseAdmin
      .from('diary_entries')
      .select('*, student:students(id, name, email, student_number)')
      .eq('id', req.params.id)
      .single(),
    'Entry not found'
  );
  res.json({ entry });
});

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

adminRouter.get('/stats/weekly', validate(weeklyStatsQuerySchema, 'query'), async (req, res) => {
  const settings = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  const week = req.query.week ?? currentWeekNumber(settings);

  const [{ count: totalStudents }, { count: submitted }] = await Promise.all([
    supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('diary_entries').select('*', { count: 'exact', head: true }).eq('week_number', week).eq('status', 'submitted'),
  ]);

  const pending = (totalStudents ?? 0) - (submitted ?? 0);
  const rate = totalStudents ? Math.round(((submitted ?? 0) / totalStudents) * 100) : 0;

  res.json({ week, totalStudents: totalStudents ?? 0, submitted: submitted ?? 0, pending, submissionRate: rate });
});

adminRouter.get('/students/:id/pending-weeks', validate(idParamSchema, 'params'), async (req, res) => {
  const settings = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  const current = currentWeekNumber(settings);

  const entries = unwrap(
    await supabaseAdmin.from('diary_entries').select('week_number, status').eq('student_id', req.params.id)
  );

  const submittedWeeks = new Set(entries.filter((e) => e.status === 'submitted').map((e) => e.week_number));
  const pendingWeeks = Array.from({ length: current }, (_, i) => i + 1).filter((w) => !submittedWeeks.has(w));

  res.json({ pendingWeeks });
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

function toCsv(rows) {
  const header = ['Student Number', 'Name', 'Email', 'Week', 'Entry Date', 'Status', 'Submitted Date', 'Word Count', 'Diary Entry'];
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
        row.content,
      ]
        .map(escape)
        .join(',')
    );
  }
  return lines.join('\r\n');
}

adminRouter.get('/export.csv', validate(exportQuerySchema, 'query'), async (req, res) => {
  const { week, status, deidentified } = req.query;

  let query = supabaseAdmin
    .from('diary_entries')
    .select('*, student:students(id, name, email, student_number)')
    .order('week_number')
    .limit(ROSTER_SAFETY_CAP * 104);

  if (week) query = query.eq('week_number', week);
  if (status) query = query.eq('status', status);

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

// ---------------------------------------------------------------------------
// Course settings
// ---------------------------------------------------------------------------

adminRouter.get('/course-settings', async (req, res) => {
  const settings = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  res.json({ settings });
});

adminRouter.patch('/course-settings', validate(courseSettingsPatchSchema), async (req, res) => {
  const { courseStartDate, totalWeeks } = req.body;
  const patch = {};
  if (courseStartDate) patch.course_start_date = courseStartDate;
  if (totalWeeks) patch.total_weeks = totalWeeks;

  const settings = unwrap(await supabaseAdmin.from('course_settings').update(patch).eq('id', 1).select('*').single());
  res.json({ settings });
});
