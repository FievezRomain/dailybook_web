import { z } from 'zod';
import { storedFilenameSchema } from '@/shared/schemas/file';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalDate = dateSchema.nullable().optional().transform((value) => value ?? undefined);
const optionalText = z.string().nullable().optional().transform((value) => value ?? undefined);
const optionalNumber = z.number().nullable().optional().transform((value) => value ?? undefined);
const requiredText = z.string().nullable().optional().transform((value) => value ?? '');
const positiveId = z.number().int().positive();

export const eventFileNameSchema = z.string().regex(/^[a-f0-9]{32}\.(?:jpg|png|pdf)$/);
export const recurrenceScopeSchema = z.enum(['occurrence', 'following', 'series']);

const userRefSchema = z.object({ id: positiveId, name: optionalText, email: z.string().email() });
const groupRefSchema = z.union([
  positiveId.transform((id) => ({ id, name: undefined })),
  z.object({ id: positiveId, name: optionalText }),
]);
const documentSchema = z.union([
  storedFilenameSchema.transform((name) => ({ name })),
  z.object({ name: storedFilenameSchema }),
]);

export const eventSchema = z.object({
  id: positiveId,
  nom: requiredText,
  dateevent: dateSchema,
  animaux: z.array(positiveId).default([]),
  eventtype: requiredText,
  state: requiredText,
  heuredebutevent: optionalText,
  lieu: optionalText,
  specialiste: optionalText,
  depense: optionalNumber,
  categoriedepense: optionalText,
  heuredebutbalade: optionalText,
  datefinbalade: optionalDate,
  heurefinbalade: optionalText,
  discipline: optionalText,
  note: z.number().min(1).max(5).nullable().optional().transform((value) => value ?? undefined),
  epreuve: optionalText,
  dossart: optionalText,
  placement: optionalText,
  traitement: optionalText,
  datefinsoins: optionalDate,
  commentaire: optionalText,
  frequencetype: optionalText,
  frequencevalue: optionalText,
  idparent: positiveId.nullable().optional().transform((value) => value ?? undefined),
  optionnotification: optionalText,
  rappelnotification: optionalText,
  documents: z.array(documentSchema).default([]),
  shared_groups: z.array(groupRefSchema).nullable().optional().transform((value) => value ?? []),
  created_by: userRefSchema.nullable().optional().transform((value) => value ?? undefined),
  made_by: userRefSchema.nullable().optional().transform((value) => value ?? undefined),
  todisplay: z.boolean().nullable().optional().transform((value) => value ?? true),
});
export const eventListSchema = z.array(eventSchema);

const eventMutationFields = {
  nom: z.string().trim().min(1).max(255),
  dateevent: dateSchema,
  animaux: z.array(positiveId).min(1),
  eventtype: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100).optional(),
  heuredebutevent: optionalText,
  lieu: optionalText,
  specialiste: optionalText,
  depense: z.number().nonnegative().nullable().optional(),
  categoriedepense: optionalText,
  notif: optionalText,
  optionnotif: optionalText,
  rappelnotification: optionalText,
  heuredebutbalade: optionalText,
  datefinbalade: optionalDate,
  heurefinbalade: optionalText,
  discipline: optionalText,
  note: z.number().min(1).max(5).nullable().optional(),
  epreuve: optionalText,
  dossart: optionalText,
  placement: optionalText,
  traitement: optionalText,
  datefinsoins: optionalDate,
  commentaire: optionalText,
  todisplay: z.boolean().optional(),
  frequencetype: optionalText,
  frequencevalue: optionalText,
  idparent: positiveId.nullable().optional(),
  documents: z.array(eventFileNameSchema).default([]),
  shared_groups: z.array(positiveId).default([]),
} as const;

export const createEventSchema = z.object(eventMutationFields).strict();
export const updateEventSchema = z.object({ ...eventMutationFields, update_scope: recurrenceScopeSchema }).strict();
export const patchEventSchema = z.object({
  state: optionalText,
  commentaire: optionalText,
  note: z.number().min(1).max(5).nullable().optional(),
  depense: z.number().nonnegative().nullable().optional(),
  placement: optionalText,
  animaux: z.array(positiveId).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, { message: 'Au moins une modification est requise.' });

export const eventHighlightSchema = z.object({
  id: z.string().min(1),
  date: dateSchema,
  kind: z.enum(['animal_birthday', 'annual_reminder']),
  title: z.string().min(1),
  animal_ids: z.array(positiveId),
  source_event_id: positiveId.optional(),
});
export const eventHighlightListSchema = z.array(eventHighlightSchema);
export const highlightYearSchema = z.coerce.number().int().min(2000).max(2100);
export const eventIdSchema = z.coerce.number().int().positive();
