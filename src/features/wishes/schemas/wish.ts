import { z } from 'zod';
import { storedFilenameSchema } from '@/shared/schemas/file';

const positiveId = z.number().int().positive();
const optionalText = z.string().nullable().optional().transform((value) => value ?? undefined);
const safeUrl = z.string().trim().url().max(2_048).refine(
  (value) => ['http:', 'https:'].includes(new URL(value).protocol),
  'Seules les URLs HTTP et HTTPS sont autorisées.',
);

export const wishIdSchema = z.coerce.number().int().positive();
export const wishFilenameSchema = z.string().regex(/^[a-f0-9]{32}\.(?:jpg|png|webp)$/);

const priceSchema = z.union([z.string(), z.number()]).nullable().optional().transform((value) => value == null ? undefined : String(value));

export const wishSchema = z.object({
  id: positiveId,
  nom: optionalText,
  url: safeUrl.nullable().optional().transform((value) => value ?? undefined),
  prix: priceSchema,
  destinataire: optionalText,
  image: storedFilenameSchema.nullable().optional().transform((value) => value ?? undefined),
  acquis: z.boolean().nullable().optional().transform((value) => value ?? false),
  email: z.string().email().nullable().optional(),
});

export const wishListSchema = z.array(wishSchema);

const wishMutationFields = {
  nom: z.string().trim().min(1).max(255),
  url: safeUrl.nullable().optional(),
  prix: z.string().trim().regex(/^\d{1,7}(?:[.,]\d{1,2})?$/).nullable().optional(),
  destinataire: z.string().trim().min(1).max(255).nullable().optional(),
  image: wishFilenameSchema.nullable().optional(),
} as const;

export const createWishSchema = z.object(wishMutationFields).strict();
export const updateWishSchema = z.object({ ...wishMutationFields, acquis: z.boolean() }).strict();
