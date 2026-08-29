import type { z } from 'zod';
import type { ImageSigned } from '@/types/image';
import type {
  animalHistoryItemSchema,
  animalHistorySchema,
  animalSchema,
  bodyPictureSchema,
  createAnimalSchema,
  updateAnimalSchema,
} from '../schemas/animal';

export type Animal = z.infer<typeof animalSchema> & { imageSigned?: ImageSigned };
export type AnimalBodyPicture = z.infer<typeof bodyPictureSchema> & { imageSigned?: ImageSigned };
export type AnimalHistory = z.infer<typeof animalHistorySchema>;
export type AnimalHistoryItem = z.infer<typeof animalHistoryItemSchema>;
export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;
