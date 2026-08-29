import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { validate } from '../../middleware/validate.js';
import { unwrap } from '../../utils/db.js';
import { AppError } from '../../utils/AppError.js';
import { currentWeekNumber } from '../../utils/weeks.js';
import { nameEmailIdSearchFilter } from '../../utils/students.js';
import {
  listStudentsQuerySchema,
  createStudentSchema,
  bulkCreateStudentsSchema,
  patchStudentSchema,
  idParamSchema,
} from '../../schemas/admin.schema.js';

export const studentsRouter = Router();

studentsRouter.get('/students', validate(listStudentsQuerySchema, 'query'), async (req, res) => {
  const { q, status, page, pageSize } = req.query;

  let query = supabaseAdmin.from('students').select('*', { count: 'exact' }).order('name');
  if (status) query = query.eq('status', status);
  if (q) query = query.or(nameEmailIdSearchFilter(q));

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message);

  res.json({ students: data, total: count ?? data.length, page, pageSize });
});

studentsRouter.post('/students', validate(createStudentSchema), async (req, res) => {
  const { studentNumber, name, email } = req.body;

  const student = unwrap(
    await supabaseAdmin.from('students').insert({ student_number: studentNumber, name, email }).select('*').single()
  );
  res.status(201).json({ student });
});

studentsRouter.post('/students/bulk', validate(bulkCreateStudentsSchema), async (req, res) => {
  const rows = req.body.students.map((s) => ({
    student_number: s.studentNumber,
    name: s.name,
    email: s.email,
  }));

  const students = unwrap(await supabaseAdmin.from('students').insert(rows).select('*'));
  res.status(201).json({ students });
});

studentsRouter.patch(
  '/students/:id',
  validate(idParamSchema, 'params'),
  validate(patchStudentSchema),
  async (req, res) => {
    const { status, name, email, studentNumber } = req.body;
    const patch = {};
    if (status) patch.status = status;
    if (name) patch.name = name;
    if (email) patch.email = email;
    if (studentNumber) patch.student_number = studentNumber;

    const student = unwrap(
      await supabaseAdmin.from('students').update(patch).eq('id', req.params.id).select('*').single(),
      'Student not found'
    );
    res.json({ student });
  }
);

studentsRouter.get('/students/:id/checkins', validate(idParamSchema, 'params'), async (req, res) => {
  const checkins = unwrap(
    await supabaseAdmin
      .from('weekly_checkins')
      .select('id, week_number, checkin, created_at, updated_at')
      .eq('student_id', req.params.id)
      .order('week_number', { ascending: false })
  );
  res.json({ checkins });
});

studentsRouter.get('/students/:id/pending-weeks', validate(idParamSchema, 'params'), async (req, res) => {
  const settings = unwrap(await supabaseAdmin.from('course_settings').select('*').eq('id', 1).single());
  const current = currentWeekNumber(settings);

  const entries = unwrap(
    await supabaseAdmin.from('diary_entries').select('week_number, status').eq('student_id', req.params.id)
  );

  const submittedWeeks = new Set(entries.filter((e) => e.status === 'submitted').map((e) => e.week_number));
  const pendingWeeks = Array.from({ length: current }, (_, i) => i + 1).filter((w) => !submittedWeeks.has(w));

  res.json({ pendingWeeks });
});
