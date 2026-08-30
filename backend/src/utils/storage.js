import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from './AppError.js';

export const APPLICATION_DOCUMENTS_BUCKET = 'application-documents';

const SIGNED_URL_TTL_SECONDS = 600;

// Temporary bypass: set SKIP_STORAGE_UPLOAD=true while the Supabase storage
// bucket isn't set up yet, so applications can still be submitted and
// reviewed without a working file store. Remove once the bucket is ready.
export async function uploadApplicationFile(applicationId, prefix, file) {
  const path = `${applicationId}/${prefix}`;
  const fileRef = { path, filename: file.originalname, mimeType: file.mimetype, sizeBytes: file.size };
  if (env.SKIP_STORAGE_UPLOAD) return fileRef;

  const { error } = await supabaseAdmin.storage
    .from(APPLICATION_DOCUMENTS_BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });

  if (error) throw new AppError(500, `Could not upload ${file.originalname}: ${error.message}`);

  return fileRef;
}

export async function deleteApplicationFiles(paths) {
  if (!paths.length || env.SKIP_STORAGE_UPLOAD) return;
  await supabaseAdmin.storage.from(APPLICATION_DOCUMENTS_BUCKET).remove(paths);
}

export async function signApplicationFile(fileRef) {
  if (!fileRef?.path) return null;
  if (env.SKIP_STORAGE_UPLOAD) return { ...fileRef, url: null };

  const { data, error } = await supabaseAdmin.storage
    .from(APPLICATION_DOCUMENTS_BUCKET)
    .createSignedUrl(fileRef.path, SIGNED_URL_TTL_SECONDS);

  if (error) return { ...fileRef, url: null };
  return { ...fileRef, url: data.signedUrl };
}

export async function signApplicationFiles(application) {
  const [degreeDocuments, paymentSlip] = await Promise.all([
    Promise.all((application.degree_documents ?? []).map(signApplicationFile)),
    signApplicationFile(application.payment_slip),
  ]);
  return { ...application, degree_documents: degreeDocuments, payment_slip: paymentSlip };
}
