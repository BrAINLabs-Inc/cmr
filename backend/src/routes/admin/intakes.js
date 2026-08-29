import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { validate } from '../../middleware/validate.js';
import { unwrap } from '../../utils/db.js';
import { AppError } from '../../utils/AppError.js';
import { createIntakeSchema, patchIntakeSchema, idParamSchema } from '../../schemas/intakes.schema.js';

// Auth/admin guarding is applied once by the parent router (see ./index.js).
export const intakesRouter = Router();

const CAMEL_TO_COLUMN = {
  intakeNumber: 'intake_number',
  courseTitle: 'course_title',
  status: 'status',
  isPublished: 'is_published',
  applicationClosingDate: 'application_closing_date',
  closingDateNote: 'closing_date_note',
  commencingDate: 'commencing_date',
  durationText: 'duration_text',
  modeText: 'mode_text',
  lectureScheduleText: 'lecture_schedule_text',
  modules: 'modules',
  objectives: 'objectives',
  eligibilityText: 'eligibility_text',
  eligibilitySpecialCategory: 'eligibility_special_category',
  feeCourse: 'fee_course',
  feeApplicationLocal: 'fee_application_local',
  feeApplicationForeign: 'fee_application_foreign',
  feeRegistrationLocal: 'fee_registration_local',
  feeRegistrationForeign: 'fee_registration_foreign',
  paymentOnlinePortalUrl: 'payment_online_portal_url',
  paymentBankName: 'payment_bank_name',
  paymentAccountHolderName: 'payment_account_holder_name',
  paymentReferenceCode: 'payment_reference_code',
  contactEmail: 'contact_email',
  contactWebsiteUrl: 'contact_website_url',
  academicProgrammeUrl: 'academic_programme_url',
  fundedBy: 'funded_by',
};

function toRow(body) {
  const row = {};
  for (const [camel, column] of Object.entries(CAMEL_TO_COLUMN)) {
    if (body[camel] === undefined) continue;
    row[column] = body[camel] === '' ? null : body[camel];
  }
  return row;
}

intakesRouter.get('/', async (req, res) => {
  const intakes = unwrap(
    await supabaseAdmin
      .from('intakes')
      .select('*, applications(count)')
      .order('intake_number', { ascending: false })
  );
  const withCounts = intakes.map((i) => ({
    ...i,
    application_count: i.applications?.[0]?.count ?? 0,
    applications: undefined,
  }));
  res.json({ intakes: withCounts });
});

intakesRouter.post('/', validate(createIntakeSchema), async (req, res) => {
  const row = toRow(req.body);
  row.created_by = req.admin.id;

  const intake = unwrap(await supabaseAdmin.from('intakes').insert(row).select('*').single());
  res.status(201).json({ intake });
});

intakesRouter.get('/:id', validate(idParamSchema, 'params'), async (req, res) => {
  const intake = unwrap(
    await supabaseAdmin.from('intakes').select('*').eq('id', req.params.id).single(),
    'Intake not found'
  );
  res.json({ intake });
});

intakesRouter.patch('/:id', validate(idParamSchema, 'params'), validate(patchIntakeSchema), async (req, res) => {
  const row = toRow(req.body);

  if (row.is_published) {
    await supabaseAdmin.from('intakes').update({ is_published: false }).neq('id', req.params.id).eq('is_published', true);
  }

  const intake = unwrap(
    await supabaseAdmin.from('intakes').update(row).eq('id', req.params.id).select('*').single(),
    'Intake not found'
  );
  res.json({ intake });
});

intakesRouter.delete('/:id', validate(idParamSchema, 'params'), async (req, res) => {
  const { count } = await supabaseAdmin
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('intake_id', req.params.id);

  if (count) {
    throw new AppError(409, 'This intake has applications and cannot be deleted.');
  }

  await supabaseAdmin.from('intakes').delete().eq('id', req.params.id);
  res.status(204).send();
});
