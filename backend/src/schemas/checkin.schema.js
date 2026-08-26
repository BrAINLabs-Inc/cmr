import { z } from 'zod';

export const checkinWeekParamSchema = z.object({
  week: z.coerce.number().int().min(1).max(104),
});

const meditationCheckinSchema = z
  .object({
    practiced: z.boolean().optional(),
    minutes: z.coerce.number().int().min(0).max(1440).optional(),
    sessions: z.coerce.number().int().min(0).max(50).optional(),
    type: z.string().trim().max(100).optional(),
    reflection: z.string().trim().max(2000).optional(),
  })
  .partial();

const moodCheckinSchema = z
  .object({
    feeling: z.enum(['very_good', 'good', 'okay', 'not_great', 'difficult']).optional(),
    happiness: z.coerce.number().int().min(1).max(5).optional(),
    stress: z.coerce.number().int().min(1).max(5).optional(),
    calmness: z.coerce.number().int().min(1).max(5).optional(),
    sleepQuality: z.coerce.number().int().min(1).max(5).optional(),
    wellbeing: z.coerce.number().int().min(1).max(5).optional(),
  })
  .partial();

const goalCheckinSchema = z
  .object({
    intention: z.string().trim().max(500).optional(),
    outcome: z.enum(['not_started', 'partially_achieved', 'achieved', 'exceeded']).optional(),
  })
  .partial();

export const checkinBodySchema = z.object({
  checkin: z
    .object({
      meditation: meditationCheckinSchema.optional(),
      mood: moodCheckinSchema.optional(),
      gratitude: z.array(z.string().trim().max(300)).max(3).optional(),
      noticed: z.string().trim().max(3000).optional(),
      goal: goalCheckinSchema.optional(),
    })
    .partial(),
});
