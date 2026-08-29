import { z } from 'zod';

const positiveId = z.number().int().positive();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const backendDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}(?:[T ][^\s]+)?$/)
  .transform((value) => value.slice(0, 10));
const optionalDateSchema = backendDateSchema.nullable().optional().transform((value) => value ?? undefined);
const optionalTextSchema = z.string().nullable().optional().transform((value) => value ?? undefined);

export const objectiveIdSchema = z.coerce.number().int().positive();
export const subtaskIdSchema = z.coerce.number().int().positive();

export const objectiveSubtaskSchema = z.object({
  id: positiveId,
  etape: z.string(),
  state: z.boolean().nullable().optional().transform((value) => value ?? false),
  order: z.number().int().nullable().optional().transform((value) => value ?? undefined),
  objectif_id: positiveId.optional(),
});

export const objectiveSchema = z.object({
  id: positiveId,
  title: z.string(),
  temporalityobjectif: optionalTextSchema,
  datedebut: optionalDateSchema,
  datefin: optionalDateSchema,
  animaux: z.array(positiveId).default([]),
  sousetapes: z.array(objectiveSubtaskSchema).default([]),
}).strict();

export const objectiveListSchema = z.array(objectiveSchema);

export const objectiveSubtaskInputSchema = z.object({
  id: positiveId.optional(),
  etape: z.string().trim().min(1).max(500),
  state: z.boolean().optional().default(false),
  order: z.number().int().positive().optional(),
}).strict();

const objectiveMutationFields = {
  title: z.string().trim().min(1).max(255),
  temporalityobjectif: z.string().trim().min(1).max(100).nullable().optional(),
  datedebut: dateSchema.nullable().optional(),
  datefin: dateSchema.nullable().optional(),
  animaux: z.array(positiveId).default([]),
  sousetapes: z.array(objectiveSubtaskInputSchema).min(1),
} as const;

const validDateRange = (value: { datedebut?: string | null; datefin?: string | null }) =>
  !value.datedebut || !value.datefin || value.datedebut <= value.datefin;

export const createObjectiveSchema = z.object(objectiveMutationFields).strict().refine(
  validDateRange,
  { message: 'La date de fin doit suivre la date de début.', path: ['datefin'] },
);

export const updateObjectiveSchema = z.object({ ...objectiveMutationFields, id: positiveId }).strict().refine(
  validDateRange,
  { message: 'La date de fin doit suivre la date de début.', path: ['datefin'] },
);
export const subtaskStateSchema = z.object({ state: z.boolean() }).strict();
export const subtaskStateResponseSchema = z.object({ id: positiveId, state: z.boolean() }).strict();
