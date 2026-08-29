import { z } from 'zod';

const positiveId = z.number().int().positive();
const optionalText = z.string().nullable().optional().transform((value) => value ?? undefined);

export const contactIdSchema = z.coerce.number().int().positive();

export const contactSchema = z.object({
  id: positiveId,
  nom: z.string(),
  profession: optionalText,
  telephone: optionalText,
  email: optionalText,
  emailproprietaire: optionalText,
});

export const contactListSchema = z.array(contactSchema);

const contactMutationFields = {
  nom: z.string().trim().min(1).max(255),
  profession: z.string().trim().max(255).nullable().optional(),
  telephone: z.string().trim().max(50).nullable().optional(),
  email_contact: z.string().trim().email().max(320).nullable().optional(),
} as const;

export const createContactSchema = z.object(contactMutationFields).strict();
export const updateContactSchema = z.object(contactMutationFields).strict();
