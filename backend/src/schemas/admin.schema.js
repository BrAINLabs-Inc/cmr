import { z } from 'zod';

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(200),
};

export const listStudentsQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  ...pagination,
});

export const createStudentSchema = z.object({
  studentNumber: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email(),
});

export const bulkCreateStudentsSchema = z.object({
  students: z.array(createStudentSchema).min(1).max(1000),
});

export const patchStudentSchema = z
  .object({
    status: z.enum(['active', 'inactive']).optional(),
    name: z.string().trim().min(1).max(200).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    studentNumber: z.string().trim().min(1).max(64).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const listEntriesQuerySchema = z.object({
  week: z.coerce.number().int().min(1).max(104).optional(),
  status: z.enum(['draft', 'submitted']).optional(),
  studentId: z.string().uuid().optional(),
  ...pagination,
});

export const exportQuerySchema = z.object({
  week: z.coerce.number().int().min(1).max(104).optional(),
  status: z.enum(['draft', 'submitted']).optional(),
  deidentified: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export const weeklyStatsQuerySchema = z.object({
  week: z.coerce.number().int().min(1).max(104).optional(),
});

export const courseSettingsPatchSchema = z
  .object({
    courseStartDate: z.string().date().optional(),
    totalWeeks: z.coerce.number().int().min(1).max(104).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });
