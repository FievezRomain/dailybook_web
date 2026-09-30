import { z } from 'zod';
import { createWishSchema, updateWishSchema, wishSchema } from '../schemas/wish';
import type { ImageSigned } from '@/types/image';

export type Wish = z.infer<typeof wishSchema> & { imageSigned?: ImageSigned };
export type CreateWishInput = z.input<typeof createWishSchema>;
export type UpdateWishInput = z.input<typeof updateWishSchema>;
