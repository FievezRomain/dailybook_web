import { z } from 'zod';
import { STORAGE_TEXT_LIMITS } from '@/shared/constants/storage-limits';

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
  nom: z.string().trim().min(1).max(STORAGE_TEXT_LIMITS.contact),
  profession: z.string().trim().max(STORAGE_TEXT_LIMITS.contact).nullable().optional(),
  telephone: z.string().trim().max(STORAGE_TEXT_LIMITS.contact).nullable().optional(),
  email_contact: z.string().trim().email().max(STORAGE_TEXT_LIMITS.contact).nullable().optional(),
} as const;

export const createContactSchema = z.object(contactMutationFields).strict();
export const updateContactSchema = z.object(contactMutationFields).strict();
