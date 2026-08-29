import { z } from 'zod';

const positiveId = z.number().int().positive();
const nullableDateTime = z.string().datetime({ offset: true }).nullable().optional().transform((value) => value ?? undefined);

export const noteIdSchema = z.coerce.number().int().positive();

export const noteSchema = z.object({
  id: positiveId,
  titre: z.string().nullable().transform((value) => value ?? ''),
  note: z.string().nullable().transform((value) => value ?? ''),
  is_pinned: z.boolean().default(false),
  created_at: nullableDateTime,
  updated_at: nullableDateTime,
  content_format: z.literal('markdown').default('markdown'),
  email: z.string().email().nullable().optional(),
});

export const noteListSchema = z.array(noteSchema);

const noteMutationFields = {
  titre: z.string().trim().min(1).max(255),
  note: z.string().max(50_000).optional().default(''),
  is_pinned: z.boolean().optional().default(false),
} as const;

export const createNoteSchema = z.object(noteMutationFields).strict();
export const updateNoteSchema = z.object(noteMutationFields).strict();
