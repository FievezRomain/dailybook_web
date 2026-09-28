import { z } from 'zod';

const positiveId = z.number().int().positive();
const optionalText = z.string().nullable().optional();

export const notificationIdSchema = z.coerce.number().int().positive();
export const notificationTypeSchema = z.enum(['group_member', 'group_animal', 'structure', 'system']);

export const backendNotificationSchema = z.object({
  id: positiveId,
  user_id: z.number().int().nonnegative().nullable().optional(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  object_id: positiveId,
  is_read: z.boolean(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
  email: optionalText,
  action_available: z.boolean().optional().default(false),
  proposed_by: optionalText,
});

export const notificationSchema = backendNotificationSchema.pick({
  id: true,
  type: true,
  title: true,
  message: true,
  object_id: true,
  is_read: true,
  created_at: true,
  action_available: true,
  proposed_by: true,
});

export const backendNotificationsResponseSchema = z.object({
  notifications: z.array(backendNotificationSchema),
  unreadCount: z.number().int().nonnegative(),
});

export const notificationsResponseSchema = z.object({
  notifications: z.array(notificationSchema),
  unreadCount: z.number().int().nonnegative(),
});

export const setNotificationReadSchema = z.object({ is_read: z.boolean() }).strict();

export const updateNotificationPreferencesSchema = z.object({
  dailyReminderEnabled: z.boolean(),
}).strict();

export const backendNotificationPreferencesSchema = z.object({
  daily_reminder_enabled: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  dailyReminderEnabled: z.boolean(),
});
