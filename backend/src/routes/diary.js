import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth, requireStudent } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { weekParamSchema, diaryContentSchema } from '../schemas/diary.schema.js';
import { currentWeekNumber, wordCount, extractPlainText, weekDueDate } from '../utils/weeks.js';
import { unwrap } from '../utils/db.js';
import { AppError } from '../utils/AppError.js';

export const diaryRouter = Router();
diaryRouter.use(requireAuth, requireStudent);

const EMPTY_DOC = { type: 'doc', content: [] };

export async function getCourseSettings() {
  return unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
}

export function assertWeekIsOpen(week, currentWeek, lateAccessAllowed = false) {
  if (week === currentWeek) return;
  if (lateAccessAllowed && week < currentWeek) return;
  throw new AppError(
    403,
    week < currentWeek
      ? 'The deadline for this week has passed. It can no longer be edited or submitted.'
      : 'This week has not opened yet.'
  );
}

export function assertDiaryStarted(settings) {
  if (!settings.is_started) {
    throw new AppError(403, 'The diary has not been started yet. Please wait for admin approval.');
  }
}

export async function hasLateAccess(studentId, week) {
  const grant = unwrap(
    await supabaseAdmin
      .from('diary_late_access')
      .select('allowed')
      .eq('student_id', studentId)
      .eq('week_number', week)
      .maybeSingle()
  );
  return grant?.allowed === true;
}

diaryRouter.get('/weeks', async (req, res) => {
  const settings = await getCourseSettings();

  if (!settings.is_started) {
    return res.json({ diaryStarted: false, currentWeek: 0, totalWeeks: settings.total_weeks, weeks: [] });
  }

  const current = currentWeekNumber(settings);

  const [entries, lateAccessGrants] = await Promise.all([
    unwrap(
      await supabaseAdmin
        .from('diary_entries')
        .select('week_number, status, entry_date, submitted_at, word_count')
        .eq('student_id', req.student.id)
    ),
    unwrap(
      await supabaseAdmin
        .from('diary_late_access')
        .select('week_number, allowed')
        .eq('student_id', req.student.id)
        .eq('allowed', true)
    ),
  ]);

  const byWeek = new Map(entries.map((e) => [e.week_number, e]));
  const lateAccessWeeks = new Set(lateAccessGrants.map((g) => g.week_number));
  const weeks = Array.from({ length: settings.total_weeks }, (_, i) => {
    const weekNumber = i + 1;
    const entry = byWeek.get(weekNumber);
    const status = entry?.status ?? 'not_started';
    const lateAccess = weekNumber < current && lateAccessWeeks.has(weekNumber);
    return {
      weekNumber,
      status,
      submittedAt: entry?.submitted_at ?? null,
      wordCount: entry?.word_count ?? 0,
      isCurrent: weekNumber === current,
      isOpen: weekNumber <= current,
      isLocked: weekNumber < current && status !== 'submitted' && !lateAccess,
      hasLateAccess: lateAccess,
      dueDate: weekDueDate(settings.course_start_date, weekNumber),
    };
  });

  res.json({ diaryStarted: true, currentWeek: current, totalWeeks: settings.total_weeks, weeks });
});

diaryRouter.get('/:week', validate(weekParamSchema, 'params'), async (req, res) => {
  const { week } = req.params;
  const settings = await getCourseSettings();
  assertDiaryStarted(settings);
  const currentWeek = currentWeekNumber(settings);
  const hasLateAccessGrant = week < currentWeek ? await hasLateAccess(req.student.id, week) : false;

  const entry = unwrap(
    await supabaseAdmin
      .from('diary_entries')
      .select('*')
      .eq('student_id', req.student.id)
      .eq('week_number', week)
      .maybeSingle()
  );

  if (entry) return res.json({ entry, currentWeek, hasLateAccess: hasLateAccessGrant });

  res.json({
    entry: {
      student_id: req.student.id,
      week_number: week,
      entry_date: new Date().toISOString().slice(0, 10),
      content: EMPTY_DOC,
      word_count: 0,
      status: 'draft',
      submitted_at: null,
      research_opt_out: false,
    },
    currentWeek,
    hasLateAccess: hasLateAccessGrant,
  });
});

async function upsertEntry({ studentId, week, content, status }) {
  const now = new Date().toISOString();
  const payload = {
    student_id: studentId,
    week_number: week,
    content,
    word_count: wordCount(extractPlainText(content)),
    status,
    entry_date: new Date().toISOString().slice(0, 10),
    ...(status === 'submitted' ? { submitted_at: now } : {}),
  };

  return unwrap(
    await supabaseAdmin.from('diary_entries').upsert(payload, { onConflict: 'student_id,week_number' }).select('*').single()
  );
}

async function assertNotSubmitted(studentId, week) {
  const existing = unwrap(
    await supabaseAdmin.from('diary_entries').select('status').eq('student_id', studentId).eq('week_number', week).maybeSingle()
  );
  if (existing?.status === 'submitted') {
    throw new AppError(409, 'This entry has already been submitted and cannot be edited.');
  }
}

diaryRouter.put(
  '/:week',
  validate(weekParamSchema, 'params'),
  validate(diaryContentSchema, 'body'),
  async (req, res) => {
    const { week } = req.params;
    const { content } = req.body;

    const settings = await getCourseSettings();
    assertDiaryStarted(settings);
    const currentWeek = currentWeekNumber(settings);
    const lateAccess = week < currentWeek ? await hasLateAccess(req.student.id, week) : false;
    assertWeekIsOpen(week, currentWeek, lateAccess);
    await assertNotSubmitted(req.student.id, week);

    const entry = await upsertEntry({ studentId: req.student.id, week, content, status: 'draft' });
    res.json({ entry });
  }
);

diaryRouter.post(
  '/:week/submit',
  validate(weekParamSchema, 'params'),
  validate(diaryContentSchema, 'body'),
  async (req, res) => {
    const { week } = req.params;
    const { content } = req.body;

    if (extractPlainText(content).trim() === '') {
      throw new AppError(400, 'Diary content cannot be empty');
    }

    const settings = await getCourseSettings();
    assertDiaryStarted(settings);
    const currentWeek = currentWeekNumber(settings);
    const lateAccess = week < currentWeek ? await hasLateAccess(req.student.id, week) : false;
    assertWeekIsOpen(week, currentWeek, lateAccess);
    await assertNotSubmitted(req.student.id, week);

    const entry = await upsertEntry({ studentId: req.student.id, week, content, status: 'submitted' });
    res.json({ entry });
  }
);

diaryRouter.delete('/:week', validate(weekParamSchema, 'params'), async (req, res) => {
  const { week } = req.params;

  const settings = await getCourseSettings();
  assertDiaryStarted(settings);
  const currentWeek = currentWeekNumber(settings);
  const lateAccess = week < currentWeek ? await hasLateAccess(req.student.id, week) : false;
  assertWeekIsOpen(week, currentWeek, lateAccess);
  await assertNotSubmitted(req.student.id, week);

  await unwrap(
    await supabaseAdmin.from('diary_entries').delete().eq('student_id', req.student.id).eq('week_number', week)
  );
  res.status(204).end();
});

diaryRouter.get('/export/csv', async (req, res) => {
  const entries = unwrap(
    await supabaseAdmin
      .from('diary_entries')
      .select('week_number, entry_date, status, submitted_at, word_count, content')
      .eq('student_id', req.student.id)
      .order('week_number')
  );

  const header = ['Week', 'Entry Date', 'Status', 'Submitted Date', 'Word Count', 'Diary Entry'];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [header.map(escape).join(',')];
  for (const e of entries) {
    lines.push(
      [e.week_number, e.entry_date, e.status, e.submitted_at ?? '', e.word_count, extractPlainText(e.content)]
        .map(escape)
        .join(',')
    );
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="my-diary-${Date.now()}.csv"`);
  res.send(lines.join('\r\n'));
});
