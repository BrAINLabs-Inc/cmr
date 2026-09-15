import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { validate } from '../../middleware/validate.js';
import { unwrap } from '../../utils/db.js';
import { AppError } from '../../utils/AppError.js';
import { signApplicationFiles } from '../../utils/storage.js';
import { enrollApplicantAsStudent } from '../../utils/enrollment.js';
import {
  applyApplicationFilters,
  fetchApplicationsForExport,
  buildApplicationsCsv,
  buildApplicationsXlsx,
  streamApplicationsPdf,
} from '../../utils/applicationExport.js';
import {
  listApplicationsQuerySchema,
  exportApplicationsQuerySchema,
  patchApplicationSchema,
  idParamSchema,
} from '../../schemas/applications.schema.js';

// Auth/admin guarding is applied once by the parent router (see ./index.js).
export const applicationsRouter = Router();

const LIST_COLUMNS =
  'id, intake_id, full_name, email, phone_number, nic_or_passport, status, submitted_at, ' +
  'intake:intakes(id, intake_number, course_title), student:students(student_number)';

applicationsRouter.get('/', validate(listApplicationsQuerySchema, 'query'), async (req, res) => {
  const { intakeId, status, q, page, pageSize } = req.query;

  let query = supabaseAdmin
    .from('applications')
    .select(LIST_COLUMNS, { count: 'exact' })
    .order('submitted_at', { ascending: false });
  query = applyApplicationFilters(query, { intakeId, status, q });

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message);

  res.json({ applications: data, total: count ?? data.length, page, pageSize });
});

function describeExportFilters({ intakeId, status, q }, rows) {
  const parts = [];
  if (intakeId && rows[0]?.intake) parts.push(`Intake ${rows[0].intake.intake_number}`);
  if (status) parts.push(`Status: ${status}`);
  if (q) parts.push(`Search: "${q}"`);
  return parts.join(' · ');
}

applicationsRouter.get('/export.csv', validate(exportApplicationsQuerySchema, 'query'), async (req, res) => {
  const rows = await fetchApplicationsForExport(req.query);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="applications-${Date.now()}.csv"`);
  res.send(buildApplicationsCsv(rows));
});

applicationsRouter.get('/export.xlsx', validate(exportApplicationsQuerySchema, 'query'), async (req, res) => {
  const rows = await fetchApplicationsForExport(req.query);
  const buffer = await buildApplicationsXlsx(rows);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="applications-${Date.now()}.xlsx"`);
  res.send(buffer);
});

applicationsRouter.get('/export.pdf', validate(exportApplicationsQuerySchema, 'query'), async (req, res) => {
  const rows = await fetchApplicationsForExport(req.query);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="applications-${Date.now()}.pdf"`);
  streamApplicationsPdf(res, rows, describeExportFilters(req.query, rows));
});

const DETAIL_COLUMNS =
  '*, intake:intakes(id, intake_number, course_title), ' +
  'reviewer:admins!applications_reviewed_by_fkey(id, name, email), ' +
  'student:students(id, student_number, name)';

applicationsRouter.get('/:id', validate(idParamSchema, 'params'), async (req, res) => {
  const application = unwrap(
    await supabaseAdmin.from('applications').select(DETAIL_COLUMNS).eq('id', req.params.id).single(),
    'Application not found'
  );
  const withSignedFiles = await signApplicationFiles(application);
  res.json({ application: withSignedFiles });
});

applicationsRouter.patch('/:id', validate(idParamSchema, 'params'), validate(patchApplicationSchema), async (req, res) => {
  const { status, adminNotes } = req.body;

  const current = unwrap(
    await supabaseAdmin
      .from('applications')
      .select('*, intake:intakes(intake_number)')
      .eq('id', req.params.id)
      .single(),
    'Application not found'
  );

  const patch = {};
  if (status !== undefined) {
    patch.status = status;
    patch.reviewed_by = req.admin.id;
    patch.reviewed_at = new Date().toISOString();
  }
  if (adminNotes !== undefined) patch.admin_notes = adminNotes;

  // Approving is what actually grants access to the diary system: enroll
  // (or link to an already-existing) roster row in the same step, so there
  // is no separate manual "add student" action for an approved applicant.
  if (status === 'approved' && !current.enrolled_student_id) {
    patch.enrolled_student_id = await enrollApplicantAsStudent(current);
  }

  const application = unwrap(
    await supabaseAdmin.from('applications').update(patch).eq('id', req.params.id).select(DETAIL_COLUMNS).single(),
    'Application not found'
  );
  res.json({ application });
});
