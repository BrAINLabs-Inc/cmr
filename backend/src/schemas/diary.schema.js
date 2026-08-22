import { z } from 'zod';

// A weekly diary entry is a reflective free-write, not a document upload —
// this cap just guards against pathological payloads, not real usage.
const MAX_CONTENT_LENGTH = 20_000;

export const weekParamSchema = z.object({
  week: z.coerce.number().int().min(1).max(104),
});

export const diaryContentSchema = z.object({
  content: z.string().max(MAX_CONTENT_LENGTH, `Entry must be under ${MAX_CONTENT_LENGTH} characters`),
});
