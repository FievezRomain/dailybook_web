import { z } from 'zod';
import { storedFilenameSchema } from '@/shared/schemas/file';

const optionalText = z.string().nullable().optional();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalDate = dateSchema.nullable().optional();
const optionalNumber = z.number().nullable().optional();

export const animalFilenameSchema = z.string().regex(/^[a-f0-9]{32}\.(?:jpg|png|webp)$/);

export const animalSchema = z.object({
  id: z.number().int().positive(),
  nom: optionalText,
  espece: optionalText,
  datenaissance: optionalDate,
  race: optionalText,
  taille: optionalNumber,
  poids: optionalNumber,
  sexe: optionalText,
  food: optionalText,
  quantity: optionalNumber,
  unity: optionalText,
  couleur: optionalText,
  nompere: optionalText,
  nommere: optionalText,
  email: optionalText,
  image: storedFilenameSchema.nullable().optional(),
  numeroidentification: optionalText,
  informations: optionalText,
  datearrivee: optionalDate,
  datedepart: optionalDate,
  datedeces: optionalDate,
  provenance: z.enum(['owner', 'shared']),
});

export const animalListSchema = z.array(animalSchema);

const animalMutationFields = {
  nom: optionalText,
  espece: optionalText,
  datenaissance: optionalDate,
  race: optionalText,
  taille: optionalNumber,
  poids: optionalNumber,
  sexe: optionalText,
  food: optionalText,
  quantity: optionalNumber,
  unity: optionalText,
  couleur: optionalText,
  nompere: optionalText,
  nommere: optionalText,
  image: animalFilenameSchema.nullable().optional(),
  numeroidentification: optionalText,
  informations: optionalText,
  datearrivee: optionalDate,
  datedepart: optionalDate,
} as const;

export const createAnimalSchema = z.object(animalMutationFields).strict();
export const updateAnimalSchema = z.object({ ...animalMutationFields, datedeces: optionalDate }).strict()
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'Au moins une modification est requise.',
  });

export const animalHistoryItemSchema = z.enum(['poids', 'taille', 'food', 'quantity']);
export const animalHistorySchema = z.object({
  id: z.number().int().positive(),
  idanimal: z.number().int().positive(),
  value: z.union([z.string(), z.number()]).nullable().optional(),
  unity: optionalText,
  datemodification: optionalDate,
  item: animalHistoryItemSchema,
});
export const backendAnimalHistoryListSchema = z.array(animalHistorySchema.omit({ item: true }));
export const animalHistoryListSchema = z.array(animalHistorySchema);
export const animalHistoryMutationSchema = z.object({
  item: animalHistoryItemSchema,
  value: z.union([z.string(), z.number()]).nullable().optional(),
  unity: optionalText,
  datemodification: optionalDate,
}).strict();

export const bodyPictureSchema = z.object({
  id: z.number().int().positive(),
  filename: animalFilenameSchema,
  date_enregistrement: dateSchema.nullable(),
  idanimal: z.number().int().positive(),
});
export const bodyPictureListSchema = z.array(bodyPictureSchema);
export const createBodyPictureSchema = z.object({
  filename: animalFilenameSchema,
  date_enregistrement: dateSchema.optional(),
}).strict();

export const positiveIdSchema = z.coerce.number().int().positive();
