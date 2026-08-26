import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth, requireStudent } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkinWeekParamSchema, checkinBodySchema } from '../schemas/checkin.schema.js';
import { currentWeekNumber } from '../utils/weeks.js';
import { unwrap } from '../utils/db.js';
import { getCourseSettings, assertWeekIsOpen } from './diary.js';

export const checkinRouter = Router();
checkinRouter.use(requireAuth, requireStudent);

const EMPTY_CHECKIN = {};

function hasAnyData(checkin) {
  return Boolean(
    checkin?.meditation?.practiced !== undefined ||
      checkin?.mood?.feeling ||
      checkin?.gratitude?.some((g) => g?.trim()) ||
      checkin?.noticed?.trim() ||
      checkin?.goal?.intention?.trim()
  );
}

checkinRouter.get('/weeks', async (req, res) => {
  const settings = await getCourseSettings();
  const current = currentWeekNumber(settings);

  const rows = unwrap(
    await supabaseAdmin.from('weekly_checkins').select('week_number, checkin').eq('student_id', req.student.id)
  );

  const byWeek = new Map(rows.map((r) => [r.week_number, r]));
  const weeks = Array.from({ length: current }, (_, i) => {
    const weekNumber = i + 1;
    const row = byWeek.get(weekNumber);
    return {
      weekNumber,
      hasData: hasAnyData(row?.checkin),
      isCurrent: weekNumber === current,
    };
  }).reverse();

  res.json({ currentWeek: current, weeks });
});

checkinRouter.get('/stats', async (req, res) => {
  const settings = await getCourseSettings();
  const current = currentWeekNumber(settings);

  const rows = unwrap(
    await supabaseAdmin.from('weekly_checkins').select('week_number, checkin').eq('student_id', req.student.id)
  );
  const byWeek = new Map(rows.map((r) => [r.week_number, r]));

  let totalSessions = 0;
  let totalMinutes = 0;
  let weeksWithMeditation = 0;

  for (const r of rows) {
    const m = r.checkin?.meditation;
    if (m?.practiced) {
      totalSessions += m.sessions ?? 0;
      totalMinutes += m.minutes ?? 0;
      weeksWithMeditation += 1;
    }
  }

  function streakEndingAtCurrent(predicate) {
    let streak = 0;
    for (let w = current; w >= 1; w--) {
      if (predicate(byWeek.get(w)?.checkin)) {
        streak += 1;
        continue;
      }
      if (w === current) continue;
      break;
    }
    return streak;
  }

  const meditationStreak = streakEndingAtCurrent((c) => c?.meditation?.practiced === true);
  const checkinStreak = streakEndingAtCurrent(hasAnyData);

  res.json({
    meditation: {
      totalSessions,
      totalMinutes,
      currentStreak: meditationStreak,
      averageWeeklyMinutes: weeksWithMeditation ? Math.round(totalMinutes / weeksWithMeditation) : 0,
    },
    checkinStreak,
  });
});

checkinRouter.get('/:week', validate(checkinWeekParamSchema, 'params'), async (req, res) => {
  const { week } = req.params;
  const settings = await getCourseSettings();
  const currentWeek = currentWeekNumber(settings);

  const row = unwrap(
    await supabaseAdmin
      .from('weekly_checkins')
      .select('*')
      .eq('student_id', req.student.id)
      .eq('week_number', week)
      .maybeSingle()
  );

  res.json({
    checkin: row?.checkin ?? EMPTY_CHECKIN,
    updatedAt: row?.updated_at ?? null,
    currentWeek,
    isEditable: week === currentWeek,
  });
});

checkinRouter.put(
  '/:week',
  validate(checkinWeekParamSchema, 'params'),
  validate(checkinBodySchema, 'body'),
  async (req, res) => {
    const { week } = req.params;
    const { checkin } = req.body;

    const settings = await getCourseSettings();
    assertWeekIsOpen(week, currentWeekNumber(settings));

    const row = unwrap(
      await supabaseAdmin
        .from('weekly_checkins')
        .upsert(
          { student_id: req.student.id, week_number: week, checkin },
          { onConflict: 'student_id,week_number' }
        )
        .select('*')
        .single()
    );

    res.json({ checkin: row.checkin, updatedAt: row.updated_at });
  }
);
