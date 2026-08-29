import { z } from 'zod';
import { createWishSchema, updateWishSchema, wishSchema } from '../schemas/wish';

export type Wish = z.infer<typeof wishSchema>;
export type CreateWishInput = z.input<typeof createWishSchema>;
export type UpdateWishInput = z.input<typeof updateWishSchema>;
