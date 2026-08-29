import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { studentsRouter } from './students.js';
import { entriesRouter } from './entries.js';
import { checkinsRouter } from './checkins.js';
import { statsRouter } from './stats.js';
import { courseSettingsRouter } from './courseSettings.js';
import { intakesRouter } from './intakes.js';
import { applicationsRouter } from './applications.js';

// Every admin route shares one auth check here, instead of each resource
// router repeating requireAuth/requireAdmin (which would otherwise re-verify
// the same bearer token with Supabase once per sub-router on every request).
export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.use(studentsRouter);
adminRouter.use(entriesRouter);
adminRouter.use(checkinsRouter);
adminRouter.use(statsRouter);
adminRouter.use(courseSettingsRouter);
adminRouter.use('/intakes', intakesRouter);
adminRouter.use('/applications', applicationsRouter);
