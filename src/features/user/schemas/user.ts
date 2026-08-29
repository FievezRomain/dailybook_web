import { z } from 'zod';

export const subscriptionSchema = z.enum(['Free', 'Premium']);

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
});

export const openUserSessionSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  expotoken: z.string().trim().min(1).max(4096).nullable().optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
}).strict();

const pictureFilenameSchema = z.string().regex(/^[a-f0-9]{32}\.(?:jpg|png|webp)$/);

export const updateCurrentUserSchema = z.object({
  newEmail: z.string().trim().email().max(320).optional(),
  prenom: z.string().trim().min(1).max(100).optional(),
  image: pictureFilenameSchema.nullable().optional(),
}).strict().refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: 'Au moins une modification est requise.',
});

export const userPictureFilenameSchema = pictureFilenameSchema;
