import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth, requireStudent } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { weekParamSchema, diaryContentSchema } from '../schemas/diary.schema.js';
import { currentWeekNumber, wordCount } from '../utils/weeks.js';
import { unwrap } from '../utils/db.js';
import { AppError } from '../utils/AppError.js';

export const diaryRouter = Router();
diaryRouter.use(requireAuth, requireStudent);

async function getCourseSettings() {
  return unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
}

// GET /api/diary/weeks — dashboard + previous-entries list
diaryRouter.get('/weeks', async (req, res) => {
  const settings = await getCourseSettings();
  const current = currentWeekNumber(settings);

  const entries = unwrap(
    await supabaseAdmin
      .from('diary_entries')
      .select('week_number, status, entry_date, submitted_at')
      .eq('student_id', req.student.id)
  );

  const byWeek = new Map(entries.map((e) => [e.week_number, e]));
  const weeks = Array.from({ length: settings.total_weeks }, (_, i) => {
    const weekNumber = i + 1;
    const entry = byWeek.get(weekNumber);
    return {
      weekNumber,
      status: entry?.status ?? 'not_started',
      submittedAt: entry?.submitted_at ?? null,
      isCurrent: weekNumber === current,
      isOpen: weekNumber <= current,
    };
  });

  res.json({ currentWeek: current, totalWeeks: settings.total_weeks, weeks });
});

// GET /api/diary/:week — fetch (or lazily initialize) one week's entry
diaryRouter.get('/:week', validate(weekParamSchema, 'params'), async (req, res) => {
  const { week } = req.params;

  const entry = unwrap(
    await supabaseAdmin
      .from('diary_entries')
      .select('*')
      .eq('student_id', req.student.id)
      .eq('week_number', week)
      .maybeSingle()
  );

  if (entry) return res.json({ entry });

  res.json({
    entry: {
      student_id: req.student.id,
      week_number: week,
      entry_date: new Date().toISOString().slice(0, 10),
      content: '',
      word_count: 0,
      status: 'draft',
      submitted_at: null,
    },
  });
});

async function upsertEntry({ studentId, week, content, status }) {
  const now = new Date().toISOString();
  const payload = {
    student_id: studentId,
    week_number: week,
    content,
    word_count: wordCount(content),
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

// PUT /api/diary/:week — save draft
diaryRouter.put(
  '/:week',
  validate(weekParamSchema, 'params'),
  validate(diaryContentSchema, 'body'),
  async (req, res) => {
    const { week } = req.params;
    const { content } = req.body;

    await assertNotSubmitted(req.student.id, week);

    const entry = await upsertEntry({ studentId: req.student.id, week, content, status: 'draft' });
    res.json({ entry });
  }
);

// POST /api/diary/:week/submit — finalize
diaryRouter.post(
  '/:week/submit',
  validate(weekParamSchema, 'params'),
  validate(diaryContentSchema, 'body'),
  async (req, res) => {
    const { week } = req.params;
    const { content } = req.body;

    if (content.trim() === '') {
      throw new AppError(400, 'Diary content cannot be empty');
    }

    await assertNotSubmitted(req.student.id, week);

    const entry = await upsertEntry({ studentId: req.student.id, week, content, status: 'submitted' });
    res.json({ entry });
  }
);
