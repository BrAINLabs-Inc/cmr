import { z } from 'zod';

const yesNo = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === 'true'));

export const submitApplicationSchema = z
  .object({
    title: z.string().trim().max(50).optional(),
    fullName: z.string().trim().min(1).max(200),
    nameWithInitials: z.string().trim().min(1).max(100),
    residentialAddress: z.string().trim().min(1).max(1000),
    dateOfBirth: z.string().date(),
    gender: z.enum(['male', 'female', 'prefer_not_to_say']),
    nicOrPassport: z.string().trim().min(1).max(50),
    email: z.string().trim().toLowerCase().email(),
    phoneNumber: z.string().trim().min(1).max(30),
    whatsappNumber: z.string().trim().max(30).optional(),

    currentOccupation: z.string().trim().min(1).max(300),
    educationQualification: z.enum(['undergraduate', 'bachelor', 'master', 'mphil', 'phd', 'other']),
    educationQualificationOther: z.string().trim().max(200).optional(),
    degreeName: z.string().trim().min(1).max(300),
    reasonForJoining: z.string().trim().max(3000).optional(),
    hasMeditationExperience: yesNo,
    howHeard: z.enum(['social_media', 'website', 'friends', 'other']),
    howHeardOther: z.string().trim().max(200).optional(),
  })
  .refine((v) => v.educationQualification !== 'other' || Boolean(v.educationQualificationOther), {
    message: 'Please specify your education qualification.',
    path: ['educationQualificationOther'],
  })
  .refine((v) => v.howHeard !== 'other' || Boolean(v.howHeardOther), {
    message: 'Please specify how you heard about the course.',
    path: ['howHeardOther'],
  });

export const listApplicationsQuerySchema = z.object({
  intakeId: z.string().uuid().optional(),
  status: z.enum(['submitted', 'under_review', 'approved', 'rejected', 'waitlisted']).optional(),
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(50),
});

export const exportApplicationsQuerySchema = z.object({
  intakeId: z.string().uuid().optional(),
  status: z.enum(['submitted', 'under_review', 'approved', 'rejected', 'waitlisted']).optional(),
  q: z.string().trim().max(200).optional(),
});

export const patchApplicationSchema = z
  .object({
    status: z.enum(['submitted', 'under_review', 'approved', 'rejected', 'waitlisted']).optional(),
    adminNotes: z.string().trim().max(3000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
