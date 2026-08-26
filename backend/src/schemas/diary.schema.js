import { z } from 'zod';

const MAX_CONTENT_LENGTH = 120_000;

export const weekParamSchema = z.object({
  week: z.coerce.number().int().min(1).max(104),
});

const tiptapNode = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(tiptapNode).optional(),
    text: z.string().optional(),
    marks: z
      .array(z.object({ type: z.string(), attrs: z.record(z.string(), z.unknown()).optional() }))
      .optional(),
  })
);

const tiptapDoc = z.object({
  type: z.literal('doc'),
  content: z.array(tiptapNode).default([]),
});

export const diaryContentSchema = z.object({
  content: tiptapDoc.refine((doc) => JSON.stringify(doc).length <= MAX_CONTENT_LENGTH, {
    message: 'Entry is too large',
  }),
  researchOptOut: z.boolean().optional(),
});
