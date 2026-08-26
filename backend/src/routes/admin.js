import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { currentWeekNumber, extractPlainText } from '../utils/weeks.js';
import { escapeLikeValue } from '../utils/text.js';
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
  listCheckinsQuerySchema,
  courseSettingsPatchSchema,
} from '../schemas/admin.schema.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

const ROSTER_SAFETY_CAP = 5000;

function nameEmailIdSearchFilter(q) {
  const safe = escapeLikeValue(q.replace(/[,()]/g, ' ').trim());
  const needle = `%${safe}%`;
  return `name.ilike.${needle},email.ilike.${needle},student_number.ilike.${needle}`;
}

adminRouter.get('/students', validate(listStudentsQuerySchema, 'query'), async (req, res) => {
  const { q, status, page, pageSize } = req.query;

  let query = supabaseAdmin.from('students').select('*', { count: 'exact' }).order('name');
  if (status) query = query.eq('status', status);
  if (q) query = query.or(nameEmailIdSearchFilter(q));

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message);

  res.json({ students: data, total: count ?? data.length, page, pageSize });
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

const ENTRY_METADATA_COLUMNS =
  'id, student_id, week_number, entry_date, word_count, status, submitted_at, updated_at, research_opt_out, student:students(id, name, email, student_number)';

async function findStudentIdsMatching(q) {
  if (!q) return null;
  const matches = unwrap(await supabaseAdmin.from('students').select('id').or(nameEmailIdSearchFilter(q)));
  return matches.map((s) => s.id);
}

adminRouter.get('/entries', validate(listEntriesQuerySchema, 'query'), async (req, res) => {
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

adminRouter.get('/entries/:id', validate(idParamSchema, 'params'), async (req, res) => {
  const entry = unwrap(
    await supabaseAdmin.from('diary_entries').select(ENTRY_METADATA_COLUMNS).eq('id', req.params.id).single(),
    'Entry not found'
  );
  res.json({ entry });
});

const CHECKIN_COLUMNS = 'id, student_id, week_number, checkin, created_at, updated_at, student:students(id, name, email, student_number)';

adminRouter.get('/checkins', validate(listCheckinsQuerySchema, 'query'), async (req, res) => {
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

adminRouter.get('/students/:id/checkins', validate(idParamSchema, 'params'), async (req, res) => {
  const checkins = unwrap(
    await supabaseAdmin
      .from('weekly_checkins')
      .select('id, week_number, checkin, created_at, updated_at')
      .eq('student_id', req.params.id)
      .order('week_number', { ascending: false })
  );
  res.json({ checkins });
});

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

adminRouter.get('/stats/overview', async (req, res) => {
  const settings = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  const currentWeek = currentWeekNumber(settings);

  const [studentsResult, entriesResult] = await Promise.all([
    supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('diary_entries').select('week_number, status').lte('week_number', currentWeek).eq('status', 'submitted'),
  ]);
  const totalStudents = studentsResult.count;
  const entries = unwrap(entriesResult);

  const submittedByWeek = new Map();
  for (const e of entries) {
    submittedByWeek.set(e.week_number, (submittedByWeek.get(e.week_number) ?? 0) + 1);
  }

  const weeks = Array.from({ length: currentWeek }, (_, i) => {
    const week = i + 1;
    const submitted = submittedByWeek.get(week) ?? 0;
    return {
      week,
      submitted,
      submissionRate: totalStudents ? Math.round((submitted / totalStudents) * 100) : 0,
    };
  });

  res.json({ currentWeek, totalStudents: totalStudents ?? 0, weeks });
});

adminRouter.get('/stats/checkins', async (req, res) => {
  const settings = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  const week = currentWeekNumber(settings);

  const [studentsResult, checkinsResult] = await Promise.all([
    supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('weekly_checkins').select('checkin').eq('week_number', week),
  ]);
  const totalStudents = studentsResult.count ?? 0;
  const checkins = unwrap(checkinsResult);

  const moodCounts = { very_good: 0, good: 0, okay: 0, not_great: 0, difficult: 0 };
  let meditated = 0;
  let loggedAny = 0;

  for (const row of checkins) {
    const c = row.checkin ?? {};
    const hasData = Boolean(
      c.meditation?.practiced !== undefined || c.mood?.feeling || c.gratitude?.some((g) => g?.trim()) || c.noticed?.trim() || c.goal?.intention?.trim()
    );
    if (hasData) loggedAny += 1;
    if (c.meditation?.practiced) meditated += 1;
    if (c.mood?.feeling && c.mood.feeling in moodCounts) moodCounts[c.mood.feeling] += 1;
  }

  res.json({
    week,
    totalStudents,
    checkedIn: loggedAny,
    meditated,
    checkinRate: totalStudents ? Math.round((loggedAny / totalStudents) * 100) : 0,
    meditationRate: totalStudents ? Math.round((meditated / totalStudents) * 100) : 0,
    moodCounts,
  });
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

adminRouter.get('/export.csv', validate(exportQuerySchema, 'query'), async (req, res) => {
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

adminRouter.get('/course-settings', async (req, res) => {
  const settings = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  res.json({ settings });
});

adminRouter.patch('/course-settings', validate(courseSettingsPatchSchema), async (req, res) => {
  const { courseStartDate, courseEndDate, intakeLabel } = req.body;

  const current = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  const nextStart = courseStartDate ?? current.course_start_date;
  const nextEnd = courseEndDate ?? current.course_end_date;
  if (new Date(nextEnd) < new Date(nextStart)) {
    throw new AppError(400, 'End date must be on or after the start date.');
  }

  const patch = {};
  if (courseStartDate) patch.course_start_date = courseStartDate;
  if (courseEndDate) patch.course_end_date = courseEndDate;
  if (intakeLabel !== undefined) patch.intake_label = intakeLabel || null;

  const settings = unwrap(await supabaseAdmin.from('course_settings').update(patch).eq('id', 1).select('*').single());
  res.json({ settings });
});
