import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { validate } from '../../middleware/validate.js';
import { unwrap } from '../../utils/db.js';
import { currentWeekNumber } from '../../utils/weeks.js';
import { weeklyStatsQuerySchema } from '../../schemas/admin.schema.js';

export const statsRouter = Router();

statsRouter.get('/stats/weekly', validate(weeklyStatsQuerySchema, 'query'), async (req, res) => {
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

statsRouter.get('/stats/overview', async (req, res) => {
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

statsRouter.get('/stats/checkins', async (req, res) => {
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
