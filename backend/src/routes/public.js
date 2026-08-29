import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { supabaseAdmin } from '../config/supabase.js';
import { validate } from '../middleware/validate.js';
import { applicationLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';
import { unwrap } from '../utils/db.js';
import { getPublishedIntake } from '../utils/intakes.js';
import { uploadApplicationFile, deleteApplicationFiles } from '../utils/storage.js';
import { submitApplicationSchema } from '../schemas/applications.schema.js';

export const publicRouter = Router();

const PUBLIC_INTAKE_COLUMNS =
  'id, intake_number, course_title, status, application_closing_date, closing_date_note, commencing_date, ' +
  'duration_text, mode_text, lecture_schedule_text, modules, objectives, eligibility_text, ' +
  'eligibility_special_category, fee_course, fee_application_local, fee_application_foreign, ' +
  'fee_registration_local, fee_registration_foreign, payment_online_portal_url, payment_bank_name, ' +
  'payment_account_holder_name, payment_reference_code, contact_email, contact_website_url, ' +
  'academic_programme_url, funded_by';

publicRouter.get('/intake', async (req, res) => {
  const intake = await getPublishedIntake(PUBLIC_INTAKE_COLUMNS);
  res.json({ intake: intake ?? null });
});

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_DEGREE_DOCUMENTS = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_DEGREE_DOCUMENTS + 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new AppError(400, `Unsupported file type: ${file.originalname}`));
    }
    cb(null, true);
  },
});

function fileExtension(file) {
  const fromName = path.extname(file.originalname);
  return fromName || '';
}

publicRouter.post(
  '/applications',
  applicationLimiter,
  upload.fields([
    { name: 'degreeDocuments', maxCount: MAX_DEGREE_DOCUMENTS },
    { name: 'paymentSlip', maxCount: 1 },
  ]),
  validate(submitApplicationSchema),
  async (req, res) => {
    const degreeDocuments = req.files?.degreeDocuments ?? [];
    const paymentSlipFiles = req.files?.paymentSlip ?? [];

    if (degreeDocuments.length === 0) {
      throw new AppError(400, 'Please upload at least one degree certificate, transcript, or confirmation letter.');
    }
    if (paymentSlipFiles.length !== 1) {
      throw new AppError(400, 'Please upload exactly one payment slip.');
    }

    const intake = await getPublishedIntake('id, status');
    if (!intake || intake.status !== 'open') {
      throw new AppError(400, 'Applications are not currently open.');
    }

    const applicationId = randomUUID();

    // Uploads run in parallel for speed, but Promise.all would discard the
    // paths of files that *did* upload if a sibling upload fails — settle
    // instead so a partial failure can still be cleaned up from storage.
    const uploadResults = await Promise.allSettled([
      ...degreeDocuments.map((file, index) =>
        uploadApplicationFile(applicationId, `degree-${index + 1}${fileExtension(file)}`, file)
      ),
      uploadApplicationFile(applicationId, `payment-slip${fileExtension(paymentSlipFiles[0])}`, paymentSlipFiles[0]),
    ]);

    const uploadedPaths = uploadResults.filter((r) => r.status === 'fulfilled').map((r) => r.value.path);
    const failedUpload = uploadResults.find((r) => r.status === 'rejected');
    if (failedUpload) {
      await deleteApplicationFiles(uploadedPaths).catch(() => {});
      throw failedUpload.reason;
    }

    const uploadedDegreeDocs = uploadResults.slice(0, degreeDocuments.length).map((r) => r.value);
    const paymentSlipRef = uploadResults[uploadResults.length - 1].value;

    try {
      const b = req.body;
      const application = unwrap(
        await supabaseAdmin
          .from('applications')
          .insert({
            id: applicationId,
            intake_id: intake.id,
            title: b.title || null,
            full_name: b.fullName,
            name_with_initials: b.nameWithInitials,
            residential_address: b.residentialAddress,
            date_of_birth: b.dateOfBirth,
            gender: b.gender,
            nic_or_passport: b.nicOrPassport,
            email: b.email,
            phone_number: b.phoneNumber,
            whatsapp_number: b.whatsappNumber || b.phoneNumber,
            current_occupation: b.currentOccupation,
            education_qualification: b.educationQualification,
            education_qualification_other: b.educationQualificationOther || null,
            degree_name: b.degreeName,
            degree_documents: uploadedDegreeDocs,
            reason_for_joining: b.reasonForJoining || null,
            has_meditation_experience: b.hasMeditationExperience ?? null,
            how_heard: b.howHeard,
            how_heard_other: b.howHeardOther || null,
            payment_slip: paymentSlipRef,
          })
          .select('id')
          .single()
      );

      res.status(201).json({ applicationId: application.id, reference: application.id.slice(0, 8).toUpperCase() });
    } catch (err) {
      await deleteApplicationFiles(uploadedPaths).catch(() => {});
      throw err;
    }
  }
);
