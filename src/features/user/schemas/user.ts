import { z } from 'zod';
import { STORAGE_TEXT_LIMITS } from '@/shared/constants/storage-limits';

export const subscriptionSchema = z.enum(['Free', 'Premium', 'Pioneer']);

export const backendSessionSchema = z.object({
  subscription: subscriptionSchema,
});

export const backendUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  prenom: z.string().nullable(),
  filename: z.string().nullable().optional(),
  expotoken: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  daily_reminder_enabled: z.boolean().optional().default(true),
  subscription: subscriptionSchema,
  subscription_date_fin: z.string().nullable().optional(),
});

export const currentUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  email: z.string().email(),
  picture: z.string().nullable(),
  expotoken: z.string().nullable(),
  timezone: z.string().nullable(),
  dailyReminderEnabled: z.boolean(),
  subscription: subscriptionSchema,
  subscriptionEndDate: z.string().nullable().optional().default(null),
});

export const openUserSessionSchema = z.object({
  firstName: z.string().trim().min(1).max(STORAGE_TEXT_LIMITS.accountFirstName).optional(),
  expotoken: z.string().trim().min(1).max(STORAGE_TEXT_LIMITS.accountExpoToken).nullable().optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
}).strict();

const pictureFilenameSchema = z.string().regex(/^[a-f0-9]{32}\.(?:jpg|png|webp)$/);

export const updateCurrentUserSchema = z.object({
  newEmail: z.string().trim().email().max(STORAGE_TEXT_LIMITS.accountEmail).optional(),
  prenom: z.string().trim().min(1).max(STORAGE_TEXT_LIMITS.accountFirstName).optional(),
  image: pictureFilenameSchema.nullable().optional(),
}).strict().refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: 'Au moins une modification est requise.',
});

export const userPictureFilenameSchema = pictureFilenameSchema;
