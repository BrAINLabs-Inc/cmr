import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from './AppError.js';

const STUDENT_NUMBER_SEQUENCE_PAD = 4;
const MAX_STUDENT_NUMBER_ATTEMPTS = 3;

async function findStudentIdByEmail(email) {
  const { data, error } = await supabaseAdmin.from('students').select('id').ilike('email', email).maybeSingle();
  if (error) throw new AppError(500, error.message);
  return data?.id ?? null;
}

// Student numbers aren't collected on the application (they're an internal
// roster ID, not something an applicant would know), so generate the next
// one in sequence for this intake: INT{intake_number}-0001, -0002, ...
async function nextStudentNumber(prefix) {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('student_number')
    .ilike('student_number', `${prefix}%`);
  if (error) throw new AppError(500, error.message);

  const maxSequence = (data ?? []).reduce((max, row) => {
    const value = Number.parseInt(row.student_number.slice(prefix.length), 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);

  return `${prefix}${String(maxSequence + 1).padStart(STUDENT_NUMBER_SEQUENCE_PAD, '0')}`;
}

// Approving an application enrolls the applicant onto the same `students`
// roster that gates self-registration at /register. Idempotent: if the
// applicant's email already matches a roster row (re-approval, or they were
// already added another way), that row is reused instead of duplicated.
export async function enrollApplicantAsStudent(application) {
  const existingId = await findStudentIdByEmail(application.email);
  if (existingId) return existingId;

  const prefix = `INT${application.intake?.intake_number ?? 0}-`;

  for (let attempt = 0; attempt < MAX_STUDENT_NUMBER_ATTEMPTS; attempt++) {
    const studentNumber = await nextStudentNumber(prefix);
    const { data, error } = await supabaseAdmin
      .from('students')
      .insert({ student_number: studentNumber, name: application.full_name, email: application.email })
      .select('id')
      .single();

    if (!error) return data.id;

    if (error.code === '23505' && error.message.includes('idx_students_email')) {
      const racedId = await findStudentIdByEmail(application.email);
      if (racedId) return racedId;
    }
    if (error.code !== '23505') throw new AppError(500, error.message);
    // student_number collision (concurrent approval); loop and regenerate.
  }

  throw new AppError(409, 'Could not generate a unique student number. Add this student manually from the Students page.');
}
