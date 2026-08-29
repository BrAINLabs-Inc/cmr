import { z } from 'zod';

const stringArray = z.array(z.string().trim().min(1)).default([]);

const intakeFields = {
  intakeNumber: z.coerce.number().int().positive(),
  courseTitle: z.string().trim().min(1).max(300).optional(),
  status: z.enum(['upcoming', 'open', 'closed']).default('upcoming'),

  applicationClosingDate: z.string().date().optional().nullable(),
  closingDateNote: z.string().trim().max(100).optional().nullable(),
  commencingDate: z.string().date().optional().nullable(),
  durationText: z.string().trim().max(300).optional().nullable(),
  modeText: z.string().trim().max(300).optional().nullable(),
  lectureScheduleText: z.string().trim().max(300).optional().nullable(),

  modules: stringArray,
  objectives: stringArray,
  eligibilityText: z.string().trim().max(2000).optional().nullable(),
  eligibilitySpecialCategory: z.string().trim().max(500).optional().nullable(),

  feeCourse: z.string().trim().max(300).optional().nullable(),
  feeApplicationLocal: z.string().trim().max(100).optional().nullable(),
  feeApplicationForeign: z.string().trim().max(100).optional().nullable(),
  feeRegistrationLocal: z.string().trim().max(100).optional().nullable(),
  feeRegistrationForeign: z.string().trim().max(100).optional().nullable(),

  paymentOnlinePortalUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal('')),
  paymentBankName: z.string().trim().max(200).optional().nullable(),
  paymentAccountHolderName: z.string().trim().max(200).optional().nullable(),
  paymentReferenceCode: z.string().trim().max(100).optional().nullable(),

  contactEmail: z.string().trim().toLowerCase().email().optional().nullable().or(z.literal('')),
  contactWebsiteUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal('')),
  academicProgrammeUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal('')),
  fundedBy: z.string().trim().max(200).optional().nullable(),
};

export const createIntakeSchema = z.object(intakeFields);

export const patchIntakeSchema = z
  .object({
    ...Object.fromEntries(Object.entries(intakeFields).map(([k, v]) => [k, v.optional()])),
    isPublished: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
