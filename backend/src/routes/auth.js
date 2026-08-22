import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerLimiter } from '../middleware/rateLimit.js';
import { registerSchema } from '../schemas/auth.schema.js';
import { AppError } from '../utils/AppError.js';
import { unwrap } from '../utils/db.js';
import { escapeLikeValue } from '../utils/text.js';

export const authRouter = Router();

/**
 * First-time student registration. Students already exist as a roster row
 * (loaded by an admin) but have no Supabase Auth account yet. This endpoint
 * checks the email + student number match a roster row before creating the
 * auth account, enforcing "only registered course students can access".
 */
authRouter.post('/register', registerLimiter, validate(registerSchema), async (req, res) => {
  const { email, studentNumber, password } = req.body;

  const student = unwrap(
    await supabaseAdmin.from('students').select('*').ilike('email', escapeLikeValue(email)).maybeSingle()
  );

  if (!student || student.student_number.toLowerCase() !== studentNumber.toLowerCase()) {
    throw new AppError(
      404,
      'No matching student record found. Check your email and student ID, or contact CMR staff.'
    );
  }
  if (student.status !== 'active') {
    throw new AppError(403, 'This student record is not active. Contact CMR staff.');
  }
  if (student.auth_user_id) {
    throw new AppError(409, 'An account already exists for this email. Please log in.');
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: student.email,
    password,
    email_confirm: true,
  });

  if (createError) {
    throw new AppError(400, createError.message);
  }

  unwrap(
    await supabaseAdmin.from('students').update({ auth_user_id: created.user.id }).eq('id', student.id)
  );

  res.status(201).json({ ok: true });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  if (req.admin) {
    return res.json({ role: 'admin', profile: req.admin });
  }
  res.json({ role: 'student', profile: req.student });
});
