import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { validate } from '../../middleware/validate.js';
import { unwrap } from '../../utils/db.js';
import { AppError } from '../../utils/AppError.js';
import { courseSettingsPatchSchema } from '../../schemas/admin.schema.js';

const COURSE_SETTINGS_COLUMNS = '*, intake:intakes(id, intake_number, course_title, status)';

export const courseSettingsRouter = Router();

courseSettingsRouter.get('/course-settings', async (req, res) => {
  const settings = unwrap(
    await supabaseAdmin.from('course_settings').select(COURSE_SETTINGS_COLUMNS).eq('id', 1).single()
  );
  res.json({ settings });
});

courseSettingsRouter.patch('/course-settings', validate(courseSettingsPatchSchema), async (req, res) => {
  const { courseStartDate, courseEndDate, intakeId } = req.body;

  const current = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  const nextStart = courseStartDate ?? current.course_start_date;
  const nextEnd = courseEndDate ?? current.course_end_date;
  if (new Date(nextEnd) < new Date(nextStart)) {
    throw new AppError(400, 'End date must be on or after the start date.');
  }

  const patch = {};
  if (courseStartDate) patch.course_start_date = courseStartDate;
  if (courseEndDate) patch.course_end_date = courseEndDate;
  if (intakeId !== undefined) patch.intake_id = intakeId;

  // Changing the window invalidates any earlier admin approval: the new
  // dates need their own explicit "start" confirmation before students can
  // write into them.
  if (Object.keys(patch).length > 0) {
    patch.is_started = false;
    patch.started_at = null;
  }

  const settings = unwrap(
    await supabaseAdmin.from('course_settings').update(patch).eq('id', 1).select(COURSE_SETTINGS_COLUMNS).single()
  );
  res.json({ settings });
});

courseSettingsRouter.post('/course-settings/start', async (req, res) => {
  const settings = unwrap(
    await supabaseAdmin
      .from('course_settings')
      .update({ is_started: true, started_at: new Date().toISOString() })
      .eq('id', 1)
      .select(COURSE_SETTINGS_COLUMNS)
      .single()
  );
  res.json({ settings });
});

courseSettingsRouter.post('/course-settings/pause', async (req, res) => {
  const settings = unwrap(
    await supabaseAdmin
      .from('course_settings')
      .update({ is_started: false, started_at: null })
      .eq('id', 1)
      .select(COURSE_SETTINGS_COLUMNS)
      .single()
  );
  res.json({ settings });
});
